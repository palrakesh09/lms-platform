import EmptyState from '../common/EmptyState.jsx';
export default function AnalyticsEmptyState({ message }) {
  return <EmptyState title="No data yet" message={message} />;
}