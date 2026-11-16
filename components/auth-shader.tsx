"use client";

import { useEffect, useRef } from "react";

const VERTEX = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

export type AuthShaderVariant = "ribbons" | "contours";

// Uniforms and noise shared by both variants. Colours come from the theme tokens so the panel
// follows light/dark mode.
const COMMON = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
// Theme colours, read from the CSS tokens at runtime.
uniform vec3 u_base;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;
// 0 → 1 intro fade; 0 renders the plain panel background.
uniform float u_fade;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

// 4 octaves: smooth, broad shapes.
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

// 5 octaves: enough small-scale detail for convincing terrain.
float fbm5(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}
`;

// Domain-warped FBM folded into luminous ribbons that drift diagonally.
const RIBBONS = `
vec3 palette(float x) {
  x = fract(x) * 3.0;
  if (x < 1.0) return mix(u_c1, u_c2, smoothstep(0.0, 1.0, x));
  if (x < 2.0) return mix(u_c2, u_c3, smoothstep(1.0, 2.0, x));
  return mix(u_c3, u_c1, smoothstep(2.0, 3.0, x));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float t = u_time * 0.04;

  // Tilt so the ribbons sweep diagonally, then stretch along the flow for long silky folds.
  p = mat2(0.86, 0.5, -0.5, 0.86) * p;
  p.x *= 0.35;

  // Two levels of domain warping on low-octave FBM keep the folds smooth.
  vec2 q = vec2(
    fbm(p * 1.2 + vec2(0.0, t)),
    fbm(p * 1.2 + vec2(3.1, 7.4) - t)
  );
  vec2 r = vec2(
    fbm(p * 1.8 + 2.0 * q + vec2(1.7, 9.2) + t * 1.3),
    fbm(p * 1.8 + 2.0 * q + vec2(8.3, 2.8) - t * 0.8)
  );

  float y = p.y * 4.2 + q.x * 2.6 + r.y * 1.6;

  // Broad ribbons, with fine strands running through them and a hot edge at each fold.
  float band = 0.5 + 0.5 * sin(y * 2.6);
  float body = pow(band, 1.6);
  float strands = 0.4 + 0.6 * pow(0.5 + 0.5 * sin(y * 16.0 + r.x * 6.0), 1.5);
  float edge = pow(band, 28.0);

  // Large-scale mask leaves pockets of black between ribbon bundles.
  float mask = smoothstep(0.22, 0.58, fbm(p * 0.7 + q * 0.8 - t * 0.5));

  vec3 col = palette(y * 0.11 + q.y * 0.6 + t);
  vec3 c = col * body * strands * mask * 2.3;
  c += mix(col, vec3(1.0), 0.3) * edge * mask * 1.8;

  // Subtle depth: dim toward the top-left corner.
  c *= 0.55 + 0.45 * smoothstep(0.0, 1.0, uv.x * 0.6 + (1.0 - uv.y) * 0.4 + 0.3);

  c = 1.0 - exp(-c * 1.6);
  // Screen-blend the ribbons over the panel background.
  vec3 lit = 1.0 - (1.0 - u_base) * (1.0 - c);
  gl_FragColor = vec4(mix(u_base, lit, u_fade), 1.0);
}
`;

// The same FBM read as a height map and drawn as topographic contour lines: thin minor lines,
// a brighter index line every fifth level, and faint hillshading for depth. Drifts very slowly.
const CONTOURS = `
float height(vec2 p, float t) {
  vec2 q = vec2(
    fbm(p * 0.9 + vec2(0.0, t)),
    fbm(p * 0.9 + vec2(5.2, 1.3) - t)
  );
  return fbm5(p * 0.75 + q * 1.3 + vec2(t * 0.6, -t * 0.3));
}

