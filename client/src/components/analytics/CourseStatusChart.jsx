import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function CourseStatusChart({ courses }) {
  const data = [
    {
      status: 'Published',
      count: courses.published,
    },
    {
      status: 'Draft',
      count: courses.draft,
    },
    {
      status: 'Archived',
      count: courses.archived,
    },
  ];

  return (
    <div
      className="h-56 w-full sm:h-64"
      role="img"
      aria-label="Course status distribution bar chart"
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <BarChart
          data={data}
          margin={{
            top: 12,
            right: 8,
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
            dataKey="status"
            tick={{
              fontSize: 10,
              fill: '#737373',
            }}
            axisLine={{
              stroke: '#2A2A2A',
            }}
            tickLine={false}
          />

          <YAxis
            allowDecimals={false}
            tick={{
              fontSize: 10,
              fill: '#737373',
            }}
            axisLine={false}
            tickLine={false}
            width={30}
          />

          <Tooltip
            cursor={{
              fill: '#171717',
            }}
            contentStyle={{
              backgroundColor: '#111111',
              border: '1px solid #2A2A2A',
              borderRadius: '2px',
              color: '#FFFFFF',
            }}
            labelStyle={{
              color: '#A3A3A3',
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
            }}
            itemStyle={{
              color: '#FFFFFF',
              fontSize: '12px',
            }}
          />

          <Bar
            dataKey="count"
            fill="#FF3E00"
            radius={[2, 2, 0, 0]}
            maxBarSize={52}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}