import type {
  AllocationSlice,
  FolioDetail,
  FolioRecentTxn,
  FolioSummary,
  Holding,
  PerformancePoint,
  PortfolioOverview,
  PortfolioSummary,
  SectorAllocation,
} from "@/types/portfolio";

const HOLDINGS: Holding[] = [
  {
    id: "h_pp_flexi",
    schemeCode: "PP_FLEXI_G",
    schemeName: "Parag Parikh Flexi Cap — Direct Growth",
    amc: "PPFAS",
    category: "Flexi Cap",
    assetClass: "equity",
    units: 2841.7,
    avgNav: 412.32,
    currentNav: 527.91,
    invested: 1_171_500,
    currentValue: 1_500_140,
    unrealizedGain: 328_640,
    returnPct: 28.05,
    xirr: 22.4,
    sip: true,
    navAsOf: "2026-04-16",
  },
  {
    id: "h_axis_blue",
    schemeCode: "AXIS_BLUE_G",
    schemeName: "Axis Bluechip — Direct Growth",
    amc: "Axis MF",
    category: "Large Cap",
    assetClass: "equity",
    units: 9120.4,
    avgNav: 48.21,
    currentNav: 62.87,
    invested: 439_500,
    currentValue: 573_300,
    unrealizedGain: 133_800,
    returnPct: 30.45,
    xirr: 18.9,
    sip: true,
    navAsOf: "2026-04-16",
  },
  {
    id: "h_mirae_mid",
    schemeCode: "MIRAE_MID_G",
    schemeName: "Mirae Asset Midcap — Direct Growth",
    amc: "Mirae Asset",
    category: "Mid Cap",
    assetClass: "equity",
    units: 4280.1,
    avgNav: 24.78,
    currentNav: 32.12,
    invested: 106_000,
    currentValue: 137_480,
    unrealizedGain: 31_480,
    returnPct: 29.7,
    xirr: 24.6,
    sip: false,
    navAsOf: "2026-04-16",
  },
  {
    id: "h_quant_small",
    schemeCode: "QUANT_SMALL_G",
    schemeName: "Quant Small Cap — Direct Growth",
    amc: "Quant MF",
    category: "Small Cap",
    assetClass: "equity",
    units: 612.3,
    avgNav: 156.4,
    currentNav: 218.92,
    invested: 95_750,
    currentValue: 134_071,
    unrealizedGain: 38_321,
    returnPct: 40.02,
    xirr: 31.2,
    sip: true,
    navAsOf: "2026-04-16",
  },
  {
    id: "h_icici_corp",
    schemeCode: "ICICI_CORP_G",
    schemeName: "ICICI Pru Corporate Bond — Direct Growth",
    amc: "ICICI Pru",
    category: "Corporate Bond",
    assetClass: "debt",
    units: 18_420,
    avgNav: 26.4,
    currentNav: 28.21,
    invested: 486_300,
    currentValue: 519_628,
    unrealizedGain: 33_328,
    returnPct: 6.85,
    xirr: 7.2,
    sip: false,
    navAsOf: "2026-04-16",
  },
  {
    id: "h_hdfc_short",
    schemeCode: "HDFC_SHORT_G",
    schemeName: "HDFC Short Term Debt — Direct Growth",
    amc: "HDFC MF",
    category: "Short Duration",
    assetClass: "debt",
    units: 9821,
    avgNav: 28.1,
    currentNav: 29.74,
    invested: 275_950,
    currentValue: 292_077,
    unrealizedGain: 16_127,
    returnPct: 5.84,
    xirr: 6.4,
    sip: false,
    navAsOf: "2026-04-16",
  },
  {
    id: "h_nippon_gold",
    schemeCode: "NIPPON_GOLD_G",
    schemeName: "Nippon India Gold Savings — Direct Growth",
    amc: "Nippon",
    category: "Gold ETF",
    assetClass: "gold",
    units: 7521,
    avgNav: 18.2,
    currentNav: 24.51,
    invested: 136_900,
    currentValue: 184_339,
    unrealizedGain: 47_439,
    returnPct: 34.65,
    xirr: 21.3,
    sip: false,
    navAsOf: "2026-04-16",
  },
  {
    id: "h_motilal_nasdaq",
    schemeCode: "MOSL_NASDAQ_G",
    schemeName: "Motilal Oswal Nasdaq 100 FOF — Direct Growth",
    amc: "Motilal Oswal",
    category: "International",
    assetClass: "international",
    units: 5201,
    avgNav: 22.1,
    currentNav: 31.07,
    invested: 114_950,
    currentValue: 161_595,
    unrealizedGain: 46_645,
    returnPct: 40.58,
    xirr: 26.7,
    sip: true,
    navAsOf: "2026-04-16",
  },
];

