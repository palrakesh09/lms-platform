import { useCallback, useState } from 'react';
import { REQUEST_STATUS, useApiResource } from '../../hooks/useApiResource.js';
import { useForm } from '../../hooks/useForm.js';
import { useToast } from '../../hooks/useToast.js';
import { apiClient } from '../../services/apiClient.js';
import ApiErrorState from '../../components/common/ApiErrorState.jsx';
import { primaryButton } from '../../components/common/buttonClasses.js';
import { CheckboxField, TextField } from '../../components/common/FormControls.jsx';
import Skeleton, { LoadingRegion } from '../../components/common/Skeleton.jsx';
import { PageHeader, Panel, StatCard } from '../../components/dashboard/DashboardUi.jsx';

const getSettings = () => apiClient.get('/ai/admin/settings').then((r) => r.data.data);
const getUsage = () => apiClient.get('/ai/admin/usage?range=30d').then((r) => r.data.data);

export default function AdminAiSettingsPage() {
  const { notify } = useToast();
  const settings = useApiResource(useCallback(getSettings, []));
  const usage = useApiResource(useCallback(getUsage, []));
  const [reloadKey, setReloadKey] = useState(0);

  if (settings.status === REQUEST_STATUS.LOADING) return <LoadingRegion label="Loading AI settings…" className="space-y-2"><Skeleton className="h-24 w-full" /></LoadingRegion>;
  if (settings.status === REQUEST_STATUS.ERROR) return <ApiErrorState error={settings.error} subject="AI settings" onRetry={settings.reload} />;

  return <AiSettingsForm key={reloadKey} data={settings.data} usage={usage.status === REQUEST_STATUS.SUCCESS ? usage.data : null} onSaved={() => { notify('AI settings updated.'); setReloadKey((k) => k + 1); }} />;
}

function AiSettingsForm({ data, usage, onSaved }) {
  const form = useForm({
    initialValues: { enabled: data.enabled, maxOutputTokens: data.maxOutputTokens ?? '', dailyLimitPerUser: data.dailyLimitPerUser ?? '' },
    onSubmit: async (values) => {
      await apiClient.patch('/ai/admin/settings', {
        enabled: values.enabled,
        maxOutputTokens: values.maxOutputTokens === '' ? null : Number(values.maxOutputTokens),
        dailyLimitPerUser: values.dailyLimitPerUser === '' ? null : Number(values.dailyLimitPerUser),
      });
      onSaved();
    },
  });

  return (
    <>
      <PageHeader title="AI Assistant" description="Controls that apply immediately, no restart needed." />

      {!data.envAiEnabled && (
        <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
          AI is disabled at the infrastructure level (AI_ENABLED=false or a missing API key/model in the server environment). The toggle below only controls the application-level switch and has no effect until that's fixed and the server is restarted.
        </p>
      )}

      {usage && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard label="Requests (30d)" value={usage.totalRequests} />
          <StatCard label="Errors (30d)" value={usage.errorCount} />
          <StatCard label="Distinct users (30d)" value={usage.distinctUsers} />
        </div>
      )}

      <form onSubmit={form.handleSubmit} className="max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <CheckboxField label="Enable AI assistant" {...form.field('enabled')} value={form.values.enabled} onChange={(e) => form.setValue('enabled', e.target.checked)} />
        <TextField label="Max output tokens" type="number" hint="Blank uses the server default." {...form.field('maxOutputTokens')} />
        <TextField label="Daily requests per user" type="number" hint="Blank uses the server default." {...form.field('dailyLimitPerUser')} />
        <button type="submit" disabled={form.isSubmitting} className={primaryButton}>{form.isSubmitting ? 'Saving…' : 'Save'}</button>
      </form>
    </>
  );
}