import { Area, AreaChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "../components/ChartTooltip";
import type { ExitScenario } from "../types";

type Props = {
  exitPrices: ExitScenario[];
  firstEntry: number;
  avgPrice: number;
  numEntries: number;
  totalQty: number;
  commission: number;
  fmtE: (n: number) => string;
  signE: (n: number) => string;
  vixFromCert: (n: number) => number;
};

export function FullTab({ exitPrices, firstEntry, avgPrice, numEntries, totalQty, commission, fmtE, signE, vixFromCert }: Props) {
  return (
    <div className="fi">
      <div className="card">
        <div className="section">🎯 Scenari Uscita — Tutti {numEntries} ingressi · {totalQty} cert · PMC {fmtE(avgPrice)} · Comm. vendita {fmtE(commission)}</div>
        <div className="table-scroll">
          <div className="grid-head-bounce">{["Prezzo €", "VIX", "P&L netto", "Rend.", ""].map((h) => <div key={h} className="th">{h}</div>)}</div>
          {exitPrices.map((s) => {
            const isCur = Math.abs(s.ep - firstEntry) < 0.13;
            const isBE = Math.abs(s.ep - avgPrice) < 0.13;
            let lbl = "PERDITA";
            let lblC = "#ef4444";
            let lblBg = "#1c0a0a";
            if (s.pnl > 0) { lbl = "PROFIT"; lblC = "#22c55e"; lblBg = "#052e16"; }
            if (isBE) { lbl = "BREAK EVEN"; lblC = "#f0b429"; lblBg = "#1c1200"; }
            return (
              <div key={s.ep} className="grid-row-bounce" style={{ background: isCur ? "#0a1520" : "transparent" }}>
                <div className="cell" style={{ color: isCur ? "#f0b429" : "#e8f0ff", fontWeight: isCur ? 700 : 400 }}>€{s.ep.toFixed(2)}{isCur ? " ◀" : ""}</div>
                <div className="cell muted">{vixFromCert(s.ep)}</div>
                <div className="cell" style={{ color: s.pnl >= 0 ? "#22c55e" : "#ef4444", fontWeight: 600 }}>{signE(s.pnl)}</div>
                <div className="cell" style={{ color: s.pnl >= 0 ? "#22c55e" : "#ef4444", fontWeight: 600 }}>{s.pp >= 0 ? "+" : ""}{s.pp}%</div>
                <div className="cell"><span className="badge" style={{ background: lblBg, color: lblC }}>{lbl}</span></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card top-gap">
        <div className="section">📈 Curva P&L Totale</div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={exitPrices} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="ep" tickFormatter={(v) => `€${v}`} tick={{ fill: "#9fb2c8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#9fb2c8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v}`} />
            <ReferenceLine y={0} stroke="#2a3a5c" strokeDasharray="4 2" />
            <ReferenceLine x={avgPrice} stroke="#f0b429" strokeDasharray="4 2" label={{ value: "PMC", fill: "#f0b429", fontSize: 10 }} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="pnl" name="P&L netto" stroke="#22c55e" fill="url(#g2)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
