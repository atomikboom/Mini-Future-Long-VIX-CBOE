import { Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Instrument } from "../types";

type HistRow = { d: string; v: number; cert: number };

type Props = {
  instrument: Instrument;
  histData: HistRow[];
  avgPrice: number;
  certFromVix: (n: number) => number;
  vixFromCert: (n: number) => number;
  fmtE: (n: number) => string;
};

export function StoricoTab({ instrument, histData, avgPrice, certFromVix, vixFromCert, fmtE }: Props) {
  return (
    <div className="fi">
      <div className="card">
        <div className="section">📉 Storico VIX 2025-2026 + Prezzo Cert. Stimato</div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={histData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <XAxis dataKey="d" tick={{ fill: "#9fb2c8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="l" tick={{ fill: "#9fb2c8", fontSize: 11 }} axisLine={false} tickLine={false} domain={[10, 40]} />
            <YAxis yAxisId="r" orientation="right" tick={{ fill: "#9fb2c8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v}`} />
            <ReferenceLine yAxisId="l" y={instrument.knockOut} stroke="#fb7185" strokeDasharray="4 2" label={{ value: "KO", fill: "#fb7185", fontSize: 10 }} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="chart-tooltip">
                    <div className="chart-tooltip-title">{label}</div>
                    <div>VIX: <strong>{payload[0]?.value as any}</strong></div>
                    <div>Cert ~: <strong className="purple">€{payload[1]?.value as any}</strong></div>
                  </div>
                );
              }}
            />
            <Line yAxisId="l" type="monotone" dataKey="v" stroke="#f0b429" strokeWidth={2} dot={{ fill: "#f0b429", r: 3 }} name="VIX" />
            <Line yAxisId="r" type="monotone" dataKey="cert" stroke="#a78bfa" strokeWidth={2} dot={{ fill: "#a78bfa", r: 3 }} strokeDasharray="6 2" name="Cert €" />
          </LineChart>
        </ResponsiveContainer>
        <div className="legend-row centered">
          {[{ c: "#f0b429", l: "VIX" }, { c: "#a78bfa", l: "Prezzo Cert. stimato" }, { c: "#fb7185", l: "Livello KO" }].map((i) => (
            <span key={i.l} className="legend-item">
              <span className="legend-line" style={{ background: i.c }} />
              {i.l}
            </span>
          ))}
        </div>
      </div>

      <div className="kpi-grid-hist top-gap">
        {[
          { l: "VIX min 2025", v: "14.8", sub: `cert ~€${certFromVix(14.8)}`, c: "#22c55e" },
          { l: "VIX max 2025", v: "34.8", sub: `cert ~€${certFromVix(34.8)}`, c: "#ef4444" },
          { l: "Max anno cert", v: fmtE(instrument.maxAnno), sub: `03/03/26 · VIX ~${vixFromCert(instrument.maxAnno)}`, c: "#22c55e" },
          { l: "Prezzo rif. oggi", v: fmtE(instrument.priceRef), sub: `04/03/26 · VIX ~${vixFromCert(instrument.priceRef)}`, c: "#f0b429" },
          { l: "Min anno cert", v: fmtE(instrument.minAnno), sub: `13/01/26 · VIX ~${vixFromCert(instrument.minAnno)}`, c: "#ef4444" },
          { l: "VIX break-even", v: vixFromCert(avgPrice), sub: `PMC cert €${avgPrice}`, c: "#a78bfa" },
          { l: "VIX knock-out", v: `$${instrument.knockOut}`, sub: "cert = €0 (perdita totale)", c: "#fb7185" },
        ].map((s) => (
          <div key={s.l} className="kpi-card">
            <div className="lbl">{s.l}</div>
            <div className="val" style={{ color: s.c, fontSize: "1.3rem" }}>{s.v}</div>
            <div className="sub">{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
