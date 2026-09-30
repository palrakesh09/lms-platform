// KNOWN LIMITATION, stated plainly (see docs/coding-playground.md): this app has no server-side code
// execution engine. Test evaluation happens INSIDE the student's own sandboxed iframe. A student who
// opens devtools on their own sandbox CAN read the hidden test source they were just sent — hidden tests
// are kept out of the exercise page's initial load and out of the /coding-exercises/:id detail response,
// but they cannot be kept secret from someone actively inspecting their own running sandbox. This is not
// a suitable mechanism for high-stakes, integrity-critical assessment. A real fix requires a dedicated
// server-side sandboxed execution service (flagged as future work, not built here per the phase's own
// instruction not to build an insecure execution service just to claim support).

const TIMEOUT_MS = 5000;

// Creates a fresh, isolated iframe, waits for exactly one validated result message from THAT iframe
// (matched by event.source), and always cleans it up — including on timeout.
export const runInSandbox = (doc, expectType) =>
  new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.sandbox = 'allow-scripts'; // deliberately NOT allow-same-origin: forces an opaque, isolated origin
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const cleanup = () => { window.removeEventListener('message', onMessage); clearTimeout(timer); iframe.remove(); };
    const timer = setTimeout(() => { cleanup(); reject(new Error('Execution timed out')); }, TIMEOUT_MS);

    const onMessage = (event) => {
      if (event.source !== iframe.contentWindow) return; // reject anything not from THIS sandbox
      const data = event.data;
      if (!data || data.__sandbox !== true || typeof data.type !== 'string') return; // shape check
      if (data.type !== expectType) return;
      cleanup();
      resolve(data.payload);
    };
    window.addEventListener('message', onMessage);
    iframe.srcdoc = doc;
  });