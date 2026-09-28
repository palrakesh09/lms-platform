// CourseStatusChart.jsx
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function CourseStatusChart({ courses }) {
  const data = [{ status: 'Published', count: courses.published }, { status: 'Draft', count: courses.draft }, { status: 'Archived', count: courses.archived }];
  return (
    <div className="h-56 w-full" role="img" aria-label="Course status distribution bar chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="status" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}