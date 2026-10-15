import { useId } from 'react';

export default function QuestionChart({ stimulus: s }) {
  const titleId = useId();
  const left = 82, right = 530, top = 45, bottom = 245;
  const width = right - left;
  const x = index => left + width * (index + 0.5) / s.points.length;
  const y = value => bottom - value / s.maximum * (bottom - top);
  const ticks = Array.from({ length: Math.floor(s.maximum / s.step) + 1 }, (_, i) => i * s.step);
  const valueText = value => s.precision === undefined ? String(value) : value.toFixed(s.precision);
  return <figure className="question-stimulus-chart">
    <figcaption id={titleId}>{s.title}</figcaption>
    <div className="question-chart-scroll" role="region" aria-label={s.title} tabIndex={0}>
      <svg viewBox="0 0 560 315" role="img" aria-labelledby={titleId}>
        <title>{s.title}</title>
        {ticks.map(value => <g key={value}>
          <line x1={left} x2={right} y1={y(value)} y2={y(value)} stroke="#d7e3e8" />
          <text x={left - 10} y={y(value) + 5} textAnchor="end">{value}</text>
        </g>)}
        <line x1={left} x2={left} y1={top} y2={bottom} stroke="#254b60" />
        <line x1={left} x2={right} y1={bottom} y2={bottom} stroke="#254b60" />
        <text x="18" y="145" textAnchor="middle" transform="rotate(-90 18 145)">{s.yLabel}</text>
        <text x={(left + right) / 2} y="300" textAnchor="middle">{s.xLabel}</text>
        {s.chartType === 'line' && <polyline fill="none" stroke="#007da6" strokeWidth="3" points={s.points.map((p, i) => `${x(i)},${y(p.value)}`).join(' ')} />}
        {s.points.map((p, i) => <g key={i}>
          {s.chartType === 'bar' ? <rect x={x(i) - width / s.points.length * 0.28} y={y(p.value)} width={width / s.points.length * 0.56} height={bottom - y(p.value)} fill={p.color || ['#1683b1', '#269877', '#dc9d13'][i % 3]} /> : <circle cx={x(i)} cy={y(p.value)} r="5" fill="#007da6" />}
          <text x={x(i)} y={y(p.value) - 9} textAnchor="middle" fontWeight="700">{valueText(p.value)}</text>
          <text x={x(i)} y={bottom + 24} textAnchor="middle">{p.label}</text>
        </g>)}
      </svg>
    </div>
    <details className="question-chart-data"><summary>ข้อมูลในกราฟ</summary>
      <table><caption>{s.title}</caption><thead><tr><th scope="col">{s.xLabel}</th><th scope="col">{s.yLabel}</th></tr></thead>
        <tbody>{s.points.map((p, i) => <tr key={i}><th scope="row">{p.label}</th><td>{valueText(p.value)}</td></tr>)}</tbody>
      </table>
    </details>
  </figure>;
}
