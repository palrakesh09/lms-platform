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
import {
  getExerciseForPlay,
  submitAttempt,
} from '../../services/codingExerciseService.js';

export default function CodingExercisePage() {
  const { exerciseId } = useParams();

  const {
    status,
    data: exercise,
    error,
    reload,
  } = useApiResource(
    useCallback(
      (signal) =>
        getExerciseForPlay(exerciseId, signal),
      [exerciseId]
    )
  );

  const [code, setCode] = useState({
    html: '',
    css: '',
    js: '',
  });

  const [logs, setLogs] = useState([]);
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  if (status === REQUEST_STATUS.LOADING) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <div className="h-3 w-28 animate-pulse bg-[#242424]" />
        <div className="h-9 w-2/3 max-w-lg animate-pulse bg-[#1A1A1A]" />
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="h-[420px] animate-pulse border border-[#2A2A2A] bg-[#111111]" />
          <div className="h-[420px] animate-pulse border border-[#2A2A2A] bg-[#111111]" />
        </div>
      </div>
    );
  }

  if (status === REQUEST_STATUS.ERROR) {
    return (
      <ApiErrorState
        error={error}
        subject="exercise"
        onRetry={reload}
      />
    );
  }

  const state =
    code.html || code.css || code.js
      ? code
      : {
          html: exercise.starterHtml,
          css: exercise.starterCss,
          js: exercise.starterJavaScript,
        };

  const submit = async () => {
    setRunning(true);

    try {
      const {
        results: testResults,
        outputSummary,
      } = await runInSandbox(
        buildTestSandboxDocument({
          ...state,
          testCases: exercise.testCases,
        }),
        'results'
      );

      setResults(testResults);

      await submitAttempt(exercise.id, {
        submittedHtml: state.html,
        submittedCss: state.css,
        submittedJavaScript: state.js,
        results: testResults,
        outputSummary,
      });
    } finally {
      setRunning(false);
    }
  };

  const resetCode = () => {
    setCode({
      html: exercise.starterHtml,
      css: exercise.starterCss,
      js: exercise.starterJavaScript,
    });

    setLogs([]);
    setResults(null);
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5 sm:space-y-6">
      {/* Exercise header */}
      <header className="border-b border-[#2A2A2A] pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="border border-[#FF3E00]/40 bg-[#FF3E00]/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[#FF3E00]">
            Coding Lab
          </span>

          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-600">
            Exercise
          </span>
        </div>

        <h1 className="mt-3 break-words text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {exercise.title}
        </h1>

        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-neutral-400">
          {exercise.instructions}
        </p>
      </header>

      {/* Editor + preview */}
      <div className="grid min-w-0 gap-5 xl:grid-cols-2">
        <section className="min-w-0 space-y-4">
          <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
            <h2 className="text-sm font-semibold text-white">
              Code Editor
            </h2>

            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-600">
              HTML / CSS / JS
            </span>
          </div>

          <div className="min-w-0 space-y-3">
            <div className="min-w-0 overflow-hidden border border-[#2A2A2A] bg-[#111111]">
              <div className="border-b border-[#2A2A2A] bg-[#171717] px-3 py-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-orange-300">
                  index.html
                </span>
              </div>

              <CodeEditor
                language="html"
                value={state.html}
                onChange={(value) =>
                  setCode({
                    ...state,
                    html: value,
                  })
                }
                ariaLabel="HTML editor"
              />
            </div>

            <div className="min-w-0 overflow-hidden border border-[#2A2A2A] bg-[#111111]">
              <div className="border-b border-[#2A2A2A] bg-[#171717] px-3 py-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-sky-300">
                  styles.css
                </span>
              </div>

              <CodeEditor
                language="css"
                value={state.css}
                onChange={(value) =>
                  setCode({
                    ...state,
                    css: value,
                  })
                }
                ariaLabel="CSS editor"
              />
            </div>

            <div className="min-w-0 overflow-hidden border border-[#2A2A2A] bg-[#111111]">
              <div className="border-b border-[#2A2A2A] bg-[#171717] px-3 py-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-yellow-300">
                  script.js
                </span>
              </div>

              <CodeEditor
                language="javascript"
                value={state.js}
                onChange={(value) =>
                  setCode({
                    ...state,
                    js: value,
                  })
                }
                ariaLabel="JavaScript editor"
              />
            </div>
          </div>

          <div className="border border-[#2A2A2A] bg-[#111111] p-3 sm:p-4">
            <RunSubmitBar
              running={running}
              onReset={resetCode}
              onRun={() =>
                runInSandbox(
                  buildTestSandboxDocument({
                    ...state,
                    testCases: [],
                  }),
                  'results'
                ).catch(() => {})
              }
              onSubmit={submit}
            />
          </div>

          {/* Hints */}
          {exercise.hints?.length > 0 && (
            <section className="border border-[#2A2A2A] bg-[#111111] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#FF3E00]">
                    Need help?
                  </span>

                  <h2 className="mt-1 text-sm font-semibold text-white">
                    Exercise hints
                  </h2>
                </div>

                <button
                  type="button"
                  disabled={
                    hintIndex >=
                    exercise.hints.length
                  }
                  onClick={() =>
                    setHintIndex((index) =>
                      Math.min(
                        index + 1,
                        exercise.hints.length
                      )
                    )
                  }
                  className="min-h-9 border border-[#3A3A3A] px-3 text-xs font-semibold text-neutral-300 transition hover:border-[#FF3E00] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {hintIndex === 0
                    ? 'Show a hint'
                    : hintIndex <
                        exercise.hints.length
                      ? 'Show next hint'
                      : 'No more hints'}
                </button>
              </div>

              {hintIndex > 0 && (
                <ol className="mt-4 space-y-3">
                  {exercise.hints
                    .slice(0, hintIndex)
                    .map((hint, index) => (
                      <li
                        key={index}
                        className="flex gap-3 border-t border-[#242424] pt-3"
                      >
                        <span className="font-mono text-xs text-[#FF3E00]">
                          {String(index + 1).padStart(
                            2,
                            '0'
                          )}
                        </span>

                        <p className="whitespace-pre-line text-sm leading-6 text-neutral-400">
                          {hint}
                        </p>
                      </li>
                    ))}
                </ol>
              )}
            </section>
          )}

          <AICodeActions
            exerciseId={exercise.id}
            code={state.js}
          />
        </section>

        {/* Output panels */}
        <section className="min-w-0 space-y-4">
          <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
            <h2 className="text-sm font-semibold text-white">
              Output
            </h2>

            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-600">
              Sandbox
            </span>
          </div>

          <div className="min-w-0 overflow-hidden border border-[#2A2A2A] bg-[#111111]">
            <div className="flex items-center justify-between border-b border-[#2A2A2A] bg-[#171717] px-3 py-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                Live Preview
              </span>

              <span className="flex items-center gap-2 font-mono text-[10px] text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Ready
              </span>
            </div>

            <SandboxPreview
              {...state}
              onConsole={(line) =>
                setLogs((previous) => [
                  ...previous,
                  `[${line.level}] ${line.text}`,
                ])
              }
            />
          </div>

          <div className="min-w-0 overflow-hidden border border-[#2A2A2A] bg-[#111111]">
            <div className="border-b border-[#2A2A2A] bg-[#171717] px-3 py-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                Console
              </span>
            </div>

            <ConsolePanel
              lines={logs}
              onClear={() => setLogs([])}
            />
          </div>

          <div className="min-w-0 overflow-hidden border border-[#2A2A2A] bg-[#111111]">
            <div className="border-b border-[#2A2A2A] bg-[#171717] px-3 py-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                Test Results
              </span>
            </div>

            <TestResultsPanel
              results={results}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

