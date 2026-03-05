export type AllocType = "equal" | "pyramid" | "aggressive";

export type Entry = {
  i: number;
  price: number;
  qty: number;
  speso: number;
  vix: number;
  commission: number;
};

export const ALLOC_LABELS: Record<AllocType, string> = {
  equal: "Uguale",
  pyramid: "Piramidale ↑ sui dip",
  aggressive: "Aggressiva (tutto sui dip)",
};

export const COLORS = ["#f0b429", "#e8a020", "#d88a18", "#c87510", "#b86008"];

export const certFromVix = (vix: number, strike: number, fxRate: number): number =>
  +Math.max(0, (vix - strike) / fxRate).toFixed(3);

export const vixFromCert = (price: number, strike: number, fxRate: number): number =>
  +(price * fxRate + strike).toFixed(2);

export const getAlloc = (type: AllocType, n: number, total: number): number[] => {
  if (type === "equal") return Array(n).fill(total / n);

  const pyramid = [1, 1.5, 2, 2.5, 3, 3.5, 4, 5];
  const aggressive = [0.3, 0.6, 1, 1.8, 3, 4.5, 6, 8];
  const weights = (type === "pyramid" ? pyramid : aggressive).slice(0, n);
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => (w / sum) * total);
};

export const buildEntries = ({
  budget,
  firstEntry,
  step,
  numEntries,
  alloc,
  commission,
  strike,
  fxRate,
}: {
  budget: number;
  firstEntry: number;
  step: number;
  numEntries: number;
  alloc: AllocType;
  commission: number;
  strike: number;
  fxRate: number;
}): Entry[] => {
  const allocs = getAlloc(alloc, numEntries, budget);
  return Array.from({ length: numEntries }, (_, i) => {
    const price = +(firstEntry - i * step).toFixed(2);
    const capitalBrutto = allocs[i];
    const qty = Math.max(0, Math.floor((capitalBrutto - commission) / price));
    const speso = +(qty * price + commission).toFixed(2);
    const vix = vixFromCert(price, strike, fxRate);
    return { i, price, qty, speso, vix, commission };
  });
};

export const sumBy = <T,>(rows: T[], getter: (row: T) => number): number =>
  rows.reduce((acc, row) => acc + getter(row), 0);
