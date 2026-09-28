import { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../hooks/useAuth.js';
import { AUTH_STATUS } from '../../context/AuthContext.jsx';
import { enrollInCourse } from '../../services/enrollmentService.js';
import { getMutationError } from '../../utils/getMutationError.js';
import { ROUTES } from '../../utils/paths.js';
import { primaryButton, secondaryButton } from '../common/buttonClasses.js';

// `status` is one of null | 'active' | 'completed' | 'cancelled' (a fresh GET, not stale local state).
// On success, calls onEnrolled(enrollment) so the parent can flip its own status without a refetch.
export default function EnrollButton({ courseId, status, courseStatus, onEnrolled }) {
  const { status: authStatus } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  if (authStatus !== AUTH_STATUS.AUTHENTICATED) {
    return <Link to="/login" state={{ from: { pathname: ROUTES.course(courseId) } }} className={primaryButton}>Login to Enroll</Link>;
  }

  if (status === 'completed') {
    return <Link to={ROUTES.learn(courseId)} className={secondaryButton}>Completed — Review</Link>;
  }
  if (status === 'active') {
    return <Link to={ROUTES.learn(courseId)} className={primaryButton}>Continue Learning</Link>;
  }

  const handleEnroll = async () => {
    if (pending) return;
    setPending(true);
    setError('');
    try {
      const enrollment = await enrollInCourse(courseId);
      onEnrolled(enrollment);
    } catch (failure) {
      setError(getMutationError(failure).message);
    } finally {
      setPending(false);
    }
  };

  if (courseStatus !== 'published') {
    return <span className="text-sm text-slate-600">This course is not currently available.</span>;
  }

  return (
    <div>
      <button type="button" onClick={handleEnroll} disabled={pending} className={primaryButton}>
        {pending ? 'Enrolling…' : error ? 'Try Again' : 'Enroll Now'}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}