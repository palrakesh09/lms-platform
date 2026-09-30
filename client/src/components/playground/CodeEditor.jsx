import Editor from '@monaco-editor/react';
import Skeleton from '../common/Skeleton.jsx';

export default function CodeEditor({ language, value, onChange, height = '12rem', ariaLabel }) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-300" role="group" aria-label={ariaLabel}>
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={(v) => onChange(v ?? '')}
        theme="light"
        loading={<Skeleton className="h-full w-full" />}
        options={{ minimap: { enabled: false }, fontSize: 13, automaticLayout: true, tabSize: 2, wordWrap: 'on', scrollBeyondLastLine: false }}
      />
    </div>
  );
}