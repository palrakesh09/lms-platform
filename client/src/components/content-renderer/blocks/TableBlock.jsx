export default function TableBlock({ block }) {
  return (
    <div className="overflow-x-auto border border-[#2A2A2A] bg-[#111111]">
      <table className="min-w-full border-collapse text-sm">
        <caption className="sr-only">
          Data table
        </caption>

        <thead>
          <tr>
            {(block.headers ?? []).map((header, index) => (
              <th
                key={index}
                scope="col"
                className="border-b border-[#2A2A2A] bg-[#171717] px-3 py-3 text-left font-mono text-[11px] uppercase tracking-wider text-neutral-300 sm:px-4"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {(block.rows ?? []).map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="transition hover:bg-[#171717]"
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="border-b border-[#222222] px-3 py-3 text-neutral-400 sm:px-4"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

