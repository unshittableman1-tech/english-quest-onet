import React from 'react';

export default function AssessmentTable({ stimulus: s, renderText = value => value }) {
  return <div className="question-stimulus-table" role="region" aria-label={s.title || 'ตารางประกอบโจทย์'} tabIndex={0}>
    <table><caption>{s.title || 'ตารางประกอบโจทย์'}</caption>
      <thead><tr>{s.columns.map((cell, i) => <th scope="col" key={i}>{renderText(cell)}</th>)}</tr></thead>
      <tbody>{s.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => j === 0 ? <th scope="row" key={j}>{renderText(cell)}</th> : <td key={j}>{renderText(cell)}</td>)}</tr>)}</tbody>
    </table>
  </div>;
}
