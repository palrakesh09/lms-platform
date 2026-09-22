import { useAuth } from '../../../hooks/useAuth.js';
import { formatDate, formatLabel } from '../../../utils/formatters.js';
import { dangerLinkButton, linkButton } from '../../common/buttonClasses.js';
import StatusBadge from '../../common/StatusBadge.jsx';

const th = 'px-4 py-3';

// `onAction({ type, user })`. Admin rows (including your own) have no actions: the API refuses to change them.
export default function UserTable({ users, onAction }) {
  const { user: me } = useAuth();

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <caption className="sr-only">Users</caption>
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
          <tr>
            <th scope="col" className={th}>Name</th>
            <th scope="col" className={`${th} hidden sm:table-cell`}>Email</th>
            <th scope="col" className={th}>Role</th>
            <th scope="col" className={th}>Status</th>
            <th scope="col" className={`${th} hidden lg:table-cell`}>Joined</th>
            <th scope="col" className={th}>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((user) => {
            const isSelf = user.id === me.id;
            const isAdmin = user.role === 'admin';

            return (
              <tr key={user.id} className="align-top">
                <td className={th}>
                  <p className="wrap-break-word font-medium text-slate-900">
                    {user.name}
                    {isSelf && <span className="ml-2 text-xs font-normal text-slate-600">(you)</span>}
                  </p>
                  <p className="break-all text-xs text-slate-600 sm:hidden">{user.email}</p>
                </td>
                <td className={`${th} hidden break-all text-slate-700 sm:table-cell`}>{user.email}</td>
                <td className={`${th} text-slate-700`}>{formatLabel(user.role)}</td>
                <td className={th}>
                  <StatusBadge status={user.isActive ? 'active' : 'inactive'} />
                </td>
                <td className={`${th} hidden whitespace-nowrap text-slate-700 lg:table-cell`}>{formatDate(user.createdAt)}</td>
                <td className={`${th} min-w-[10rem]`}>
                  {isAdmin ? (
                    <span className="text-xs text-slate-600">Managed outside the dashboard</span>
                  ) : (
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {user.role === 'student' && (
                        <button type="button" onClick={() => onAction({ type: 'make-mentor', user })} className={linkButton}>
                          Make mentor<span className="sr-only"> {user.name}</span>
                        </button>
                      )}
                      {user.role === 'mentor' && (
                        <button type="button" onClick={() => onAction({ type: 'make-student', user })} className={linkButton}>
                          Make student<span className="sr-only"> {user.name}</span>
                        </button>
                      )}
                      {user.isActive ? (
                        <button type="button" onClick={() => onAction({ type: 'deactivate', user })} className={dangerLinkButton}>
                          Deactivate<span className="sr-only"> {user.name}</span>
                        </button>
                      ) : (
                        <button type="button" onClick={() => onAction({ type: 'activate', user })} className={linkButton}>
                          Activate<span className="sr-only"> {user.name}</span>
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}