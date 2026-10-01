import EmptyState from '../common/EmptyState.jsx';

export default function AnalyticsEmptyState({ message }) {
  return (
    <div className="py-1">
      <EmptyState
        title="No data yet"
        message={message}
        icon="chart"
      />
    </div>
  );
}

