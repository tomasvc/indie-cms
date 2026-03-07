"use client";

import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import * as RechartsPrimitive from "recharts";
import type { RepeatBusinessChartItem } from "@/lib/dashboard/financials";

type FinancialsChartProps = {
  chartData: RepeatBusinessChartItem[];
  chartConfig: ChartConfig;
};

const BAR_GRADIENT_ID = "repeat-business-bar-gradient";
const MIN_BAR_HEIGHT_PX = 6;

function BarShape(props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
}) {
  const { x = 0, y = 0, width = 0, height = 0, value, fill, stroke, strokeWidth, strokeDasharray } = props;
  const isZero = value === 0;
  const h = isZero ? MIN_BAR_HEIGHT_PX : Math.max(height, 2);
  const barY = isZero ? y - MIN_BAR_HEIGHT_PX : y;
  return (
    <rect
      x={x}
      y={barY}
      width={width}
      height={h}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth ?? 0}
      strokeDasharray={strokeDasharray}
      rx={4}
      ry={4}
    />
  );
}

export function FinancialsChart({ chartData, chartConfig }: FinancialsChartProps) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full justify-start pb-4">
      <RechartsPrimitive.BarChart
        accessibilityLayer
        data={chartData}
        margin={{ top: 28, right: 8, bottom: 8, left: 0 }}
        barCategoryGap={8}
      >
        <defs>
          <linearGradient id={BAR_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B8B1FF" stopOpacity={1} />
            <stop offset="100%" stopColor="#7E70FF" stopOpacity={0.9} />
          </linearGradient>
        </defs>
        <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" vertical={false} />
        <RechartsPrimitive.XAxis dataKey="name" tickLine={false} axisLine={false} />
        <RechartsPrimitive.YAxis
          width={0}
          tick={false}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}%`}
          domain={[0, (max: number) => Math.min(100, Math.max(max ?? 50, 50))]}
        />
        <RechartsPrimitive.Bar
          dataKey="value"
          radius={[4, 4, 0, 0]}
          shape={(barProps: unknown) => {
            const p = barProps as {
              x?: number;
              y?: number;
              width?: number;
              height?: number;
              value?: number;
              payload?: RepeatBusinessChartItem;
            };
            const entry = p.payload;
            const fill = entry?.isOverall ? "#D7D3FF" : `url(#${BAR_GRADIENT_ID})`;
            const stroke = entry?.isOverall ? "#B8B1FF" : undefined;
            return (
              <BarShape
                x={p.x}
                y={p.y}
                width={p.width}
                height={p.height}
                value={p.value}
                fill={fill}
                stroke={stroke}
                strokeWidth={entry?.isOverall ? 1 : 0}
                strokeDasharray={entry?.isOverall ? "4 2" : undefined}
              />
            );
          }}
        >
          <RechartsPrimitive.LabelList
            dataKey="value"
            position="top"
            formatter={(v: number) => `${v}%`}
            className="fill-foreground text-xs font-medium"
          />
        </RechartsPrimitive.Bar>
      </RechartsPrimitive.BarChart>
    </ChartContainer>
  );
}
