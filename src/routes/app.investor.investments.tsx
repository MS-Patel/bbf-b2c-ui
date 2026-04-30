import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Briefcase, Building2, Coins, ShieldCheck, PiggyBank, Upload, ArrowUpRight, Wallet, TrendingUp, Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AllocationDonut } from "@/features/portfolio/components/allocation-donut";
import { useCASStore } from "@/features/cas/store";
import { buildParseResult } from "@/features/cas/fixtures";
import type { AssetKind, CASAsset, CASParseResult } from "@/features/cas/types";
import type { AllocationSlice } from "@/types/portfolio";
import { formatCompactINR, formatINR, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/investor/investments")({
  head: () => ({ meta: [{ title: "All investments — BuyBestFin" }] }),
  component: InvestmentsPage,
});

const KIND_LABEL: Record<AssetKind, string> = {
  mutual_fund: "Mutual Funds",
  equity: "Equities",
  bond: "Bonds",
  insurance: "Insurance",
  nps: "NPS",
};

const KIND_ICON: Record<AssetKind, typeof Briefcase> = {
  mutual_fund: Briefcase,
  equity: Building2,
  bond: Coins,
  insurance: ShieldCheck,
  nps: PiggyBank,
};

function valueOf(a: CASAsset) {
  if (a.kind === "insurance") return { invested: a.premium, current: a.fundValue };
  return { invested: a.invested, current: a.currentValue };
}

function aggregateByKind(assets: CASAsset[]): AllocationSlice[] {
  const total = assets.reduce((s, a) => s + valueOf(a).current, 0) || 1;
  const map = new Map<AssetKind, number>();
  for (const a of assets) map.set(a.kind, (map.get(a.kind) ?? 0) + valueOf(a).current);
  return Array.from(map.entries())
    .map(([k, v]) => ({ key: k, label: KIND_LABEL[k], value: v, percent: (v / total) * 100 }))
    .sort((a, b) => b.value - a.value);
}

