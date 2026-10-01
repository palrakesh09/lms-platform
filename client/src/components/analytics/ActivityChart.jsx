import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import AnalyticsEmptyState from './AnalyticsEmptyState.jsx';
import { formatDate } from '../../utils/formatters.js';

// The text table always accompanies the chart so screen-reader users
// and anyone who cannot read the chart still gets the same numbers.
export default function ActivityChart({
  series,
  lines,
  title,
  emptyMessage,
}) {
  const hasData = series.some((point) =>
    lines.some((line) => point[line.key] > 0)
  );

  if (!hasData) {
    return (
      <AnalyticsEmptyState
        message={emptyMessage}
      />
    );
  }

  return (
    <div className="w-full">
      <h3 className="sr-only">
        {title}
      </h3>

      {/* CHART */}
      <div
        className="h-56 w-full sm:h-64 lg:h-72"
        role="img"
        aria-label={`${title} line chart over the selected date range`}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart
            data={series}
            margin={{
              top: 12,
              right: 12,
              left: -18,
              bottom: 4,
            }}
          >
            <CartesianGrid
              strokeDasharray="2 4"
              stroke="#2A2A2A"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tickFormatter={(date) => formatDate(date)}
              tick={{
                fontSize: 10,
                fill: '#737373',
              }}
              axisLine={{
                stroke: '#2A2A2A',
              }}
              tickLine={false}
              minTickGap={28}
            />

            <YAxis
              allowDecimals={false}
              tick={{
                fontSize: 10,
                fill: '#737373',
              }}
              axisLine={false}
              tickLine={false}
              width={32}
            />

            <Tooltip
              labelFormatter={(date) =>
                formatDate(date)
              }
              contentStyle={{
                backgroundColor: '#111111',
                border: '1px solid #2A2A2A',
                borderRadius: '2px',
                color: '#FFFFFF',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',
              }}
              labelStyle={{
                color: '#A3A3A3',
                fontSize: '11px',
                fontFamily: 'JetBrains Mono, monospace',
                marginBottom: '4px',
              }}
              itemStyle={{
                fontSize: '12px',
              }}
              cursor={{
                stroke: '#3A3A3A',
                strokeWidth: 1,
              }}
            />

            {lines.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.label}
                stroke={line.color}
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 4,
                  strokeWidth: 0,
                }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* LEGEND */}
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-neutral-800 pt-3">
        {lines.map((line) => (
          <div
            key={line.key}
            className="flex items-center gap-2"
          >
            <span
              className="h-1.5 w-5"
              style={{
                backgroundColor: line.color,
              }}
              aria-hidden="true"
            />

            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              {line.label}
            </span>
          </div>
        ))}
      </div>

      {/* ACCESSIBLE DATA TABLE */}
      <div className="mt-4 overflow-x-auto border-t border-neutral-800 pt-3">
        <table className="min-w-full text-left text-xs">
          <caption className="sr-only">
            {title} — daily values
          </caption>

          <thead>
            <tr className="text-neutral-600">
              <th
                scope="col"
                className="whitespace-nowrap py-2 pr-5 font-mono text-[10px] font-bold uppercase tracking-wider"
              >
                Date
              </th>

              {lines.map((line) => (
                <th
                  key={line.key}
                  scope="col"
                  className="whitespace-nowrap py-2 pr-5 font-mono text-[10px] font-bold uppercase tracking-wider"
                >
                  {line.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {series.slice(-7).map((point) => (
              <tr
                key={point.date}
                className="border-t border-neutral-800 text-neutral-400 transition-colors hover:bg-[#171717]"
              >
                <td className="whitespace-nowrap py-2 pr-5 font-mono text-[10px] text-neutral-500">
                  {formatDate(point.date)}
                </td>

                {lines.map((line) => (
                  <td
                    key={line.key}
                    className="whitespace-nowrap py-2 pr-5 text-xs font-medium text-neutral-300"
                  >
                    {point[line.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

