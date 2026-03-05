export function ChartTooltip({ active, payload, label, extra }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-title">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i}>
          {p.name}: <strong style={{ color: p.color || "#fff" }}>{p.value}</strong>
        </div>
      ))}
      {extra}
    </div>
  );
}
