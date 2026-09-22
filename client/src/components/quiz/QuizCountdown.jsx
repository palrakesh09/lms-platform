import { useEffect, useRef, useState } from 'react';

// UX only — the server independently enforces the real deadline against startedAt at submit time.
export default function QuizCountdown({ deadline, onExpire }) {
  const [remainingMs, setRemainingMs] = useState(() => Math.max(0, deadline.getTime() - Date.now()));
  const firedRef = useRef(false);

  useEffect(() => {
    const tick = () => {
      const ms = Math.max(0, deadline.getTime() - Date.now());
      setRemainingMs(ms);
      if (ms === 0 && !firedRef.current) {
        firedRef.current = true;
        onExpire();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline, onExpire]);

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const ss = String(totalSeconds % 60).padStart(2, '0');
  const low = totalSeconds <= 60;

  return (
    <p role="timer" aria-live={low ? 'assertive' : 'off'} className={`text-sm font-semibold ${low ? 'text-red-600' : 'text-slate-700'}`}>
      Time remaining: {mm}:{ss}
      {low && <span className="sr-only"> — less than one minute remaining</span>}
    </p>
  );
}