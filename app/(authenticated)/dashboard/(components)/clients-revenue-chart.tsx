"use client";

import { useEffect, useRef, useState } from "react";
import * as RechartsPrimitive from "recharts";
import type { ClientRevenueSegment, RevenueWarning } from "@/lib/dashboard/financials";
import { AlertTriangleIcon } from "lucide-react";

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

// Segment label colors, paired with PIE_COLORS: light text on the deeper hues, dark text on amber
const LABEL_COLORS = [
  "oklch(0.99 0.01 165)",
  "oklch(0.99 0.01 165)",
  "oklch(0.22 0.05 70)",
  "oklch(0.99 0.01 165)",
  "oklch(0.99 0.01 165)",
];

// Space reserved above the arc top for labels rendered inside segments
const LABEL_TOP_PADDING = 16;
// Height below the chart SVG reserved for the warning row
const WARNING_HEIGHT = 24;
// Keeps the semicircle from dominating wide (mobile, full-width) containers
const MAX_OUTER_RADIUS = 150;

type ClientsRevenueChartProps = {
  pieData: ClientRevenueSegment[];
  warnings: RevenueWarning[];
  animationKey?: number;
};

const MAX_LABEL_CHARS = 12;

// First name only for people, clipped with an ellipsis so labels stay inside narrow segments
function shortName(name: string) {
  const first = name.trim().split(/\s+/)[0] ?? name;
  return first.length > MAX_LABEL_CHARS ? `${first.slice(0, MAX_LABEL_CHARS - 1)}…` : first;
}

// Renders name + percent inside each segment
function SegmentLabel(props: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  payload?: ClientRevenueSegment;
  index?: number;
}) {
  const { cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, payload, index = 0 } = props;
  if (!payload) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.52;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const fontSize = outerRadius - innerRadius > 36 ? 12 : 11;
  return (
    <text
      x={x}
      y={y}
      fill={LABEL_COLORS[index % LABEL_COLORS.length]}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={fontSize}
      fontWeight={600}
    >
      <tspan x={x} dy={`-${fontSize * 0.6}px`}>{shortName(payload.name)}</tspan>
      <tspan x={x} dy={`${fontSize * 1.4}px`}>{payload.percent}%</tspan>
    </text>
  );
}

export function ClientsRevenueChart({
  pieData,
  warnings,
  animationKey,
}: ClientsRevenueChartProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.offsetWidth);
    const obs = new ResizeObserver(update);
    obs.observe(el);
    update();
    return () => obs.disconnect();
  }, []);

  if (pieData.length === 0) {
    return (
      <div className="flex h-[100px] w-full items-center justify-center rounded-lg border border-dashed bg-muted/30">
        <span className="text-sm text-muted-foreground">No revenue data yet</span>
      </div>
    );
  }

  // Outer radius = half the container width, capped so wide containers don't get a giant arc
  const outerR = Math.min(containerWidth ? Math.floor(containerWidth / 2) : 100, MAX_OUTER_RADIUS);
  const innerR = Math.floor(outerR * 0.6);

  // SVG height: just enough to show the top semicircle + a little padding at the top for labels
  const chartHeight = outerR + LABEL_TOP_PADDING;
  // Total container height: chart SVG + warning row
  const totalHeight = chartHeight + WARNING_HEIGHT;

  // cy is set to chartHeight so the flat baseline sits exactly at the SVG bottom edge
  const cyPx = chartHeight;

  return (
    <div ref={wrapperRef} className="relative w-full" style={{ height: totalHeight }}>
      <ul className="sr-only">
        {pieData.map((segment) => (
          <li key={segment.name}>{segment.name}: {segment.percent}% of paid revenue</li>
        ))}
      </ul>
      {containerWidth > 0 && (
        <div aria-hidden>
        <RechartsPrimitive.ResponsiveContainer width="100%" height={chartHeight}>
          <RechartsPrimitive.PieChart margin={{ top: -3, right: 0, bottom: 0, left: 0 }}>
            <RechartsPrimitive.Pie
              key={animationKey}
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy={cyPx}
              startAngle={0}
              endAngle={180}
              innerRadius={innerR}
              outerRadius={outerR}
              paddingAngle={1}
              strokeWidth={0}
              labelLine={false}
              label={SegmentLabel}
              animationBegin={0}
              animationDuration={600}
              animationEasing="ease-out"
            >
              {pieData.map((_, index) => (
                <RechartsPrimitive.Cell
                  key={index}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </RechartsPrimitive.Pie>
          </RechartsPrimitive.PieChart>
        </RechartsPrimitive.ResponsiveContainer>
        </div>
      )}

      {/* Center text sits just above the flat baseline in the donut hole */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
        style={{ bottom: WARNING_HEIGHT + Math.floor(innerR * 0.12) }}
        aria-hidden
      >
        <span className="text-xl text-foreground font-bold leading-tight tabular-nums">{pieData.length}</span>
        <span className="text-[12px] text-muted-foreground font-medium leading-none mt-0.5">
          paying {pieData.length === 1 ? "client" : "clients"}
        </span>
      </div>

      {/* Warning row sits below the chart SVG */}
      <div
        className="absolute left-1/2 -translate-x-1/2 mt-1 flex items-center justify-center"
        style={{ top: chartHeight + 4, height: WARNING_HEIGHT - 4 }}
      >
        {warnings.length > 0 ? (
          <p className="flex items-center gap-1.5 text-warning text-[13px] font-medium">
            <AlertTriangleIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {warnings.length} revenue {warnings.length === 1 ? "risk" : "risks"} flagged above
          </p>
        ) : null}
      </div>
    </div>
  );
}
