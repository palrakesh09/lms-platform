import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AnalyticsEmptyState from './AnalyticsEmptyState.jsx';
import { formatDate } from '../../utils/formatters.js';

// Text table always accompanies the chart (below it), so screen-reader users and anyone who can't read
// the chart still get the same numbers.
export default function ActivityChart({ series, lines, title, emptyMessage }) {
  const hasData = series.some((point) => lines.some((line) => point[line.key] > 0));
  if (!hasData) return <AnalyticsEmptyState message={emptyMessage} />;

  return (
    <div>
      <h3 className="sr-only">{title}</h3>
      <div className="h-64 w-full" role="img" aria-label={`${title} line chart over the selected date range`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tickFormatter={(d) => formatDate(d)} tick={{ fontSize: 11 }} minTickGap={24} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip labelFormatter={(d) => formatDate(d)} />
            {lines.map((line) => (
              <Line key={line.key} type="monotone" dataKey={line.key} name={line.label} stroke={line.color} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <caption className="sr-only">{title} — daily values</caption>
          <thead className="text-slate-600"><tr><th className="pr-3 py-1">Date</th>{lines.map((l) => <th key={l.key} className="pr-3 py-1">{l.label}</th>)}</tr></thead>
          <tbody>{series.slice(-7).map((point) => (
            <tr key={point.date} className="border-t border-slate-100"><td className="pr-3 py-1">{formatDate(point.date)}</td>{lines.map((l) => <td key={l.key} className="pr-3 py-1">{point[l.key]}</td>)}</tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}