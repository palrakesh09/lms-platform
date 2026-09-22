import { useAuth } from '../hooks/useAuth.js';

// TEMPORARY. Stands in for the Admin, Mentor and Student dashboards so the role guards can be
// verified in the browser. Replace each usage with the real dashboard routes in later phases.
export default function RoleAreaPage({ title }) {
  const { user } = useAuth();

  return (
    <div className="max-w-xl space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-slate-600">
        Signed in as {user.name} ({user.role}). This placeholder only proves the route guard works.
        The real dashboard arrives in a later phase.
      </p>
    </div>
  );
}