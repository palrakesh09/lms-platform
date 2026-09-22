import { Link } from 'react-router';
import { getErrorInfo } from '../../utils/getErrorInfo.js';
import { primaryButton, secondaryButton } from './buttonClasses.js';
import ErrorState from './ErrorState.jsx';

// Turns any request error into the right message and actions. Raw error objects are never shown.
export default function ApiErrorState({ error, subject, onRetry, backTo, backLabel = 'Go back' }) {
  const info = getErrorInfo(error, subject);

  return (
    <ErrorState title={info.title} message={info.message} onRetry={info.retryable ? onRetry : undefined}>
      {info.kind === 'unauthorized' && (
        <Link to="/login" className={primaryButton}>
          Log in
        </Link>
      )}
      {backTo && (
        <Link to={backTo} className={secondaryButton}>
          {backLabel}
        </Link>
      )}
    </ErrorState>
  );
}