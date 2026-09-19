import BackendStatus from '../components/BackendStatus.jsx';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">LMS Platform</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Project foundation is up. The card below confirms the React app can reach the Express API.
        </p>
      </div>

      <div className="max-w-md">
        <BackendStatus />
      </div>
    </div>
  );
}