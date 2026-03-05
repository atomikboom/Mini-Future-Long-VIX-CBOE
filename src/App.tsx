import { lazy, Suspense, useMemo, useState } from "react";
import instrumentRaw from "./config/instrument.json";
import { AppHeader } from "./components/AppHeader";
import { GlobalKpis } from "./components/GlobalKpis";
import { ParametersPanel } from "./components/ParametersPanel";
import { useBnpQuote } from "./hooks/useBnpQuote";
import { useVixLive } from "./hooks/useVixLive";
import { ALLOC_LABELS, buildEntries, certFromVix, COLORS, type AllocType, sumBy, vixFromCert } from "./lib/calculations";
import { fmt, fmtE, sign, signE } from "./lib/format";
import type { BounceScenario, ExitScenario, Instrument, TabId } from "./types";
import "./styles/tokens.css";
import "./styles/dashboard.css";

const PianoTab = lazy(() => import("./tabs/PianoTab").then((m) => ({ default: m.PianoTab })));
const PartialTab = lazy(() => import("./tabs/PartialTab").then((m) => ({ default: m.PartialTab })));
const FullTab = lazy(() => import("./tabs/FullTab").then((m) => ({ default: m.FullTab })));
const StoricoTab = lazy(() => import("./tabs/StoricoTab").then((m) => ({ default: m.StoricoTab })));
const RiskTab = lazy(() => import("./tabs/RiskTab").then((m) => ({ default: m.RiskTab })));

const INSTRUMENT = instrumentRaw as Instrument;
const COM = 2.95;

const staticHistory = [
  { d: "Gen 25", v: 14.8 }, { d: "Feb 25", v: 15.2 },
  { d: "Mar 25", v: 22.5 }, { d: "Apr 25", v: 34.8 },
  { d: "Mag 25", v: 20.1 }, { d: "Giu 25", v: 16.4 },
  { d: "Lug 25", v: 15.9 }, { d: "Ago 25", v: 18.3 },
  { d: "Set 25", v: 17.1 }, { d: "Ott 25", v: 19.4 },
  { d: "Nov 25", v: 15.7 }, { d: "Dic 25", v: 17.78 },
  { d: "Gen 26", v: 17.8 }, { d: "Feb 26", v: 19.6 },
  { d: "3 Mar", v: vixFromCert(INSTRUMENT.maxAnno, INSTRUMENT.strike, INSTRUMENT.fxRate) },
  { d: "4 Mar ▶", v: vixFromCert(INSTRUMENT.priceRef, INSTRUMENT.strike, INSTRUMENT.fxRate) },
];

