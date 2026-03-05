import type { Entry } from "./lib/calculations";
export type { Entry } from "./lib/calculations";

export type Instrument = {
  isin: string;
  name: string;
  priceRef: number;
  lastTrade: number;
  minOggi: number;
  maxOggi: number;
  maxAnno: number;
  minAnno: number;
  leverage: number;
  strike: number;
  knockOut: number;
  fxRate: number;
  scadenza: string;
  lastUpdate: string;
  expired: boolean;
};

export type ExitScenario = { ep: number; pnl: number; pp: number };
export type BounceScenario = { pct: number; ep: number; pnl: number; pp: number };

export type TabId = "piano" | "partial" | "full" | "storico" | "rischio";

export type CommonTabProps = {
  entries: Entry[];
  totalQty: number;
  totalSpeso: number;
  totalComm: number;
  avgPrice: number;
  commission: number;
  instrument: Instrument;
  colors: string[];
  fmtE: (n: number) => string;
  signE: (n: number) => string;
  sign: (n: number) => string;
  vixFromCert: (n: number) => number;
  certFromVix: (n: number) => number;
};
