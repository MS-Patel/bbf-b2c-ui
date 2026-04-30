/**
 * CAS (Consolidated Account Statement) import types.
 * Phase 1: parsed entirely client-side from a fixture; the wire shape is
 * stable so the parser can later be swapped for a server function or
 * edge-function driven PDF parser without touching consumers.
 */

export type CASSource = "cams_kfintech" | "nsdl" | "cdsl";

export type AssetKind =
  | "mutual_fund"
  | "equity"
  | "bond"
  | "insurance"
  | "nps";

export interface CASMutualFund {
  kind: "mutual_fund";
  id: string;
  amc: string;
  folio: string;
  registrar: "CAMS" | "KFintech";
  scheme: string;
  isin: string;
  units: number;
  avgNav: number;
  currentNav: number;
  invested: number;
  currentValue: number;
}

export interface CASEquity {
  kind: "equity";
  id: string;
  symbol: string;
  company: string;
  isin: string;
  exchange: "NSE" | "BSE";
  depository: "NSDL" | "CDSL";
  dpId: string;
  qty: number;
  avgPrice: number;
  ltp: number;
  invested: number;
  currentValue: number;
}

export interface CASBond {
  kind: "bond";
  id: string;
  issuer: string;
  isin: string;
  faceValue: number;
  units: number;
  couponPct: number;
  maturity: string; // ISO date
  invested: number;
  currentValue: number;
}

export interface CASInsurance {
  kind: "insurance";
  id: string;
  insurer: string;
  policyNumber: string;
  product: string;
  type: "ulip" | "endowment" | "term";
  sumAssured: number;
  premium: number;
  fundValue: number;
  maturity: string;
}

export interface CASNps {
  kind: "nps";
  id: string;
  pran: string;
  tier: "I" | "II";
  scheme: string;
  units: number;
  nav: number;
  invested: number;
  currentValue: number;
}

export type CASAsset =
  | CASMutualFund
  | CASEquity
  | CASBond
  | CASInsurance
  | CASNps;

export interface CASParseResult {
  id: string;
  source: CASSource;
  fileName: string;
  parsedAt: string; // ISO
  panMasked: string;
  email: string;
  periodFrom: string;
  periodTo: string;
  assets: CASAsset[];
  totals: {
    netWorth: number;
    invested: number;
    gain: number;
    returnPct: number;
    counts: Record<AssetKind, number>;
  };
}

export type ImportSelection = Record<string, boolean>; // assetId -> included
