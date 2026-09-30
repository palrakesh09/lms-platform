// The document loaded into the sandboxed iframe's `srcdoc`. It is served from an opaque origin
// (sandbox="allow-scripts" WITHOUT "allow-same-origin"), so it has NO access to cookies, localStorage,
// or the parent window's DOM — this is the actual isolation boundary, not just an attribute on the tag.
export const buildSandboxDocument = ({ html, css, js }) => `<!doctype html>
<html><head><meta charset="utf-8">
<style>${css}</style>
</head><body>
${html}
<script>
  // Captures console output and forwards it to the parent via postMessage. The parent independently
  // validates event.source and message shape before trusting anything here — see SandboxPreview.jsx.
  (function () {
    const send = (type, payload) => { try { parent.postMessage({ __sandbox: true, type, payload }, '*'); } catch (e) {} };
    const wrap = (level) => (...args) => { send('console', { level, text: args.map(String).join(' ') }); };
    console.log = wrap('log'); console.error = wrap('error'); console.warn = wrap('warn');
    window.onerror = (msg) => send('console', { level: 'error', text: String(msg) });
    try {
      ${js}
    } catch (e) { send('console', { level: 'error', text: 'Error: ' + e.message }); }
    send('ready', {});
  })();
</script>
</body></html>`;

// The test-harness variant: same isolation, plus a runner that evaluates each test's code (a boolean
// expression or a function returning boolean) and posts structured, bounded results back.
export const buildTestSandboxDocument = ({ html, css, js, testCases }) => `<!doctype html>
<html><head><meta charset="utf-8"><style>${css}</style></head><body>
${html}
<script>
  (function () {
    const send = (type, payload) => { try { parent.postMessage({ __sandbox: true, type, payload }, '*'); } catch (e) {} };
    const logs = [];
    const wrap = (level) => (...args) => { logs.push(level + ': ' + args.map(String).join(' ')); };
    console.log = wrap('log'); console.error = wrap('error'); console.warn = wrap('warn');
    try { ${js} } catch (e) { logs.push('error: ' + e.message); }

    const results = [];
    const tests = ${JSON.stringify(testCases)};
    for (const t of tests) {
      let passed = false;
      try { passed = Boolean(new Function('return (' + t.code + ')')()); } catch (e) { passed = false; }
      results.push({ name: t.name, passed });
    }
    send('results', { results, outputSummary: logs.slice(0, 50).join('\\n').slice(0, 4000) });
  })();
</script>
</body></html>`;