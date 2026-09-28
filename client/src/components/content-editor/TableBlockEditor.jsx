import { secondaryButton, smallButton, smallDangerButton } from '../common/buttonClasses.js';

export default function TableBlockEditor({ block, onChange }) {
  const headers = block.headers ?? ['', ''];
  const rows = block.rows ?? [['', '']];

  const setHeader = (i, v) => onChange({ ...block, headers: headers.map((h, idx) => (idx === i ? v : h)) });
  const setCell = (r, c, v) => onChange({ ...block, rows: rows.map((row, ri) => (ri === r ? row.map((cell, ci) => (ci === c ? v : cell)) : row)) });
  const addColumn = () => headers.length < 10 && onChange({ ...block, headers: [...headers, ''], rows: rows.map((r) => [...r, '']) });
  const removeColumn = (i) => onChange({ ...block, headers: headers.filter((_, idx) => idx !== i), rows: rows.map((r) => r.filter((_, idx) => idx !== i)) });
  const addRow = () => rows.length < 50 && onChange({ ...block, rows: [...rows, headers.map(() => '')] });
  const removeRow = (i) => onChange({ ...block, rows: rows.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="border border-slate-200 p-1">
                  <div className="flex items-center gap-1">
                    <input type="text" value={h} onChange={(e) => setHeader(i, e.target.value)} aria-label={`Column ${i + 1} header`} className="w-full min-w-\[6rem\] rounded border border-slate-300 px-1.5 py-1 text-xs" />
                    {headers.length > 1 && <button type="button" onClick={() => removeColumn(i)} aria-label={`Remove column ${i + 1}`} className={smallDangerButton}>×</button>}
                  </div>
                </th>
              ))}
              <th className="p-1"><button type="button" onClick={addColumn} className={smallButton}>+ col</button></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="border border-slate-200 p-1">
                    <input type="text" value={cell} onChange={(e) => setCell(ri, ci, e.target.value)} aria-label={`Row ${ri + 1}, column ${ci + 1}`} className="w-full min-w-\[6rem\] rounded border border-slate-300 px-1.5 py-1 text-xs" />
                  </td>
                ))}
                <td className="p-1"><button type="button" onClick={() => removeRow(ri)} aria-label={`Remove row ${ri + 1}`} className={smallDangerButton}>×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={addRow} className={secondaryButton}>Add row</button>
    </div>
  );
}