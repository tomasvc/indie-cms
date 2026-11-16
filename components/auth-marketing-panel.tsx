"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { AuthShader, type AuthShaderControls } from "@/components/auth-shader";

gsap.registerPlugin(useGSAP, SplitText, DrawSVGPlugin, MorphSVGPlugin);

const SCRIBBLE = "M4 10 C 22 2, 38 15, 60 8 S 98 2, 120 10 S 160 15, 182 7 S 222 1, 244 9 S 282 14, 296 6";
const LINE = "M4 8 C 22 8, 38 8, 60 8 S 98 8, 120 8 S 160 8, 182 8 S 222 8, 244 8 S 282 8, 296 8";

const LEAD_LINES = ["Run your freelance", "business with"];

export function AuthMarketingPanel() {
  const rootRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const underlineRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);

  const shaderControls = useRef<AuthShaderControls>({ fade: 0, turbulence: 0.5 });
  const started = useRef(false);

  const { contextSafe } = useGSAP(
    () => () => {
      started.current = false;
    },
    { scope: rootRef }
  );

  const playIntro = contextSafe(() => {
    const word = wordRef.current;
    const dot = dotRef.current;
    const underline = underlineRef.current;
    const path = pathRef.current;
    const paragraph = paragraphRef.current;
    const lines = gsap.utils.toArray<HTMLElement>("[data-intro-line]", rootRef.current);
    if (!word || !dot || !underline || !path || !paragraph) return;
    const hidden = [...lines, word, dot, underline, paragraph];

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(path, { attr: { d: LINE } });
      gsap.set(hidden, { autoAlpha: 1 });
      return;
    }

    const split = SplitText.create(word, { type: "chars" });

    gsap
      .timeline({ defaults: { ease: "power3.out" } })
      // 1. The map fades in already unsettled, then calms to its resting drift.
      .to(shaderControls.current, { fade: 1, duration: 0.9, ease: "power2.out" }, 0)
      .to(shaderControls.current, { turbulence: 0, duration: 2.6 }, 0)
      // 2. The lead lines rise into place through their masks: firm and orderly.
      .set(lines, { autoAlpha: 1 }, 0.1)
      .from(lines, { yPercent: 110, duration: 0.9, stagger: 0.12, ease: "power4.out" }, 0.1)
      // 3. CLARITY pulls into focus letter by letter, then the full stop is set down.
      .set(word, { autoAlpha: 1 }, 0.5)
      .from(split.chars, { opacity: 0, filter: "blur(14px)", duration: 0.9, stagger: 0.07, clearProps: "filter" }, 0.5)
      .set(dot, { autoAlpha: 1 }, 1.45)
      .from(dot, { scale: 0, duration: 0.5, ease: "back.out(2.2)" }, 1.45)
      // 4. A quick scribble underneath, which then relaxes into one straight stroke.
      .set(underline, { autoAlpha: 1 }, 1.2)
      .fromTo(path, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.5, ease: "power2.inOut" }, 1.2)
      .to(path, { morphSVG: LINE, duration: 0.8, ease: "power3.inOut" }, ">-0.05")
      // 5. Supporting copy settles in last.
      // One fromTo with explicit values: a separate set + from both touching opacity left a stale
      // inline `opacity: 0` behind when the context reverted, so a replayed intro faded 0 → 0.
      .fromTo(paragraph, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 1.6);
  });

  const handleShaderReady = () => {
    if (started.current) return;
    started.current = true;
    document.fonts.ready.then(playIntro);
  };

  return (
    <div
      ref={rootRef}
      className="relative hidden overflow-hidden rounded-[calc(var(--radius)*2.5)] text-white lg:flex lg:w-[48%] lg:flex-col"
      style={{ background: "var(--auth-panel-bg)" }}
    >
      <AuthShader
        variant="contours"
        controls={shaderControls}
        onReady={handleShaderReady}
        className="absolute inset-0 h-full w-full"
      />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 38%, transparent 62%), linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 18%)",
        }}
      />

      <div className="relative flex h-full flex-col p-10 xl:p-12">
        <div className="flex items-center gap-4">
          <span className="font-sans text-xs font-medium uppercase tracking-[0.24em] text-white/85 select-none">
            Built for independent creatives
          </span>
          <span className="h-px w-24 bg-white/50" />
        </div>

        <div className="mt-auto max-w-2xl">
          <h1 className="font-sans text-7xl font-black leading-[1.05] tracking-tighter uppercase select-none">
            {LEAD_LINES.map((line) => (
              <span key={line} className="block overflow-hidden">
                <span data-intro-line className="invisible block">
                  {line}
                </span>
              </span>
            ))}
            <span className="relative inline-block" style={{ color: "var(--auth-accent)" }}>
              <span ref={wordRef} className="invisible" style={{ fontKerning: "none" }}>
                clarity
              </span>
              <span
                ref={dotRef}
                aria-hidden
                className="invisible ml-[0.05em] inline-block size-[0.19em] rounded-full bg-current"
              />
              <svg
                ref={underlineRef}
                aria-hidden
                viewBox="0 0 300 16"
                className="invisible pointer-events-none absolute left-0 top-[92%] h-auto w-full overflow-visible"
              >
                <path
                  ref={pathRef}
                  d={SCRIBBLE}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </h1>
          <p ref={paragraphRef} className="invisible mt-5 max-w-lg text-lg leading-relaxed text-white/90 select-none">
            Projects, clients, invoices and your numbers, in one clean
            workspace designed around how you actually work.
          </p>
        </div>
      </div>
    </div>
  );
}
