import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import type { SectorAllocation } from "@/types/portfolio";

interface SectorBarChartProps {
  data: SectorAllocation[];
}

function SectorTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload as SectorAllocation;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-elegant">
      <p className="font-semibold text-popover-foreground">{item.sector}</p>
      <p className="mt-0.5 text-muted-foreground">{item.weight.toFixed(1)}% of equity</p>
    </div>
  );
}

export function SectorBarChart({ data }: SectorBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 32)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="var(--color-border)" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={(v) => `${v}%`}
          stroke="var(--color-muted-foreground)"
          tickLine={false}
          axisLine={false}
          fontSize={11}
        />
        <YAxis
          dataKey="sector"
          type="category"
          stroke="var(--color-muted-foreground)"
          tickLine={false}
          axisLine={false}
          fontSize={11}
          width={120}
        />
        <Tooltip cursor={{ fill: "var(--color-secondary)" }} content={<SectorTooltip />} />
        <Bar dataKey="weight" fill="var(--color-primary-glow)" radius={[0, 8, 8, 0]} barSize={14} />
      </BarChart>
    </ResponsiveContainer>
  );
}
