import { useCallback, useState } from 'react';
import { useParams } from 'react-router';
import ApiErrorState from '../../components/common/ApiErrorState.jsx';
import { REQUEST_STATUS, useApiResource } from '../../hooks/useApiResource.js';
import AICodeActions from '../../components/ai/AICodeActions.jsx';
import CodeEditor from '../../components/playground/CodeEditor.jsx';
import ConsolePanel from '../../components/playground/ConsolePanel.jsx';
import RunSubmitBar from '../../components/playground/RunSubmitBar.jsx';
import SandboxPreview from '../../components/playground/SandboxPreview.jsx';
import TestResultsPanel from '../../components/playground/TestResultsPanel.jsx';
import { buildTestSandboxDocument } from '../../components/playground/sandboxHtml.js';
import { runInSandbox } from '../../components/playground/sandboxRunner.js';
import { getExerciseForPlay, submitAttempt } from '../../services/codingExerciseService.js';

export default function CodingExercisePage() {
  const { exerciseId } = useParams();
  const { status, data: exercise, error, reload } = useApiResource(useCallback((signal) => getExerciseForPlay(exerciseId, signal), [exerciseId]));
  const [code, setCode] = useState({ html: '', css: '', js: '' });
  const [logs, setLogs] = useState([]);
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  if (status === REQUEST_STATUS.LOADING) return <p>Loading…</p>;
  if (status === REQUEST_STATUS.ERROR) return <ApiErrorState error={error} subject="exercise" onRetry={reload} />;

  const state = code.html || code.css || code.js ? code : { html: exercise.starterHtml, css: exercise.starterCss, js: exercise.starterJavaScript };

  const submit = async () => {
    setRunning(true);
    try {
      const { results: r, outputSummary } = await runInSandbox(buildTestSandboxDocument({ ...state, testCases: exercise.testCases }), 'results');
      setResults(r);
      await submitAttempt(exercise.id, { submittedHtml: state.html, submittedCss: state.css, submittedJavaScript: state.js, results: r, outputSummary });
    } finally { setRunning(false); }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-2">
        <h1 className="text-xl font-bold">{exercise.title}</h1>
        <p className="text-sm text-slate-700 whitespace-pre-line">{exercise.instructions}</p>
        <CodeEditor language="html" value={state.html} onChange={(v) => setCode({ ...state, html: v })} ariaLabel="HTML editor" />
        <CodeEditor language="css" value={state.css} onChange={(v) => setCode({ ...state, css: v })} ariaLabel="CSS editor" />
        <CodeEditor language="javascript" value={state.js} onChange={(v) => setCode({ ...state, js: v })} ariaLabel="JavaScript editor" />
        <RunSubmitBar
          running={running}
          onReset={() => setCode({ html: exercise.starterHtml, css: exercise.starterCss, js: exercise.starterJavaScript })}
          onRun={() => runInSandbox(buildTestSandboxDocument({ ...state, testCases: [] }), 'results').catch(() => {})}
          onSubmit={submit}
        />
        {exercise.hints?.length > 0 && (
          <button type="button" onClick={() => setHintIndex((i) => Math.min(i + 1, exercise.hints.length))} className="text-sm text-indigo-700 underline">
            {hintIndex === 0 ? 'Show a hint' : hintIndex < exercise.hints.length ? 'Show next hint' : 'No more hints'}
          </button>
        )}
        {exercise.hints?.slice(0, hintIndex).map((h, i) => <p key={i} className="text-sm text-slate-600">{h}</p>)}
        <AICodeActions exerciseId={exercise.id} code={state.js} />
      </div>
      <div className="space-y-2">
        <SandboxPreview {...state} onConsole={(l) => setLogs((prev) => [...prev, `[${l.level}] ${l.text}`])} />
        <ConsolePanel lines={logs} onClear={() => setLogs([])} />
        <TestResultsPanel results={results} />
      </div>
    </div>
  );
}