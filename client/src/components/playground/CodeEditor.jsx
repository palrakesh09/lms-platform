import Editor from '@monaco-editor/react';
import Skeleton from '../common/Skeleton.jsx';

export default function CodeEditor({
  language,
  value,
  onChange,
  height = '12rem',
  ariaLabel,
}) {
  return (
    <div
      className="overflow-hidden border border-[#2A2A2A] bg-[#0D0D0D]"
      role="group"
      aria-label={ariaLabel}
    >
      <div className="flex items-center justify-between border-b border-[#2A2A2A] bg-[#111111] px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
          {language || 'Code'}
        </span>

        <span className="h-2 w-2 bg-[#FF3E00]" />
      </div>

      <Editor
        height={height}
        language={language}
        value={value}
        onChange={(nextValue) => onChange(nextValue ?? '')}
        theme="vs-dark"
        loading={
          <Skeleton className="h-full w-full" />
        }
        options={{
          minimap: {
            enabled: false,
          },
          fontSize: 13,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          padding: {
            top: 12,
            bottom: 12,
          },
          fontFamily:
            'JetBrains Mono, Consolas, monospace',
          lineNumbersMinChars: 3,
        }}
      />
    </div>
  );
}

