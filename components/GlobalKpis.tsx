type Props = {
  budget: number;
  totalSpeso: number;
  totalComm: number;
  rimanente: number;
  totalQty: number;
  avgPrice: number;
  fmtE: (n: number) => string;
  vixFromCert: (n: number) => number;
};

export function GlobalKpis({ budget, totalSpeso, totalComm, rimanente, totalQty, avgPrice, fmtE, vixFromCert }: Props) {
  return (
    <div className="kpi-grid-main bottom-gap">
      {[
        { l: "Budget", v: fmtE(budget), c: "" },
        { l: "Totale investito", v: fmtE(totalSpeso), c: "gold" },
        { l: "di cui commissioni", v: fmtE(totalComm), c: "purple" },
        { l: "Rimanente", v: fmtE(rimanente), c: rimanente >= 0 ? "" : "red" },
        { l: "Cert. totali", v: totalQty, c: "gold" },
        { l: "PMC (netto comm)", v: fmtE(avgPrice), c: "" },
        { l: "VIX break-even", v: vixFromCert(avgPrice), c: "" },
      ].map((s) => (
        <div key={s.l} className="kpi-card">
          <div className="lbl">{s.l}</div>
          <div className={`val ${s.c}`}>{s.v}</div>
        </div>
      ))}
    </div>
  );
}