export default function App() {
  const [budget, setBudget] = useState(5000);
  const [firstEntry, setFirstEntry] = useState(+INSTRUMENT.priceRef.toFixed(2));
  const [step, setStep] = useState(0.25);
  const [numEntries, setNumEntries] = useState(5);
  const [alloc, setAlloc] = useState<AllocType>("pyramid");
  const [commission, setCommission] = useState(COM);
  const [tab, setTab] = useState<TabId>("piano");

  const { liveVix, liveHistory, liveStatus, liveTs, liveSource, doFetch } = useVixLive();
  const {
    priceRef: bnpPriceRef,
    lastTrade: bnpLastTrade,
    bid: bnpBid,
    ask: bnpAsk,
    minOggi: bnpMinOggi,
    maxOggi: bnpMaxOggi,
    maxAnno: bnpMaxAnno,
    strike: bnpStrike,
    knockOut: bnpKnockOut,
    scadenza: bnpScadenza,
    quoteTime,
    bnpStatus,
  } = useBnpQuote();

  const entries = useMemo(
    () =>
      buildEntries({
        budget,
        firstEntry,
        step,
        numEntries,
        alloc,
        commission,
        strike: INSTRUMENT.strike,
        fxRate: INSTRUMENT.fxRate,
      }),
    [budget, firstEntry, step, numEntries, alloc, commission],
  );

  const totalQty = sumBy(entries, (e) => e.qty);
  const totalSpeso = sumBy(entries, (e) => e.speso);
  const totalComm = sumBy(entries, (e) => e.commission);
  const totalPuro = totalSpeso - totalComm;
  const avgPrice = totalQty > 0 ? +(totalPuro / totalQty).toFixed(3) : 0;
  const rimanente = +(budget - totalSpeso).toFixed(2);

  const [partialN, setPartialN] = useState(1);
  const [exitPrice, setExitPrice] = useState(+(firstEntry * 1.1).toFixed(2));

  const partialEntries = useMemo(() => entries.slice(0, partialN), [entries, partialN]);
  const partialQty = sumBy(partialEntries, (e) => e.qty);
  const partialSpeso = sumBy(partialEntries, (e) => e.speso);
  const partialComm = sumBy(partialEntries, (e) => e.commission);
  const partialPuro = partialSpeso - partialComm;
  const partialAvg = partialQty > 0 ? +(partialPuro / partialQty).toFixed(3) : 0;

  const ricavoLordo = +(exitPrice * partialQty).toFixed(2);
  const commVendita = commission;
  const ricavoNetto = +(ricavoLordo - commVendita).toFixed(2);
  const pnlNetto = +(ricavoNetto - partialSpeso).toFixed(2);
  const pnlPct = partialSpeso > 0 ? +((pnlNetto / partialSpeso) * 100).toFixed(2) : 0;
  const bePrice = partialQty > 0 ? +((partialSpeso + commVendita) / partialQty).toFixed(3) : 0;

  const bounceScenarios = useMemo<BounceScenario[]>(() => {
    if (!partialQty) return [];
    return [-20, -15, -10, -5, -2, 0, 2, 5, 10, 15, 20, 30, 40, 50, 75, 100].map((pct) => {
      const ep = +(partialAvg * (1 + pct / 100)).toFixed(2);
      const rl = +(ep * partialQty).toFixed(2);
      const pnl = +(rl - commVendita - partialSpeso).toFixed(2);
      const pp = +((pnl / partialSpeso) * 100).toFixed(1);
      return { pct, ep, pnl, pp };
    });
  }, [partialQty, partialAvg, partialSpeso, commVendita]);

  const exitPrices = useMemo<ExitScenario[]>(() => {
    const min = +(avgPrice * 0.4).toFixed(2);
    const max = +(avgPrice * 2.5).toFixed(2);
    const pts: number[] = [];
    for (let p = min; p <= max + 0.01; p = +(p + 0.25).toFixed(2)) pts.push(p);

    return pts.map((ep) => {
      const rl = +(ep * totalQty).toFixed(2);
      const pnl = +(rl - commission - totalSpeso).toFixed(2);
      const pp = totalSpeso > 0 ? +((pnl / totalSpeso) * 100).toFixed(1) : 0;
      return { ep: +ep.toFixed(2), pnl, pp };
    });
  }, [totalQty, totalSpeso, avgPrice, commission]);

  const activeHistory = liveHistory.length > 0 ? liveHistory : staticHistory;
  const histData = activeHistory.map((d) => ({ ...d, cert: certFromVix(d.v, INSTRUMENT.strike, INSTRUMENT.fxRate) }));

  const certFromVixNow = (n: number) => certFromVix(n, INSTRUMENT.strike, INSTRUMENT.fxRate);
  const vixFromCertNow = (n: number) => vixFromCert(n, INSTRUMENT.strike, INSTRUMENT.fxRate);

  return (
    <div className="app-shell">
      <AppHeader
        instrument={INSTRUMENT}
        bnpPriceRef={bnpPriceRef}
        bnpLastTrade={bnpLastTrade}
        bnpBid={bnpBid}
        bnpAsk={bnpAsk}
        bnpMinOggi={bnpMinOggi}
        bnpMaxOggi={bnpMaxOggi}
        bnpMaxAnno={bnpMaxAnno}
        bnpStrike={bnpStrike}
        bnpKnockOut={bnpKnockOut}
        bnpScadenza={bnpScadenza}
        bnpQuoteTime={quoteTime}
        bnpStatus={bnpStatus}
        liveStatus={liveStatus}
        liveVix={liveVix}
        liveTs={liveTs}
        liveSource={liveSource}
        doFetch={doFetch}
        tab={tab}
        setTab={setTab}
        fmtE={fmtE}
      />

      <div className="app-content">
        <div className="expired-banner bottom-gap">
          {liveStatus === "ok"
            ? <>VIX <strong>{liveVix?.toFixed(2)}</strong> · {liveSource} · Aggiornato <strong>{liveTs}</strong> · Cert ref. <strong>{fmtE(INSTRUMENT.priceRef)}</strong> · Strike <strong>${INSTRUMENT.strike}</strong> · KO <strong>${INSTRUMENT.knockOut}</strong> · Scadenza <strong>{INSTRUMENT.scadenza}</strong></>
            : <>Cert ref. <strong>{fmtE(INSTRUMENT.priceRef)}</strong> (04/03/2026 ore 21:59) · Strike <strong>${INSTRUMENT.strike}</strong> · KO <strong>${INSTRUMENT.knockOut}</strong> · VIX implicito ~<strong>{vixFromCertNow(INSTRUMENT.priceRef)}</strong> · {liveStatus === "loading" ? "Caricamento dati live..." : "Dati offline"}</>
          }
        </div>

        <ParametersPanel
          budget={budget}
          setBudget={setBudget}
          firstEntry={firstEntry}
          setFirstEntry={setFirstEntry}
          step={step}
          setStep={setStep}
          numEntries={numEntries}
          setNumEntries={setNumEntries}
          alloc={alloc}
          setAlloc={setAlloc}
          commission={commission}
          setCommission={setCommission}
        />

        <GlobalKpis
          budget={budget}
          totalSpeso={totalSpeso}
          totalComm={totalComm}
          rimanente={rimanente}
          totalQty={totalQty}
          avgPrice={avgPrice}
          fmtE={fmtE}
          vixFromCert={vixFromCertNow}
        />

        <Suspense fallback={<div className="card">Caricamento sezione...</div>}>
          {tab === "piano" && (
            <PianoTab
              entries={entries}
              totalQty={totalQty}
              totalSpeso={totalSpeso}
              totalComm={totalComm}
              avgPrice={avgPrice}
              commission={commission}
              instrument={INSTRUMENT}
              colors={COLORS}
              fmtE={fmtE}
              signE={signE}
              sign={sign}
              vixFromCert={vixFromCertNow}
              certFromVix={certFromVixNow}
            />
          )}

          {tab === "partial" && (
            <PartialTab
              numEntries={numEntries}
              partialN={partialN}
              setPartialN={setPartialN}
              exitPrice={exitPrice}
              setExitPrice={setExitPrice}
              partialAvg={partialAvg}
              partialQty={partialQty}
              partialSpeso={partialSpeso}
              partialComm={partialComm}
              ricavoNetto={ricavoNetto}
              pnlNetto={pnlNetto}
              pnlPct={pnlPct}
              bePrice={bePrice}
              commVendita={commVendita}
              partialEntries={partialEntries}
              bounceScenarios={bounceScenarios}
              vixFromCert={vixFromCertNow}
              fmtE={fmtE}
              signE={signE}
              sign={sign}
            />
          )}

          {tab === "full" && (
            <FullTab
              exitPrices={exitPrices}
              firstEntry={firstEntry}
              avgPrice={avgPrice}
              numEntries={numEntries}
              totalQty={totalQty}
              commission={commission}
              fmtE={fmtE}
              signE={signE}
              vixFromCert={vixFromCertNow}
            />
          )}

          {tab === "storico" && (
            <StoricoTab
              instrument={INSTRUMENT}
              histData={histData}
              avgPrice={avgPrice}
              certFromVix={certFromVixNow}
              vixFromCert={vixFromCertNow}
              fmtE={fmtE}
            />
          )}

          {tab === "rischio" && (
            <RiskTab
              instrument={INSTRUMENT}
              liveVix={liveVix}
              avgPrice={avgPrice}
              totalQty={totalQty}
              totalSpeso={totalSpeso}
              commission={commission}
              fmtE={fmtE}
              vixFromCert={vixFromCertNow}
            />
          )}
        </Suspense>
      </div>

      <div className="sr-only">{ALLOC_LABELS[alloc]} · {fmt(commission)}</div>
    </div>
  );
}
