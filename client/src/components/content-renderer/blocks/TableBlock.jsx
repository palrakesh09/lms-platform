export default function TableBlock({ block }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        <caption className="sr-only">Data table</caption>
        <thead>
          <tr>{(block.headers ?? []).map((h, i) => <th key={i} scope="col" className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-700">{h}</th>)}</tr>
        </thead>
        <tbody>
          {(block.rows ?? []).map((row, ri) => (
            <tr key={ri}>{row.map((cell, ci) => <td key={ci} className="border border-slate-200 px-3 py-2 text-slate-700">{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}