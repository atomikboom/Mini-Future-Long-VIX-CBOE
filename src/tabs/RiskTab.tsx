import type { Instrument } from "../types";

type Props = {
  instrument: Instrument;
  liveVix: number | null;
  avgPrice: number;
  totalQty: number;
  totalSpeso: number;
  commission: number;
  fmtE: (n: number) => string;
  vixFromCert: (n: number) => number;
};

export function RiskTab({ instrument, liveVix, avgPrice, totalQty, totalSpeso, commission, fmtE, vixFromCert }: Props) {
  return (
    <div className="fi">
      <div className="risk-grid">
        <div className="card">
          <div className="section">⚠️ Buffer Knock-Out</div>
          {[
            { l: "Prezzo cert oggi", v: fmtE(instrument.priceRef), c: "#f0b429" },
            { l: "VIX live (Yahoo)", v: liveVix !== null ? liveVix.toFixed(2) : "—", c: "#22c55e" },
            { l: "VIX KO", v: instrument.knockOut, c: "#fb7185" },
            { l: "Buffer KO (VIX↓)", v: liveVix ? `${(((liveVix - instrument.knockOut) / liveVix) * 100).toFixed(1)}%` : "—", c: "#f0b429" },
            { l: "VIX break-even", v: vixFromCert(avgPrice), c: "#a78bfa" },
            { l: "Scadenza", v: instrument.scadenza, c: "#94a3b8" },
          ].map((r) => (
            <div key={r.l} className="risk-row">
              <span className="risk-label">{r.l}</span>
              <span className="risk-value" style={{ color: r.c }}>{r.v}</span>
            </div>
          ))}
          <div className="risk-progress"><div style={{ width: `${liveVix ? Math.min(100, Math.max(0, ((liveVix - instrument.knockOut) / liveVix) * 100)) : 0}%` }} /></div>
          <div className="risk-foot"><span>KO ${instrument.knockOut}</span><span>VIX ora ~{liveVix !== null ? liveVix.toFixed(2) : "—"}</span></div>
        </div>

        <div className="card">
          <div className="section">💥 Stress Test — Piano Completo</div>
          {[
            { l: `Max anno cert €${instrument.maxAnno}`, ep: instrument.maxAnno },
            { l: `Max oggi €${instrument.maxOggi}`, ep: instrument.maxOggi },
            { l: `Prezzo ora €${instrument.priceRef}`, ep: instrument.priceRef },
            { l: `Min oggi €${instrument.minOggi}`, ep: instrument.minOggi },
            { l: `Min anno €${instrument.minAnno}`, ep: instrument.minAnno },
            { l: "Cert -30% dal ref", ep: +(instrument.priceRef * 0.7).toFixed(2) },
            { l: "Cert -50% dal ref", ep: +(instrument.priceRef * 0.5).toFixed(2) },
            { l: `KNOCK-OUT (VIX $${instrument.knockOut})`, ep: 0 },
          ].map((s) => {
            const pnl = s.ep === 0 ? -totalSpeso : +(s.ep * totalQty - commission - totalSpeso).toFixed(0);
            const pp = totalSpeso > 0 ? +((pnl / totalSpeso) * 100).toFixed(1) : 0;
            const ko = s.ep === 0;
            return (
              <div key={s.l} className="risk-row">
                <span className="risk-label">{s.l}</span>
                <div className="risk-right">
                  <span className="risk-value strong" style={{ color: ko ? "#fb7185" : pnl >= 0 ? "#22c55e" : "#ef4444" }}>
                    {ko ? `-€${totalSpeso.toFixed(0)}` : `${pnl >= 0 ? "+" : ""}€${pnl}`}
                  </span>
                  <span className="risk-pct">{ko ? "(-100%)" : `(${pp >= 0 ? "+" : ""}${pp}%)`}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="warn top-gap">
        ⚠ <strong>DISCLAIMER:</strong> Mini Future Long a leva variabile su VIX CBOE Future. KO a VIX <strong>${instrument.knockOut}</strong> → perdita totale del capitale. Strike <strong>${instrument.strike}</strong>. VIX min storico ~9 (2017), max ~85 (Covid 2020). Commissioni {fmtE(commission)} incluse per ogni acquisto e vendita. Dati Borsa Italiana {instrument.lastUpdate}. Solo a scopo simulativo — non è consulenza finanziaria.
      </div>
    </div>
  );
}
