import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { HandCoins, TrendingUp, Users, Wallet } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/data/data-table";
import { useCommissionsQuery } from "@/features/admin/api";
import { useAuthStore } from "@/stores/auth-store";
import { ROLE_HOME } from "@/features/auth/role-routes";
import { formatCompactINR, formatINR } from "@/lib/format";
import type { CommissionRow } from "@/types/admin";

export const Route = createFileRoute("/app/admin/commissions")({
  beforeLoad: () => {
    const { user } = useAuthStore.getState();
    if (user && user.role !== "admin") throw redirect({ to: ROLE_HOME[user.role] });
  },
  head: () => ({ meta: [{ title: "Commissions — Admin" }] }),
  component: AdminCommissionsPage,
});

function AdminCommissionsPage() {
  const { data } = useCommissionsQuery();
  const [cycle, setCycle] = useState<string>("Mar 2026");
  const rows = useMemo(() => (data ?? []).filter((r) => r.cycle === cycle), [data, cycle]);

  const totals = rows.reduce(
    (acc, r) => {
      acc.aum += r.aum;
      acc.earned += r.earned;
      return acc;
    },
    { aum: 0, earned: 0 },
  );

  const trend = useMemo(() => {
    const cycles = ["Jan 2026", "Feb 2026", "Mar 2026"];
    return cycles.map((c) => ({
      cycle: c,
      earned: (data ?? []).filter((r) => r.cycle === c).reduce((s, r) => s + r.earned, 0),
    }));
  }, [data]);

  const columns: DataTableColumn<CommissionRow>[] = [
    {
      id: "payee",
      header: "Payee",
      sortValue: (r) => r.payee,
      accessor: (r) => (
        <div>
          <p className="font-semibold">{r.payee}</p>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{r.payeeRole === "rm" ? "Relationship Manager" : "Distributor"}</p>
        </div>
      ),
    },
    { id: "cat", header: "Category", sortValue: (r) => r.schemeCategory, accessor: (r) => r.schemeCategory },
    { id: "aum", header: "AUM", align: "right", sortValue: (r) => r.aum, accessor: (r) => formatCompactINR(r.aum) },
    { id: "rate", header: "Trail %", align: "right", sortValue: (r) => r.trailRate, accessor: (r) => `${r.trailRate.toFixed(2)}%` },
    { id: "earned", header: "Earned", align: "right", sortValue: (r) => r.earned, accessor: (r) => <span className="font-semibold">{formatINR(r.earned)}</span> },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Admin · Finance"
        title="Commissions ledger"
        description="Trail commissions accrued by RMs and distributors across asset categories."
      />
      <div className="space-y-6 px-6 py-6 sm:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Cycle AUM" value={formatCompactINR(totals.aum)} icon={Wallet} />
          <Stat label="Cycle commissions" value={formatINR(totals.earned)} icon={HandCoins} />
          <Stat label="Active payees" value={String(new Set(rows.map((r) => r.payee)).size)} icon={Users} />
          <Stat label="Avg trail" value={`${(rows.reduce((s, r) => s + r.trailRate, 0) / Math.max(1, rows.length)).toFixed(2)}%`} icon={TrendingUp} />
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>3-cycle trend</CardTitle>
            <CardDescription>Total commissions accrued per cycle.</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pb-4 sm:px-4">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trend} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="commFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="cycle" stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickFormatter={(v) => formatCompactINR(Number(v))} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} fontSize={11} width={68} />
                <Tooltip formatter={(v) => formatINR(Number(v))} contentStyle={{ borderRadius: 8, background: "var(--color-popover)", border: "1px solid var(--color-border)" }} />
                <Area type="monotone" dataKey="earned" stroke="var(--color-primary)" strokeWidth={2.4} fill="url(#commFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>Ledger</CardTitle>
              <CardDescription>Commissions for the selected cycle.</CardDescription>
            </div>
            <Select value={cycle} onValueChange={setCycle}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Mar 2026">Mar 2026</SelectItem>
                <SelectItem value="Feb 2026">Feb 2026</SelectItem>
                <SelectItem value="Jan 2026">Jan 2026</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={rows}
              initialSortId="earned"
              initialSortDir="desc"
              pageSize={10}
              mobileCard={(r) => (
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{r.payee}</p>
                      <p className="text-xs text-muted-foreground">{r.schemeCategory} · {r.trailRate.toFixed(2)}%</p>
                    </div>
                    <p className="font-semibold tabular-nums">{formatINR(r.earned)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">AUM {formatCompactINR(r.aum)}</p>
                </div>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Wallet }) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-5">
        <div className="grid h-10 w-10 place-items-center rounded-xl gradient-brand text-primary-foreground shadow-glow">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 font-display text-2xl font-bold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
