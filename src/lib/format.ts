export const fmt = (n: number, d = 2): string => n.toFixed(d);
export const fmtE = (n: number): string => `€${n.toFixed(2)}`;
export const sign = (n: number): string => (n >= 0 ? "+" : "") + fmt(n, 2);
export const signE = (n: number): string => (n >= 0 ? "+" : "") + fmtE(n);