function InvestmentsPage() {
  const lastImport = useCASStore((s) => s.lastImport);

  // If no CAS imported yet, show fixture so the dashboard never feels empty.
  const data: CASParseResult = useMemo(
    () => lastImport ?? buildParseResult("Sample-CAS.pdf"),
    [lastImport],
  );
  const isSample = !lastImport;

  const grouped = useMemo(() => {
    const m: Record<AssetKind, CASAsset[]> = {
      mutual_fund: [], equity: [], bond: [], insurance: [], nps: [],
    };
    for (const a of data.assets) m[a.kind].push(a);
    return m;
  }, [data.assets]);

  const allocation = useMemo(() => aggregateByKind(data.assets), [data.assets]);

  return (
    <>
      <PageHeader
        eyebrow="Wealth"
        title="All investments"
        description="Mutual funds, equities, bonds, insurance and NPS — consolidated from your CAS into one net-worth view."
        actions={
          <Button asChild className="gap-2">
            <Link to="/app/investor/import">
              {lastImport ? "Re-import CAS" : "Import CAS"} <Upload className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="space-y-6 px-6 py-6 sm:px-8">
        {isSample && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>
                Showing <span className="font-semibold">sample data</span>. Import your CAS to see your real consolidated portfolio.
              </span>
            </div>
            <Button asChild size="sm" className="gap-2">
              <Link to="/app/investor/import">Import now <ArrowUpRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </div>
        )}

        <NetWorthStrip data={data} />

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="shadow-card lg:col-span-2">
            <CardHeader>
              <CardTitle>Asset class breakdown</CardTitle>
              <CardDescription>Current value across every account in your CAS.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(Object.keys(grouped) as AssetKind[])
                .filter((k) => grouped[k].length > 0)
                .map((k) => {
                  const items = grouped[k];
                  const Icon = KIND_ICON[k];
                  const total = items.reduce((s, a) => s + valueOf(a).current, 0);
                  const invested = items.reduce((s, a) => s + valueOf(a).invested, 0);
                  const gainPct = invested ? ((total - invested) / invested) * 100 : 0;
                  const pct = (total / data.totals.netWorth) * 100;
                  return (
                    <div key={k} className="rounded-xl border border-border bg-secondary/30 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 place-items-center rounded-lg bg-card text-primary">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="font-semibold">{KIND_LABEL[k]}</p>
                            <p className="text-xs text-muted-foreground">{items.length} positions · {pct.toFixed(1)}% of net worth</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-lg font-bold tabular-nums">{formatINR(total)}</p>
                          <p className={cn("text-xs font-medium tabular-nums", gainPct >= 0 ? "text-profit" : "text-loss")}>
                            {formatPercent(gainPct)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, pct)}%` }} />
                      </div>
                    </div>
                  );
                })}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Allocation</CardTitle>
              <CardDescription>By asset class.</CardDescription>
            </CardHeader>
            <CardContent>
              <AllocationDonut
                data={allocation}
                centerLabel="Net worth"
                centerValue={formatCompactINR(data.totals.netWorth)}
              />
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Holdings</CardTitle>
            <CardDescription>Drill into each asset class.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="mutual_fund">
              <TabsList className="flex w-full flex-wrap">
                {(Object.keys(grouped) as AssetKind[]).map((k) => (
                  <TabsTrigger key={k} value={k} disabled={grouped[k].length === 0} className="flex-1">
                    {KIND_LABEL[k]}
                    <Badge variant="secondary" className="ml-2 border-0">{grouped[k].length}</Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
              {(Object.keys(grouped) as AssetKind[]).map((k) => (
                <TabsContent key={k} value={k} className="mt-4">
                  <KindHoldingsTable kind={k} items={grouped[k]} />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function NetWorthStrip({ data }: { data: CASParseResult }) {
  const positive = data.totals.gain >= 0;
  return (
    <Card className="overflow-hidden shadow-card">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 divide-y divide-border lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          <div className="bg-gradient-to-br from-primary to-primary-glow p-6 text-primary-foreground">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">Net worth</p>
            <p className="mt-2 font-display text-3xl font-bold tabular-nums">{formatINR(data.totals.netWorth)}</p>
            <p className="mt-1 text-xs text-primary-foreground/80">As of {new Date(data.parsedAt).toLocaleDateString("en-IN")}</p>
          </div>
          <Stat icon={Wallet} label="Invested" value={formatINR(data.totals.invested)} sub={`${data.assets.length} positions`} />
          <Stat
            icon={TrendingUp}
            label="Unrealized gain"
            value={formatINR(data.totals.gain)}
            sub={formatPercent(data.totals.returnPct)}
            tone={positive ? "profit" : "loss"}
          />
          <Stat icon={Briefcase} label="Asset classes" value={`${Object.values(data.totals.counts).filter(Boolean).length}`} sub="MF · Equity · Bond · Ins · NPS" />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({
  icon: Icon, label, value, sub, tone,
}: { icon: typeof Wallet; label: string; value: string; sub: string; tone?: "profit" | "loss" }) {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em]">{label}</p>
      </div>
      <p className={cn(
        "mt-2 font-display text-2xl font-bold tabular-nums",
        tone === "profit" && "text-profit",
        tone === "loss" && "text-loss",
      )}>
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function KindHoldingsTable({ kind, items }: { kind: AssetKind; items: CASAsset[] }) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No {KIND_LABEL[kind].toLowerCase()} found.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <th className="px-3 py-2 font-semibold">Holding</th>
            <th className="px-3 py-2 font-semibold">Details</th>
            <th className="px-3 py-2 text-right font-semibold">Invested</th>
            <th className="px-3 py-2 text-right font-semibold">Current value</th>
            <th className="px-3 py-2 text-right font-semibold">Returns</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((a) => {
            const v = valueOf(a);
            const ret = v.invested ? ((v.current - v.invested) / v.invested) * 100 : 0;
            return (
              <tr key={a.id} className="hover:bg-secondary/40">
                <td className="px-3 py-3">
                  <p className="font-semibold">{titleOf(a)}</p>
                </td>
                <td className="px-3 py-3 text-xs text-muted-foreground">{subtitleOf(a)}</td>
                <td className="px-3 py-3 text-right tabular-nums">{formatINR(v.invested)}</td>
                <td className="px-3 py-3 text-right font-semibold tabular-nums">{formatINR(v.current)}</td>
                <td className={cn("px-3 py-3 text-right font-semibold tabular-nums", ret >= 0 ? "text-profit" : "text-loss")}>
                  {formatPercent(ret)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function titleOf(a: CASAsset): string {
  switch (a.kind) {
    case "mutual_fund": return a.scheme;
    case "equity": return `${a.symbol} — ${a.company}`;
    case "bond": return a.issuer;
    case "insurance": return `${a.insurer} — ${a.product}`;
    case "nps": return a.scheme;
  }
}

function subtitleOf(a: CASAsset): string {
  switch (a.kind) {
    case "mutual_fund": return `${a.amc} · Folio ${a.folio} · ${a.units.toFixed(2)} units @ ₹${a.currentNav}`;
    case "equity": return `${a.exchange} · ${a.depository} · ${a.qty} shares @ ₹${a.ltp}`;
    case "bond": return `Coupon ${a.couponPct}% · Matures ${a.maturity.slice(0, 10)} · ${a.units} units`;
    case "insurance": return `${a.type.toUpperCase()} · Sum assured ${formatCompactINR(a.sumAssured)} · Premium ${formatCompactINR(a.premium)}/yr`;
    case "nps": return `Tier ${a.tier} · PRAN ${a.pran} · ${a.units.toFixed(2)} units @ ₹${a.nav}`;
  }
}

