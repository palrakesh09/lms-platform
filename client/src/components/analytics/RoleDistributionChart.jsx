// RoleDistributionChart.jsx
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = { students: '#4f46e5', mentors: '#0ea5e9', admins: '#64748b' };

export default function RoleDistributionChart({ users }) {
  const data = [{ name: 'Students', key: 'students', value: users.students }, { name: 'Mentors', key: 'mentors', value: users.mentors }, { name: 'Admins', key: 'admins', value: users.admins }].filter((d) => d.value > 0);
  if (data.length === 0) return null;

  return (
    <div className="flex items-center gap-6">
      <div className="h-40 w-40 shrink-0" role="img" aria-label="User role distribution pie chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={35} outerRadius={70}>
              {data.map((d) => <Cell key={d.key} fill={COLORS[d.key]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-1 text-sm">
        {data.map((d) => (
          <li key={d.key} className="flex items-center gap-2">
            <span className="size-3 rounded-full" style={{ backgroundColor: COLORS[d.key] }} aria-hidden="true" />
            {d.name}: <span className="font-medium">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}