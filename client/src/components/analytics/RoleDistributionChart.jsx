import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const COLORS = {
  students: '#FF3E00',
  mentors: '#F59E0B',
  admins: '#737373',
};

export default function RoleDistributionChart({ users }) {
  const data = [
    {
      name: 'Students',
      key: 'students',
      value: users.students,
    },
    {
      name: 'Mentors',
      key: 'mentors',
      value: users.mentors,
    },
    {
      name: 'Admins',
      key: 'admins',
      value: users.admins,
    },
  ].filter((item) => item.value > 0);

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
      {/* DONUT */}
      <div
        className="mx-auto h-40 w-40 shrink-0 sm:mx-0"
        role="img"
        aria-label="User role distribution pie chart"
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={42}
              outerRadius={70}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((item) => (
                <Cell
                  key={item.key}
                  fill={COLORS[item.key]}
                />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                backgroundColor: '#111111',
                border: '1px solid #2A2A2A',
                borderRadius: '2px',
                color: '#FFFFFF',
              }}
              labelStyle={{
                color: '#A3A3A3',
                fontSize: '11px',
              }}
              itemStyle={{
                color: '#FFFFFF',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* LEGEND */}
      <ul className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {data.map((item) => (
          <li
            key={item.key}
            className="border border-neutral-800 bg-[#171717] p-3"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 shrink-0"
                style={{
                  backgroundColor: COLORS[item.key],
                }}
                aria-hidden="true"
              />

              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                {item.name}
              </span>
            </div>

            <p className="mt-2 font-mono text-xl font-bold text-white">
              {item.value}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}