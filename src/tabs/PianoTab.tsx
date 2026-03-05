import type { CommonTabProps } from "../types";

export function PianoTab({ entries, totalSpeso, totalQty, totalComm, avgPrice, colors, fmtE, vixFromCert }: CommonTabProps) {
  return (
    <div className="fi">
      <div className="card">
        <div className="section">📋 Piano Ingressi Graduali (commissione {fmtE(totalComm / Math.max(entries.length, 1))} per operazione)</div>
        <div className="table-scroll">
          <div className="grid-head-main">
            {["#", "Prezzo €", "VIX", "Cert.", "Comm.", "Speso", "PMC", "Peso"].map((h) => (
              <div key={h} className="th">{h}</div>
            ))}
          </div>
          {entries.map((e, i) => {
            const pct = totalSpeso > 0 ? +((e.speso / totalSpeso) * 100).toFixed(1) : 0;
            return (
              <div key={i} className="grid-entries">
                <div className="cell strong gold">{i + 1}</div>
                <div className="cell strong">€{e.price.toFixed(2)}</div>
                <div className="cell muted">{e.vix}</div>
                <div className="cell strong green">{e.qty}</div>
                <div className="cell purple">{fmtE(e.commission)}</div>
                <div className="cell">{fmtE(e.speso)}</div>
                <div className="cell gold">{fmtE(e.qty > 0 ? +((e.speso - e.commission) / e.qty).toFixed(3) : 0)}</div>
                <div className="cell">
                  <div className="weight-row">
                    <div className="weight-bar">
                      <div style={{ width: `${pct}%`, height: "100%", background: colors[i % colors.length], borderRadius: 2 }} />
                    </div>
                    <span className="muted">{pct}%</span>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="grid-foot-main">
            <div className="cell muted strong">Σ</div>
            <div className="cell strong gold">{fmtE(avgPrice)}</div>
            <div className="cell muted">{vixFromCert(avgPrice)}</div>
            <div className="cell strong green">{totalQty}</div>
            <div className="cell strong purple">{fmtE(totalComm)}</div>
            <div className="cell strong">{fmtE(totalSpeso)}</div>
            <div className="cell strong gold">{fmtE(avgPrice)}</div>
            <div className="cell muted">100%</div>
          </div>
        </div>
      </div>

      <div className="card top-gap">
        <div className="section">📊 Distribuzione Capitale per Ingresso</div>
        <div className="alloc-bar">
          {entries.map((e, i) => (
            <div key={i} style={{ flex: e.speso / Math.max(totalSpeso, 1), background: colors[i % colors.length] }} className="alloc-segment">
              <span className="alloc-segment-label">€{e.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="legend-row">
          {entries.map((e, i) => (
            <span key={i} className="legend-item">
              <span className="legend-dot" style={{ background: colors[i % colors.length] }} />
              #{i + 1} €{e.price.toFixed(2)} · {e.qty}x · {fmtE(e.speso)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