// Anti-aliased line coverage for the iso-lines of v, about px pixels wide.
float isoLine(float v, float px) {
  float d = abs(fract(v - 0.5) - 0.5);
#ifdef HAS_DERIVATIVES
  float w = fwidth(v);
#else
  float w = 0.02;
#endif
  return 1.0 - smoothstep(0.0, w * px, d);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y * 2.2;
  float t = u_time * 0.012;

  float h = height(p, t);
  float levels = h * 40.0;

  float minor = isoLine(levels, 1.0);
  float major = isoLine(levels / 5.0, 1.6);

  // Hillshade from the height gradient, lit from the top-right.
#ifdef HAS_DERIVATIVES
  vec2 g = vec2(dFdx(h), dFdy(h)) * u_res.y * 0.6;
  float shade = clamp(dot(normalize(vec3(-g, 1.0)), normalize(vec3(0.6, 0.7, 0.5))), 0.0, 1.0);
#else
  float shade = 0.75;
#endif

  // Higher ground is a touch brighter, so the eye reads peaks and valleys.
  float elev = smoothstep(0.25, 0.8, h);

  vec3 c = u_base;
  c = mix(c, u_c1, 0.35 * shade * (0.4 + 0.6 * elev));
  vec3 lineCol = mix(u_c3, mix(u_c3, vec3(1.0), 0.35), elev);
  c = mix(c, lineCol, minor * (0.16 + 0.22 * elev));
  c = mix(c, lineCol, major * (0.4 + 0.35 * elev));

  // Fade lines out toward the bottom-left, where the headline sits.
  float focus = smoothstep(-0.1, 0.9, uv.x * 0.5 + uv.y * 0.7);
  c = mix(u_base, c, 0.35 + 0.65 * focus);

  gl_FragColor = vec4(mix(u_base, c, u_fade), 1.0);
}
`;

const FRAGMENTS: Record<AuthShaderVariant, string> = { ribbons: RIBBONS, contours: CONTOURS };

// Theme tokens the shader is coloured with (see globals.css).
const TOKENS = ["--auth-panel-bg", "--auth-accent-solid", "--primary", "--auth-accent"] as const;

/** Resolves any CSS colour (hex, oklch, var chains) to 0–1 sRGB by painting it on a 1px canvas. */
function readThemeColors(el: Element): [number, number, number][] {
  const styles = getComputedStyle(el);
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  return TOKENS.map((token) => {
    if (!ctx) return [0, 0, 0];
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "#000";
    ctx.fillStyle = styles.getPropertyValue(token).trim() || "#000";
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255];
  });
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function AuthShader({
  className,
  variant = "ribbons",
}: {
  className?: string;
  variant?: AuthShaderVariant;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) return; // CSS gradient behind the canvas stays visible.

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    // Derivatives give resolution-independent line widths and hillshading; nearly universal in WebGL1.
    const hasDerivatives = !!gl.getExtension("OES_standard_derivatives");
    const header = hasDerivatives
      ? "#extension GL_OES_standard_derivatives : enable\n#define HAS_DERIVATIVES\n"
      : "";
    const fs = compile(gl, gl.FRAGMENT_SHADER, header + COMMON + FRAGMENTS[variant]);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    // One oversized triangle covers the viewport.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_res");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uFade = gl.getUniformLocation(program, "u_fade");
    const uColors = ["u_base", "u_c1", "u_c2", "u_c3"].map((n) => gl.getUniformLocation(program, n));

    const applyTheme = () => {
      readThemeColors(canvas).forEach((rgb, i) => gl.uniform3f(uColors[i], ...rgb));
    };
    applyTheme();

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // FBM is fill-rate heavy; cap resolution since the effect is soft anyway.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    let raf = 0;
    let visible = true;
    const start = performance.now();
    // Start partway in so the first frame already looks developed.
    const offset = 40;

    // The intro fade runs in the shader, timed from the second rendered frame: the first draw
    // is where the GPU finishes compiling, and that stall would otherwise eat the fade.
    const FADE_MS = 400;
    let framesDrawn = 0;
    let fadeStart = 0;
    let fade = reduceMotion ? 1 : 0;

    const draw = (now: number) => {
      resize();
      if (fade < 1) {
        if (framesDrawn === 1) fadeStart = now;
        const t = framesDrawn < 1 ? 0 : Math.min(1, (now - fadeStart) / FADE_MS);
        fade = t * t * (3 - 2 * t); // smoothstep ease-in-out
      }
      gl.uniform1f(uFade, fade);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, offset + (reduceMotion ? 0 : (now - start) / 1000));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      // A cleared WebGL canvas is black; reveal it only once it shows the panel colour.
      if (framesDrawn === 0) canvas.style.visibility = "visible";
      framesDrawn++;
    };

    const loop = (now: number) => {
      draw(now);
      if (visible && !reduceMotion) raf = requestAnimationFrame(loop);
    };

    const play = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && !document.hidden;
      if (visible) play();
    });
    io.observe(canvas);

    const onVisibility = () => {
      visible = !document.hidden;
      if (visible) play();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const ro = new ResizeObserver(() => {
      if (reduceMotion) draw(performance.now());
    });
    ro.observe(canvas);

    // next-themes toggles a class on <html>; recolour when it does.
    const mo = new MutationObserver(() => {
      applyTheme();
      draw(performance.now());
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    play();

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{ visibility: "hidden" }}
    />
  );
}
