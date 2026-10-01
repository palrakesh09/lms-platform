import { useEffect, useRef, useState } from 'react';

export default function QuizCountdown({
  deadline,
  onExpire,
}) {
  const [remainingMs, setRemainingMs] = useState(() =>
    Math.max(0, deadline.getTime() - Date.now())
  );

  const firedRef = useRef(false);

  useEffect(() => {
    const tick = () => {
      const ms = Math.max(
        0,
        deadline.getTime() - Date.now()
      );

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
  const critical = totalSeconds <= 15;

  return (
    <div
      className={[
        'inline-flex items-center gap-2',
        'border px-3 py-2',
        'font-mono text-xs font-bold',
        'transition-colors duration-200',
        critical
          ? 'border-[#7F1D1D] bg-[#1A0B0B] text-[#F87171]'
          : low
            ? 'border-[#92400E] bg-[#1A1207] text-[#FBBF24]'
            : 'border-[#2A2A2A] bg-[#111111] text-neutral-300',
      ].join(' ')}
    >
      <span
        className={[
          'size-2 shrink-0',
          critical
            ? 'animate-pulse bg-[#EF4444]'
            : low
              ? 'bg-[#F59E0B]'
              : 'bg-[#FF3E00]',
        ].join(' ')}
        aria-hidden="true"
      />

      <span
        role="timer"
        aria-live={low ? 'assertive' : 'off'}
      >
        {mm}:{ss}
      </span>

      <span className="hidden text-[10px] uppercase tracking-wider text-neutral-500 sm:inline">
        remaining
      </span>

      {low && (
        <span className="sr-only">
          Less than one minute remaining
        </span>
      )}
    </div>
  );
}