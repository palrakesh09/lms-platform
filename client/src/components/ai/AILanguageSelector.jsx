const OPTIONS = [{ value: 'en', label: 'English' }, { value: 'hi', label: 'Hindi' }, { value: 'hinglish', label: 'Hinglish' }];

export default function AILanguageSelector({ value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} aria-label="Response language" className="rounded-md border border-slate-300 px-2 py-1 text-xs">
      {OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}