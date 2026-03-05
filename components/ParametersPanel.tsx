import { ALLOC_LABELS, type AllocType } from "../lib/calculations";

type Props = {
  budget: number;
  setBudget: (v: number) => void;
  firstEntry: number;
  setFirstEntry: (v: number) => void;
  step: number;
  setStep: (v: number) => void;
  numEntries: number;
  setNumEntries: (v: number) => void;
  alloc: AllocType;
  setAlloc: (v: AllocType) => void;
  commission: number;
  setCommission: (v: number) => void;
};

export function ParametersPanel(props: Props) {
  const {
    budget,
    setBudget,
    firstEntry,
    setFirstEntry,
    step,
    setStep,
    numEntries,
    setNumEntries,
    alloc,
    setAlloc,
    commission,
    setCommission,
  } = props;

  return (
    <div className="card bottom-gap">
      <div className="section">⚙ Parametri</div>
      <div className="param-grid">
        <div>
          <div className="sl-row"><span className="sl-lbl">Budget totale</span><input aria-label="Budget totale" type="range" min={500} max={20000} step={500} value={budget} onChange={(e) => setBudget(+e.target.value)} /><span className="sl-val">€{budget.toLocaleString()}</span></div>
          <div className="sl-row"><span className="sl-lbl">1° ingresso (€)</span><input aria-label="Primo ingresso" type="range" min={3} max={20} step={0.25} value={firstEntry} onChange={(e) => setFirstEntry(+e.target.value)} /><span className="sl-val">€{firstEntry.toFixed(2)}</span></div>
          <div className="sl-row"><span className="sl-lbl">Step tra ingressi</span><input aria-label="Step ingressi" type="range" min={0.05} max={1} step={0.05} value={step} onChange={(e) => setStep(+e.target.value)} /><span className="sl-val">€{step.toFixed(2)}</span></div>
        </div>
        <div>
          <div className="sl-row"><span className="sl-lbl">N° ingressi</span><input aria-label="Numero ingressi" type="range" min={1} max={8} step={1} value={numEntries} onChange={(e) => setNumEntries(+e.target.value)} /><span className="sl-val">{numEntries}</span></div>
          <div className="sl-row align-center"><span className="sl-lbl">Allocazione</span><select aria-label="Tipo allocazione" value={alloc} onChange={(e) => setAlloc(e.target.value as AllocType)} style={{ flex: 1 }}>{Object.entries(ALLOC_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          <div className="sl-row align-center">
            <span className="sl-lbl">Commissione (€/operazione)</span>
            <input aria-label="Commissione" type="number" min={0} max={20} step={0.01} value={commission} onChange={(e) => setCommission(+e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
}
