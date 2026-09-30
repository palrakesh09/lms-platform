import { useEffect, useRef, useState } from 'react';
import { buildSandboxDocument } from './sandboxHtml.js';

// The LIVE preview (not the test harness). Same isolation guarantees as sandboxRunner: allow-scripts
// only, message source validated.
export default function SandboxPreview({ html, css, js, onConsole }) {
  const iframeRef = useRef(null);
  const [doc, setDoc] = useState('');

  useEffect(() => { setDoc(buildSandboxDocument({ html, css, js })); }, [html, css, js]);

  useEffect(() => {
    const onMessage = (event) => {
      if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) return;
      const data = event.data;
      if (!data || data.__sandbox !== true) return;
      if (data.type === 'console') onConsole(data.payload);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onConsole]);

  return <iframe ref={iframeRef} title="Preview" sandbox="allow-scripts" srcDoc={doc} className="h-64 w-full rounded-md border border-slate-300 bg-white" />;
}