import { useEffect, useRef } from 'react';
import Icon from './Icon.jsx';

// Debounced search box. It is uncontrolled: `defaultValue` seeds it, and the parent changes the `key` to reset it.
// Typing calls onSearch after `delay` ms. Enter (or the browser's submit) calls it immediately.
export default function SearchInput({ id, label, defaultValue = '', placeholder, onSearch, delay = 350, maxLength = 100 }) {
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleChange = (event) => {
    const { value } = event.target;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onSearch(value.trim()), delay);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    clearTimeout(timer.current);
    onSearch(String(new FormData(event.currentTarget).get('q') ?? '').trim());
  };

  return (
    <form role="search" onSubmit={handleSubmit}>
      <label htmlFor={id} className="block text-xs font-medium text-slate-600">
        {label}
      </label>
      <div className="relative mt-1">
        <Icon name="search" className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
        <input
          id={id}
          name="q"
          type="search"
          defaultValue={defaultValue}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={handleChange}
          className="block w-full rounded-md border border-slate-300 py-2 pl-8 pr-3 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600"
        />
      </div>
    </form>
  );
}