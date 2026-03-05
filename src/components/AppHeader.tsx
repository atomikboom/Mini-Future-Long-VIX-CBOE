import type { Instrument, TabId } from "../types";

type Props = {
  instrument: Instrument;
  bnpPriceRef: number | null;
  bnpLastTrade: number | null;
  bnpBid: number | null;
  bnpAsk: number | null;
  bnpMinOggi: number | null;
  bnpMaxOggi: number | null;
  bnpMaxAnno: number | null;
  bnpStrike: number | null;
  bnpKnockOut: number | null;
  bnpScadenza: string | null;
  bnpQuoteTime: string | null;
  bnpStatus: "loading" | "ok" | "error";
  liveStatus: "loading" | "ok" | "error";
  liveVix: number | null;
  liveTs: string;
  liveSource: string;
  doFetch: () => void;
  tab: TabId;
  setTab: (tab: TabId) => void;
  fmtE: (n: number) => string;
};

export function AppHeader({
  instrument,
  bnpPriceRef,
  bnpLastTrade,
  bnpBid,
  bnpAsk,
  bnpMinOggi,
  bnpMaxOggi,
  bnpMaxAnno,
  bnpStrike,
  bnpKnockOut,
  bnpScadenza,
  bnpQuoteTime,
  bnpStatus,
  liveStatus,
  liveVix,
  liveTs,
  liveSource,
  doFetch,
  tab,
  setTab,
  fmtE,
}: Props) {
  const money = (n: number | null) => (n === null ? "—" : fmtE(n));
  const usd = (n: number | null) => (n === null ? "—" : `$${n.toFixed(2)}`);

  const tabs: { id: TabId; l: string }[] = [
    { id: "piano", l: "Piano DCA" },
    { id: "partial", l: "Uscita Parziale / Rimbalzo" },
    { id: "full", l: "Scenari Uscita Totale" },
    { id: "storico", l: "Storico VIX" },
    { id: "rischio", l: "Risk Dashboard" },
  ];

  return (
    <div className="app-header">
      <div className="header-top">
        <div>
          <div className="market-line">
            Borsa Italiana (SeDeX) · {instrument.isin}
            <span className={`status-badge ${bnpStatus === "ok" ? "ok" : bnpStatus === "error" ? "err" : "loading"}`}>
              BNP {bnpStatus === "ok" ? "live" : bnpStatus === "error" ? "offline" : "loading"}
            </span>
            {liveStatus === "loading" && <span className="status-badge loading">Aggiornamento...</span>}
            {liveStatus === "ok" && <span className="status-badge ok">VIX {liveVix?.toFixed(2)} · {liveTs} · {liveSource}</span>}
            {liveStatus === "error" && <span className="status-badge err" onClick={doFetch}>Errore fetch · Clicca per riprovare</span>}
          </div>
          <div className="instrument-name">{instrument.name}</div>
          <div className="stats-row">
              {[
              { l: "Prezzo rif.", v: money(bnpPriceRef), c: "#f0b429" },
              { l: "Ultimo trade", v: bnpLastTrade !== null ? money(bnpLastTrade) : (bnpBid !== null && bnpAsk !== null ? `${money(bnpBid)} / ${money(bnpAsk)}` : "—"), c: "#e8f0ff" },
              { l: "Min oggi", v: money(bnpMinOggi), c: "#ef4444" },
              { l: "Max oggi", v: money(bnpMaxOggi), c: "#22c55e" },
              { l: "Max anno", v: money(bnpMaxAnno), c: "#22c55e" },
              { l: "Strike", v: usd(bnpStrike), c: "#94a3b8" },
              { l: "Knock-Out", v: usd(bnpKnockOut), c: "#fb7185" },
              { l: "Scadenza", v: bnpScadenza ?? "—", c: "#a78bfa" },
              ].map((s) => (
              <div key={s.l} className="stat-item">
                <span className="stat-label">{s.l}</span>
                <span className="stat-value" style={{ color: s.c }}>{s.v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="vix-box">
          <div className="stat-label">VIX live (Yahoo Finance)</div>
          <div className="vix-big">{liveVix !== null ? liveVix.toFixed(2) : "—"}</div>
          <div className="subtle">
            {bnpStatus === "ok" && bnpQuoteTime ? `BNP ${bnpQuoteTime} · ` : ""}
            Cert ref. {money(bnpPriceRef)} · Strike {usd(bnpStrike)}
          </div>
        </div>
      </div>

      <div className="tabs-row" role="tablist" aria-label="Sezioni dashboard">
        {tabs.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={`tab ${tab === t.id ? "on" : "off"}`} onClick={() => setTab(t.id)}>
            {t.l}
          </button>
        ))}
      </div>
    </div>
  );
}
