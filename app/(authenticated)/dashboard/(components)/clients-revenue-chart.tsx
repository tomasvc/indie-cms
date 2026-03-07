"use client";

import { useEffect, useRef, useState } from "react";
import * as RechartsPrimitive from "recharts";
import type { ClientRevenueSegment, RevenueWarning } from "@/lib/dashboard/financials";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangleIcon } from "lucide-react";

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

// Space reserved above the arc top for labels rendered inside segments
const LABEL_TOP_PADDING = 16;
// Height below the chart SVG reserved for the warning row
const WARNING_HEIGHT = 24;

type ClientsRevenueChartProps = {
  pieData: ClientRevenueSegment[];
  totalClients: number;
  warnings: RevenueWarning[];
  animationKey?: number;
};

// Renders name + percent inside each segment
function SegmentLabel(props: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  payload?: ClientRevenueSegment;
}) {
  const { cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, payload } = props;
  if (!payload) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.52;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const fontSize = outerRadius - innerRadius > 36 ? 9 : 7;
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={fontSize}
      fontWeight={600}
    >
      <tspan x={x} dy={`-${fontSize * 0.6}px`}>{payload.name}</tspan>
      <tspan x={x} dy={`${fontSize * 1.4}px`}>{payload.percent}%</tspan>
    </text>
  );
}

export function ClientsRevenueChart({
  pieData,
  totalClients,
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

  // Outer radius = half the container width
  const outerR = containerWidth ? Math.floor(containerWidth / 2) : 100;
  const innerR = Math.floor(outerR * 0.6);

  // SVG height: just enough to show the top semicircle + a little padding at the top for labels
  const chartHeight = outerR + LABEL_TOP_PADDING;
  // Total container height: chart SVG + warning row
  const totalHeight = chartHeight + WARNING_HEIGHT;

  // cy is set to chartHeight so the flat baseline sits exactly at the SVG bottom edge
  const cyPx = chartHeight;

  return (
    <div ref={wrapperRef} className="relative w-full" style={{ height: totalHeight }}>
      {containerWidth > 0 && (
        <RechartsPrimitive.ResponsiveContainer width="100%" height={chartHeight}>
          <RechartsPrimitive.PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
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
      )}

      {/* Center text sits just above the flat baseline in the donut hole */}
      <div
        className="absolute top-[6rem] left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
        style={{ bottom: WARNING_HEIGHT + Math.floor(innerR * 0.12) }}
      >
        <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-medium leading-none">
          Total
        </span>
        <span className="text-xl text-foreground font-bold leading-tight tabular-nums">{totalClients}</span>
      </div>

      {/* Warning row sits below the chart SVG */}
      <div
        className="absolute top-[8.5rem] left-1/2 -translate-x-1/2 flex items-center justify-center"
        style={{ bottom: 4, height: WARNING_HEIGHT - 4 }}
      >
        {warnings.length > 0 ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 text-destructive text-xs font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              >
                <AlertTriangleIcon className="h-3.5 w-3.5 shrink-0" />
                {warnings.length} {warnings.length === 1 ? "warning" : "warnings"}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <ul className="list-disc list-outside pl-3 space-y-1 text-left">
                {warnings.map((w, i) => {
                  if (w.type === "overdependence") {
                    return (
                      <li key={i}>
                        Overdependence: <strong>{w.clientName}</strong> makes up {w.percent}% of revenue
                      </li>
                    );
                  }
                  if (w.type === "single_client") {
                    return (
                      <li key={i}>
                        Single source: <strong>{w.clientName}</strong> is your only revenue-generating client
                      </li>
                    );
                  }
                  if (w.type === "top2_concentration") {
                    return (
                      <li key={i}>
                        Concentration: <strong>{w.client1}</strong> and <strong>{w.client2}</strong> together account for {w.percent}% of revenue
                      </li>
                    );
                  }
                  if (w.type === "dormant_top_client") {
                    return (
                      <li key={i}>
                        Inactive top client: <strong>{w.clientName}</strong> is your highest earner but is {w.status === "archived" ? "archived" : "still a lead"}
                      </li>
                    );
                  }
                  if (w.type === "overdue_concentration") {
                    return (
                      <li key={i}>
                        Outstanding risk: <strong>{w.clientName}</strong> holds {w.percent}% of your unpaid balance
                      </li>
                    );
                  }
                  return null;
                })}
              </ul>
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>
    </div>
  );
}
