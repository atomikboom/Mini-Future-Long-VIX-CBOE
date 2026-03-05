import { Area, AreaChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "../components/ChartTooltip";
import type { BounceScenario, Entry } from "../types";

type Props = {
  numEntries: number;
  partialN: number;
  setPartialN: (v: number) => void;
  exitPrice: number;
  setExitPrice: (v: number) => void;
  partialAvg: number;
  partialQty: number;
  partialSpeso: number;
  partialComm: number;
  ricavoNetto: number;
  pnlNetto: number;
  pnlPct: number;
  bePrice: number;
  commVendita: number;
  partialEntries: Entry[];
  bounceScenarios: BounceScenario[];
  vixFromCert: (n: number) => number;
  fmtE: (n: number) => string;
  signE: (n: number) => string;
  sign: (n: number) => string;
};

export function PartialTab(props: Props) {
  const {
    numEntries,
    partialN,
    setPartialN,
    exitPrice,
    setExitPrice,
    partialAvg,
    partialQty,
    partialSpeso,
    partialComm,
    ricavoNetto,
    pnlNetto,
    pnlPct,
    bePrice,
    commVendita,
    partialEntries,
    bounceScenarios,
    vixFromCert,
    fmtE,
    signE,
    sign,
  } = props;

  return (
    <div className="fi">
      <div className="card bottom-gap">
        <div className="section">🎯 Simula Uscita — dopo quanti ingressi vendi?</div>
        <div className="param-grid">
          <div>
            <div className="sl-row">
              <span className="sl-lbl">Ingressi effettuati</span>
              <input aria-label="Ingressi effettuati" type="range" min={1} max={numEntries} step={1} value={partialN} onChange={(e) => setPartialN(+e.target.value)} />
              <span className="sl-val">{partialN} / {numEntries}</span>
            </div>
            <div className="sl-row">
              <span className="sl-lbl">Prezzo di uscita (€)</span>
              <input
                aria-label="Prezzo di uscita"
                type="range"
                min={+(partialAvg * 0.5).toFixed(2)}
                max={+(partialAvg * 2.5).toFixed(2)}
                step={0.05}
                value={exitPrice}
                onChange={(e) => setExitPrice(+e.target.value)}
              />
              <span className="sl-val">€{exitPrice.toFixed(2)}</span>
            </div>
            <div className="muted-line">VIX implicito uscita: <strong className="gold">{vixFromCert(exitPrice)}</strong></div>
          </div>

          <div className="kpi-grid-small">
            {[
              { l: "Cert. acquistati", v: partialQty, c: "" },
              { l: "Totale investito", v: fmtE(partialSpeso), c: "gold" },
              { l: "Comm. acquisto", v: fmtE(partialComm), c: "purple" },
              { l: "PMC netto", v: fmtE(partialAvg), c: "" },
              { l: "Comm. vendita", v: fmtE(commVendita), c: "purple" },
              { l: "Ricavo netto", v: fmtE(ricavoNetto), c: "" },
              { l: "P&L netto", v: `${signE(pnlNetto)}`, c: pnlNetto >= 0 ? "green" : "red" },
              { l: "Rendimento", v: `${sign(pnlPct)}%`, c: pnlPct >= 0 ? "green" : "red" },
              { l: "Break-even price", v: fmtE(bePrice), c: "gold" },
              { l: "Break-even VIX", v: `${vixFromCert(bePrice)}`, c: "gold" },
            ].map((s) => (
              <div key={s.l} className="mini-card">
                <div className="lbl">{s.l}</div>
                <div className={`val ${s.c} val-sm`}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card bottom-gap">
        <div className="section">📋 Ingressi effettuati ({partialN})</div>
        <div className="table-scroll">
          <div className="grid-head-partial">{["#", "Prezzo", "VIX", "Cert.", "Comm.", "Speso"].map((h) => <div key={h} className="th">{h}</div>)}</div>
          {partialEntries.map((e, i) => (
            <div key={i} className="grid-row-partial">
              <div className="cell strong gold">{i + 1}</div>
              <div className="cell">€{e.price.toFixed(2)}</div>
              <div className="cell muted">{e.vix}</div>
              <div className="cell strong green">{e.qty}</div>
              <div className="cell purple">{fmtE(e.commission)}</div>
              <div className="cell">{fmtE(e.speso)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="section">📈 Scenari Rimbalzo — dal PMC {fmtE(partialAvg)} (incluse commissioni acquisto + vendita)</div>
        <div className="table-scroll">
          <div className="grid-head-bounce">{["Variaz.%", "Prezzo €", "VIX", "P&L netto", "Rend."].map((h) => <div key={h} className="th">{h}</div>)}</div>
          {bounceScenarios.map((s) => {
            const isEntry = Math.abs(s.ep - exitPrice) < 0.13;
            const isBE = Math.abs(s.ep - bePrice) < 0.13;
            let lbl = "";
            let lblC = "#9db1cc";
            let lblBg = "transparent";
            if (s.pnl > 0) { lbl = "PROFIT"; lblC = "#22c55e"; lblBg = "#052e16"; }
            if (s.pnl < 0) { lbl = "PERDITA"; lblC = "#ef4444"; lblBg = "#1c0a0a"; }
            if (isBE) { lbl = "BREAK EVEN"; lblC = "#f0b429"; lblBg = "#1c1200"; }
            return (
              <div key={s.pct} className="grid-row-bounce" style={{ background: isEntry ? "#0a1520" : "transparent" }}>
                <div className="cell" style={{ color: s.pct >= 0 ? "#22c55e" : "#ef4444", fontWeight: 600 }}>{s.pct >= 0 ? "+" : ""}{s.pct}%</div>
                <div className="cell" style={{ color: isEntry ? "#f0b429" : "#e8f0ff", fontWeight: isEntry ? 700 : 400 }}>€{s.ep.toFixed(2)}{isEntry ? " ◀" : ""}</div>
                <div className="cell muted">{vixFromCert(s.ep)}</div>
                <div className="cell" style={{ color: s.pnl >= 0 ? "#22c55e" : "#ef4444", fontWeight: 600 }}>{signE(s.pnl)}</div>
                <div className="cell"><span className="badge" style={{ background: lblBg, color: lblC }}>{s.pp >= 0 ? "+" : ""}{s.pp}% {lbl}</span></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card top-gap">
        <div className="section">📊 Curva P&L — {partialN} ingresso{partialN > 1 ? "i" : ""} effettuato{partialN > 1 ? "i" : ""}</div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={bounceScenarios} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="ep" tickFormatter={(v) => `€${v}`} tick={{ fill: "#9fb2c8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#9fb2c8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v}`} />
            <ReferenceLine y={0} stroke="#2a3a5c" strokeDasharray="4 2" />
            <ReferenceLine x={bePrice} stroke="#f0b429" strokeDasharray="4 2" label={{ value: "BE", fill: "#f0b429", fontSize: 10 }} />
            <ReferenceLine x={exitPrice} stroke="#22c55e" strokeDasharray="4 2" label={{ value: "EXIT", fill: "#22c55e", fontSize: 10 }} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="pnl" name="P&L netto" stroke="#22c55e" fill="url(#g1)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