function sumBy<T>(items: T[], pick: (it: T) => number): number {
  return items.reduce((acc, it) => acc + pick(it), 0);
}

function buildAllocation(by: "assetClass" | "category"): AllocationSlice[] {
  const total = sumBy(HOLDINGS, (h) => h.currentValue);
  const map = new Map<string, { label: string; value: number }>();
  for (const h of HOLDINGS) {
    const k = h[by];
    const label = by === "assetClass" ? capitalize(h.assetClass) : h.category;
    const prev = map.get(k);
    map.set(k, { label, value: (prev?.value ?? 0) + h.currentValue });
  }
  return Array.from(map.entries())
    .map(([key, v]) => ({ key, label: v.label, value: v.value, percent: (v.value / total) * 100 }))
    .sort((a, b) => b.value - a.value);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const SECTORS: SectorAllocation[] = [
  { sector: "Financial Services", weight: 24.6 },
  { sector: "Technology", weight: 18.2 },
  { sector: "Consumer", weight: 13.9 },
  { sector: "Healthcare", weight: 9.4 },
  { sector: "Energy", weight: 8.1 },
  { sector: "Industrials", weight: 7.7 },
  { sector: "Materials", weight: 6.2 },
  { sector: "Utilities", weight: 4.5 },
  { sector: "Others", weight: 7.4 },
];

function buildPerformance(): PerformancePoint[] {
  // 12 monthly points trending upward with realistic dispersion
  const start = new Date("2025-05-01").getTime();
  const months = 12;
  const points: PerformancePoint[] = [];
  let invested = 4_200_000;
  let value = 4_350_000;
  for (let i = 0; i <= months; i++) {
    const monthlyContribution = 80_000 + (i % 3 === 0 ? 25_000 : 0);
    invested += i === 0 ? 0 : monthlyContribution;
    // organic growth ~ 1.5% with sinusoidal volatility
    const drift = 1 + 0.014 + 0.022 * Math.sin(i / 1.6);
    value = value * drift + (i === 0 ? 0 : monthlyContribution);
    const date = new Date(start);
    date.setMonth(date.getMonth() + i);
    points.push({
      date: date.toISOString(),
      invested: Math.round(invested),
      value: Math.round(value),
    });
  }
  return points;
}

function buildSummary(): PortfolioSummary {
  const invested = sumBy(HOLDINGS, (h) => h.invested);
  const currentValue = sumBy(HOLDINGS, (h) => h.currentValue);
  const unrealizedGain = currentValue - invested;
  return {
    netWorth: currentValue,
    invested,
    currentValue,
    unrealizedGain,
    absoluteReturnPct: (unrealizedGain / invested) * 100,
    xirr: 19.4,
    todayChange: 12_840,
    todayChangePct: 0.36,
    monthlySip: 45_000,
    asOf: "2026-04-16T16:30:00.000Z",
  };
}

export const PORTFOLIO_FIXTURE: PortfolioOverview = {
  summary: buildSummary(),
  byAssetClass: buildAllocation("assetClass"),
  byCategory: buildAllocation("category"),
  bySector: SECTORS,
  performance: buildPerformance(),
  topHoldings: [...HOLDINGS].sort((a, b) => b.currentValue - a.currentValue).slice(0, 5),
};

export const HOLDINGS_FIXTURE: Holding[] = HOLDINGS;
