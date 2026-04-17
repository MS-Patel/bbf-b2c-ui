import { useMemo } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
} from "recharts";
import type { AllocationSlice } from "@/types/portfolio";
import { formatCompactINR } from "@/lib/format";

const PALETTE = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-primary-glow)",
];

interface AllocationDonutProps {
  data: AllocationSlice[];
  centerLabel?: string;
  centerValue?: string;
}

function ChartTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload as AllocationSlice;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-elegant">
      <p className="font-semibold text-popover-foreground">{item.label}</p>
      <p className="mt-0.5 text-muted-foreground">
        {formatCompactINR(item.value)} · {item.percent.toFixed(1)}%
      </p>
    </div>
  );
}

export function AllocationDonut({ data, centerLabel, centerValue }: AllocationDonutProps) {
  const colored = useMemo(
    () => data.map((d, i) => ({ ...d, fill: PALETTE[i % PALETTE.length] })),
    [data],
  );

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
      <div className="relative mx-auto h-56 w-56 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={colored}
              dataKey="value"
              nameKey="label"
              innerRadius={68}
              outerRadius={96}
              paddingAngle={2}
              stroke="var(--color-background)"
              strokeWidth={2}
            >
              {colored.map((entry) => (
                <Cell key={entry.key} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {(centerLabel || centerValue) && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div>
              {centerLabel && (
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {centerLabel}
                </p>
              )}
              {centerValue && (
                <p className="mt-1 font-display text-xl font-bold tabular-nums">{centerValue}</p>
              )}
            </div>
          </div>
        )}
      </div>

      <ul className="flex-1 space-y-2.5">
        {colored.map((slice) => (
          <li key={slice.key} className="flex items-center gap-3 text-sm">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: slice.fill }} />
            <span className="flex-1 truncate font-medium">{slice.label}</span>
            <span className="tabular-nums text-muted-foreground">{slice.percent.toFixed(1)}%</span>
            <span className="w-20 text-right font-semibold tabular-nums">
              {formatCompactINR(slice.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
