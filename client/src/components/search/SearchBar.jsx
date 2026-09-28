import { useEffect, useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { searchGlobal } from '../../services/searchService.js';
import { MIN_QUERY, TYPE_LABELS, normalizeQuery, toSafeInternalPath } from '../../utils/searchUtils.js';
import Icon from '../common/Icon.jsx';

const PREVIEW_LIMIT = 8;

// Header search: a debounced preview dropdown (ARIA combobox) with Arrow/Enter/Escape support.
// Enter with nothing highlighted goes to the full /search page. Stale requests are aborted.
export default function SearchBar() {
  const navigate = useNavigate();
  const listId = useId();
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [response, setResponse] = useState({ key: '', status: 'idle', items: [] });

  const normalized = normalizeQuery(query);
  const debounced = useDebouncedValue(normalized, 300);

  useEffect(() => {
    if (debounced.length < MIN_QUERY) return undefined;
    const controller = new AbortController();
    searchGlobal({ q: debounced, limit: PREVIEW_LIMIT }, controller.signal)
      .then(({ items }) => setResponse({ key: debounced, status: 'success', items }))
      .catch(() => { if (!controller.signal.aborted) setResponse({ key: debounced, status: 'error', items: [] }); });
    return () => controller.abort();
  }, [debounced]);

  useEffect(() => {
    const close = (event) => { if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const status = normalized.length < MIN_QUERY ? 'idle' : normalized !== debounced || response.key !== debounced ? 'loading' : response.status;
  const items = status === 'success' ? response.items : [];

  const go = (path) => { setOpen(false); setMobileOpen(false); navigate(path); };
  const goAll = () => go(`/search?q=${encodeURIComponent(normalized)}`);

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (items.length === 0) return;
      event.preventDefault();
      setOpen(true);
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive((current) => (current + step + items.length) % items.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (active >= 0 && items[active]) go(toSafeInternalPath(items[active].url));
      else if (normalized.length >= MIN_QUERY) goAll();
    } else if (event.key === 'Escape') {
      if (open) setOpen(false);
      else { setQuery(''); setMobileOpen(false); }
    }
  };

  return (
    <>
      {!mobileOpen && (
        <button type="button" onClick={() => { setMobileOpen(true); setTimeout(() => inputRef.current?.focus(), 0); }} aria-label="Search" className="rounded-md p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600 md:hidden">
          <Icon name="search" className="size-5" />
        </button>
      )}

      <div ref={rootRef} className={mobileOpen ? 'fixed inset-x-0 top-0 z-40 bg-white p-3 shadow md:static md:p-0 md:shadow-none' : 'hidden w-full max-w-sm md:block'}>
        <div className="relative flex items-center gap-2">
          <label htmlFor={`${listId}-input`} className="sr-only">Search courses and learning content</label>
          <Icon name="search" className="pointer-events-none absolute left-2.5 size-4 text-slate-500" />
          <input
            ref={inputRef}
            id={`${listId}-input`}
            type="search"
            role="combobox"
            aria-expanded={open && normalized.length >= MIN_QUERY}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            autoComplete="off"
            maxLength={100}
            value={query}
            placeholder="Search courses and content"
            onChange={(e) => { setQuery(e.target.value); setActive(-1); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            className="block w-full rounded-md border border-slate-300 py-1.5 pl-8 pr-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600"
          />
          {mobileOpen && (
            <button type="button" onClick={() => { setMobileOpen(false); setOpen(false); }} aria-label="Close search" className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 md:hidden">
              <Icon name="x" className="size-5" />
            </button>
          )}
        </div>

        {open && normalized.length >= MIN_QUERY && (
          <div className="absolute z-50 mt-1 w-full min-w-[18rem] rounded-md border border-slate-200 bg-white shadow-lg max-md:left-0 max-md:right-0 max-md:mx-3">
            {status === 'loading' && <p className="px-3 py-2 text-sm text-slate-600">Searching…</p>}
            {status === 'error' && <p role="alert" className="px-3 py-2 text-sm text-red-600">Unable to search right now.</p>}
            {status === 'success' && items.length === 0 && <p className="px-3 py-2 text-sm text-slate-600">No results found for “{normalized}”.</p>}
            {items.length > 0 && (
              <ul id={listId} role="listbox" aria-label="Search results" className="max-h-80 overflow-y-auto py-1">
                {items.map((item, index) => (
                  <li
                    key={`${item.type}-${item.id}`}
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={index === active}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => go(toSafeInternalPath(item.url))}
                    onMouseEnter={() => setActive(index)}
                    className={`cursor-pointer px-3 py-2 text-sm ${index === active ? 'bg-indigo-50' : ''}`}
                  >
                    <span className="mr-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">{TYPE_LABELS[item.type]}</span>
                    <span className="wrap-break-word font-medium text-slate-900">{item.title}</span>
                    {item.courseTitle && item.type !== 'course' && <span className="block truncate text-xs text-slate-600">{item.courseTitle}</span>}
                  </li>
                ))}
              </ul>
            )}
            <Link to={`/search?q=${encodeURIComponent(normalized)}`} onClick={() => { setOpen(false); setMobileOpen(false); }} className="block border-t border-slate-100 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-slate-50">
              View all results
            </Link>
          </div>
        )}
        <p role="status" className="sr-only">{status === 'success' ? `${items.length} results shown` : ''}</p>
      </div>
    </>
  );
}