import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PerformancePoint } from "@/types/portfolio";
import { formatCompactINR, formatINR } from "@/lib/format";

interface PerformanceChartProps {
  data: PerformancePoint[];
  height?: number;
}

interface RechartsTooltipPayload {
  active?: boolean;
  payload?: Array<{ value?: number | string; dataKey?: string | number }>;
  label?: string | number;
}

function PerfTooltip({ active, payload, label }: RechartsTooltipPayload) {
  if (!active || !payload?.length) return null;
  const value = payload.find((p) => p.dataKey === "value")?.value ?? 0;
  const invested = payload.find((p) => p.dataKey === "invested")?.value ?? 0;
  const gain = Number(value) - Number(invested);
  const date = new Date(label as string).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  return (
    <div className="min-w-[180px] rounded-lg border border-border bg-popover p-3 text-xs shadow-elegant">
      <p className="font-semibold text-popover-foreground">{date}</p>
      <div className="mt-2 space-y-1.5">
        <Row label="Value" value={formatINR(Number(value))} accent />
        <Row label="Invested" value={formatINR(Number(invested))} />
        <Row label="Gain" value={formatINR(gain)} positive={gain >= 0} />
      </div>
    </div>
  );
}

function Row({ label, value, accent, positive }: { label: string; value: string; accent?: boolean; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`tabular-nums font-semibold ${
          accent ? "text-popover-foreground" : positive === undefined ? "" : positive ? "text-success" : "text-destructive"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export function PerformanceChart({ data, height = 280 }: PerformanceChartProps) {
  const formatted = useMemo(
    () =>
      data.map((p) => ({
        ...p,
        monthLabel: new Date(p.date).toLocaleDateString("en-IN", { month: "short" }),
      })),
    [data],
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={formatted} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="perfFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.32} />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="2 4" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => new Date(v).toLocaleDateString("en-IN", { month: "short" })}
          stroke="var(--color-muted-foreground)"
          tickLine={false}
          axisLine={false}
          fontSize={11}
          minTickGap={16}
        />
        <YAxis
          tickFormatter={(v) => formatCompactINR(Number(v))}
          stroke="var(--color-muted-foreground)"
          tickLine={false}
          axisLine={false}
          fontSize={11}
          width={68}
        />
        <Tooltip content={<PerfTooltip />} cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--color-accent)"
          strokeWidth={2.4}
          fill="url(#perfFill)"
          activeDot={{ r: 4, strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="invested"
          stroke="var(--color-muted-foreground)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          dot={false}
          activeDot={{ r: 3 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
