import { useEffect, useRef, useState } from 'react';
import { buildSandboxDocument } from './sandboxHtml.js';

export default function SandboxPreview({
  html,
  css,
  js,
  onConsole,
}) {
  const iframeRef = useRef(null);
  const [doc, setDoc] = useState('');

  useEffect(() => {
    setDoc(
      buildSandboxDocument({
        html,
        css,
        js,
      })
    );
  }, [html, css, js]);

  useEffect(() => {
    const onMessage = (event) => {
      if (
        !iframeRef.current ||
        event.source !== iframeRef.current.contentWindow
      ) {
        return;
      }

      const data = event.data;

      if (!data || data.__sandbox !== true) {
        return;
      }

      if (data.type === 'console') {
        onConsole(data.payload);
      }
    };

    window.addEventListener(
      'message',
      onMessage
    );

    return () => {
      window.removeEventListener(
        'message',
        onMessage
      );
    };
  }, [onConsole]);

  return (
    <div className="overflow-hidden border border-[#2A2A2A] bg-[#111111]">
      <div className="flex items-center gap-2 border-b border-[#2A2A2A] bg-[#171717] px-3 py-2">
        <span className="h-2 w-2 bg-[#22C55E]" />

        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
          Live Preview
        </span>
      </div>

      <iframe
        ref={iframeRef}
        title="Preview"
        sandbox="allow-scripts"
        srcDoc={doc}
        className="h-64 w-full bg-white sm:h-80 lg:h-96"
      />
    </div>
  );
}

