import type { CASAsset, CASParseResult } from "./types";

const MFS: CASAsset[] = [
  {
    kind: "mutual_fund", id: "cas_mf_1", amc: "PPFAS", folio: "PP-91823412", registrar: "CAMS",
    scheme: "Parag Parikh Flexi Cap — Direct Growth", isin: "INF879O01027",
    units: 2841.7, avgNav: 412.32, currentNav: 527.91, invested: 1_171_500, currentValue: 1_500_140,
  },
  {
    kind: "mutual_fund", id: "cas_mf_2", amc: "Axis MF", folio: "AX-77124908", registrar: "KFintech",
    scheme: "Axis Bluechip — Direct Growth", isin: "INF846K01EW2",
    units: 9120.4, avgNav: 48.21, currentNav: 62.87, invested: 439_500, currentValue: 573_300,
  },
  {
    kind: "mutual_fund", id: "cas_mf_3", amc: "Mirae Asset", folio: "MR-44128820", registrar: "CAMS",
    scheme: "Mirae Asset Midcap — Direct Growth", isin: "INF769K01101",
    units: 4280.1, avgNav: 24.78, currentNav: 32.12, invested: 106_000, currentValue: 137_480,
  },
  {
    kind: "mutual_fund", id: "cas_mf_4", amc: "ICICI Pru", folio: "IC-99008712", registrar: "CAMS",
    scheme: "ICICI Pru Corporate Bond — Direct Growth", isin: "INF109K01ZF1",
    units: 18_420, avgNav: 26.4, currentNav: 28.21, invested: 486_300, currentValue: 519_628,
  },
  {
    kind: "mutual_fund", id: "cas_mf_5", amc: "Nippon", folio: "NP-22788001", registrar: "KFintech",
    scheme: "Nippon India Gold Savings — Direct Growth", isin: "INF204K01YL1",
    units: 7521, avgNav: 18.2, currentNav: 24.51, invested: 136_900, currentValue: 184_339,
  },
];

const EQUITIES: CASAsset[] = [
  {
    kind: "equity", id: "cas_eq_1", symbol: "RELIANCE", company: "Reliance Industries Ltd",
    isin: "INE002A01018", exchange: "NSE", depository: "NSDL", dpId: "IN300476",
    qty: 120, avgPrice: 2_180, ltp: 2_842, invested: 261_600, currentValue: 341_040,
  },
  {
    kind: "equity", id: "cas_eq_2", symbol: "HDFCBANK", company: "HDFC Bank Ltd",
    isin: "INE040A01034", exchange: "NSE", depository: "NSDL", dpId: "IN300476",
    qty: 85, avgPrice: 1_510, ltp: 1_682, invested: 128_350, currentValue: 142_970,
  },
  {
    kind: "equity", id: "cas_eq_3", symbol: "INFY", company: "Infosys Ltd",
    isin: "INE009A01021", exchange: "NSE", depository: "CDSL", dpId: "12081600",
    qty: 200, avgPrice: 1_320, ltp: 1_716, invested: 264_000, currentValue: 343_200,
  },
  {
    kind: "equity", id: "cas_eq_4", symbol: "TATAMOTORS", company: "Tata Motors Ltd",
    isin: "INE155A01022", exchange: "BSE", depository: "CDSL", dpId: "12081600",
    qty: 150, avgPrice: 612, ltp: 941, invested: 91_800, currentValue: 141_150,
  },
];

const BONDS: CASAsset[] = [
  {
    kind: "bond", id: "cas_bd_1", issuer: "Govt of India 7.26% 2033 G-Sec",
    isin: "IN0020220060", faceValue: 100, units: 5000, couponPct: 7.26,
    maturity: "2033-08-22", invested: 500_000, currentValue: 521_400,
  },
  {
    kind: "bond", id: "cas_bd_2", issuer: "HDFC Ltd NCD 8.10% 2027",
    isin: "INE001A07RM7", faceValue: 1000, units: 200, couponPct: 8.1,
    maturity: "2027-03-15", invested: 200_000, currentValue: 207_800,
  },
  {
    kind: "bond", id: "cas_bd_3", issuer: "REC Tax-Free Bonds 7.43% 2028",
    isin: "INE020B07HO1", faceValue: 1000, units: 100, couponPct: 7.43,
    maturity: "2028-12-30", invested: 100_000, currentValue: 104_120,
  },
];

const INSURANCE: CASAsset[] = [
  {
    kind: "insurance", id: "cas_in_1", insurer: "HDFC Life", policyNumber: "HL-22841093",
    product: "Click 2 Wealth ULIP", type: "ulip", sumAssured: 2_500_000,
    premium: 120_000, fundValue: 612_400, maturity: "2038-06-12",
  },
  {
    kind: "insurance", id: "cas_in_2", insurer: "LIC", policyNumber: "LIC-918723441",
    product: "Jeevan Anand", type: "endowment", sumAssured: 1_000_000,
    premium: 42_000, fundValue: 384_500, maturity: "2034-09-01",
  },
  {
    kind: "insurance", id: "cas_in_3", insurer: "ICICI Pru", policyNumber: "IP-TR-30021",
    product: "iProtect Smart Term", type: "term", sumAssured: 10_000_000,
    premium: 18_500, fundValue: 0, maturity: "2055-04-30",
  },
];

const NPS: CASAsset[] = [
  {
    kind: "nps", id: "cas_np_1", pran: "11000091823X", tier: "I",
    scheme: "HDFC Pension - E (Equity)", units: 12_412, nav: 38.21,
    invested: 320_000, currentValue: 474_267,
  },
  {
    kind: "nps", id: "cas_np_2", pran: "11000091823X", tier: "I",
    scheme: "HDFC Pension - C (Corporate Bonds)", units: 8_109, nav: 28.7,
    invested: 180_000, currentValue: 232_728,
  },
];

export const CAS_FIXTURE_ASSETS: CASAsset[] = [...MFS, ...EQUITIES, ...BONDS, ...INSURANCE, ...NPS];

function valueOf(a: CASAsset): { invested: number; current: number } {
  switch (a.kind) {
    case "mutual_fund":
    case "equity":
    case "bond":
    case "nps":
      return { invested: a.invested, current: a.currentValue };
    case "insurance":
      return { invested: a.premium, current: a.fundValue || a.sumAssured * 0.05 };
  }
}

export function buildParseResult(fileName: string): CASParseResult {
  const assets = CAS_FIXTURE_ASSETS;
  let invested = 0, currentValue = 0;
  const counts: CASParseResult["totals"]["counts"] = {
    mutual_fund: 0, equity: 0, bond: 0, insurance: 0, nps: 0,
  };
  for (const a of assets) {
    const v = valueOf(a);
    invested += v.invested;
    currentValue += v.current;
    counts[a.kind] += 1;
  }
  return {
    id: `cas_${Date.now()}`,
    source: "cams_kfintech",
    fileName,
    parsedAt: new Date().toISOString(),
    panMasked: "ABCDE****J",
    email: "investor@example.com",
    periodFrom: "2025-04-01",
    periodTo: "2026-03-31",
    assets,
    totals: {
      netWorth: currentValue,
      invested,
      gain: currentValue - invested,
      returnPct: ((currentValue - invested) / invested) * 100,
      counts,
    },
  };
}
