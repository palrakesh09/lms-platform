import { useEffect, useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { searchGlobal } from '../../services/searchService.js';
import {
  MIN_QUERY,
  TYPE_LABELS,
  normalizeQuery,
  toSafeInternalPath,
} from '../../utils/searchUtils.js';
import Icon from '../common/Icon.jsx';

const PREVIEW_LIMIT = 8;

export default function SearchBar() {
  const navigate = useNavigate();
  const listId = useId();
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [response, setResponse] = useState({
    key: '',
    status: 'idle',
    items: [],
  });

  const normalized = normalizeQuery(query);
  const debounced = useDebouncedValue(normalized, 300);

  useEffect(() => {
    if (debounced.length < MIN_QUERY) {
      return undefined;
    }

    const controller = new AbortController();

    searchGlobal(
      {
        q: debounced,
        limit: PREVIEW_LIMIT,
      },
      controller.signal,
    )
      .then(({ items }) => {
        setResponse({
          key: debounced,
          status: 'success',
          items,
        });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResponse({
            key: debounced,
            status: 'error',
            items: [],
          });
        }
      });

    return () => controller.abort();
  }, [debounced]);

  useEffect(() => {
    const close = (event) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', close);

    return () => {
      document.removeEventListener('mousedown', close);
    };
  }, []);

  const status =
    normalized.length < MIN_QUERY
      ? 'idle'
      : normalized !== debounced ||
          response.key !== debounced
        ? 'loading'
        : response.status;

  const items =
    status === 'success'
      ? response.items
      : [];

  const go = (path) => {
    setOpen(false);
    setMobileOpen(false);
    navigate(path);
  };

  const goAll = () => {
    go(
      `/search?q=${encodeURIComponent(normalized)}`
    );
  };

  const onKeyDown = (event) => {
    if (
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp'
    ) {
      if (items.length === 0) return;

      event.preventDefault();
      setOpen(true);

      const step =
        event.key === 'ArrowDown'
          ? 1
          : -1;

      setActive(
        (current) =>
          (current + step + items.length) %
          items.length,
      );
    } else if (event.key === 'Enter') {
      event.preventDefault();

      if (active >= 0 && items[active]) {
        go(
          toSafeInternalPath(
            items[active].url,
          ),
        );
      } else if (
        normalized.length >= MIN_QUERY
      ) {
        goAll();
      }
    } else if (event.key === 'Escape') {
      if (open) {
        setOpen(false);
      } else {
        setQuery('');
        setMobileOpen(false);
      }
    }
  };

  return (
    <>
      {!mobileOpen && (
        <button
          type="button"
          onClick={() => {
            setMobileOpen(true);
            setTimeout(
              () =>
                inputRef.current?.focus(),
              0,
            );
          }}
          aria-label="Search"
          className="rounded-sm border border-transparent p-2 text-neutral-400 transition-colors hover:border-neutral-800 hover:bg-[#171717] hover:text-white focus-visible:outline-2 focus-visible:outline-[#FF3E00] md:hidden"
        >
          <Icon
            name="search"
            className="size-5"
          />
        </button>
      )}

      <div
        ref={rootRef}
        className={
          mobileOpen
            ? 'fixed inset-x-0 top-0 z-50 border-b border-neutral-800 bg-[#0A0A0A] p-3 shadow-2xl md:static md:border-0 md:bg-transparent md:p-0 md:shadow-none'
            : 'hidden w-full max-w-sm md:block'
        }
      >
        <div className="relative flex items-center gap-2">
          <label
            htmlFor={`${listId}-input`}
            className="sr-only"
          >
            Search courses and learning content
          </label>

          <Icon
            name="search"
            className="pointer-events-none absolute left-3 size-4 text-neutral-500"
          />

          <input
            ref={inputRef}
            id={`${listId}-input`}
            type="search"
            role="combobox"
            aria-expanded={
              open &&
              normalized.length >= MIN_QUERY
            }
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              active >= 0
                ? `${listId}-${active}`
                : undefined
            }
            autoComplete="off"
            maxLength={100}
            value={query}
            placeholder="Search courses and content"
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(-1);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            className="block min-h-10 w-full rounded-sm border border-neutral-800 bg-[#111111] py-2 pl-9 pr-3 text-sm text-white placeholder:text-neutral-600 transition-colors focus:border-[#FF3E00] focus:outline-none focus:ring-1 focus:ring-[#FF3E00]"
          />

          {mobileOpen && (
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setOpen(false);
              }}
              aria-label="Close search"
              className="rounded-sm border border-neutral-800 p-2 text-neutral-400 hover:bg-[#171717] hover:text-white focus-visible:outline-2 focus-visible:outline-[#FF3E00] md:hidden"
            >
              <Icon
                name="x"
                className="size-5"
              />
            </button>
          )}
        </div>

        {open &&
          normalized.length >= MIN_QUERY && (
            <div className="absolute left-3 right-3 z-50 mt-2 overflow-hidden border border-neutral-800 bg-[#111111] shadow-2xl md:left-auto md:right-auto md:w-full">
              {status === 'loading' && (
                <p className="px-4 py-3 font-mono text-xs text-neutral-500">
                  SEARCHING...
                </p>
              )}

              {status === 'error' && (
                <p
                  role="alert"
                  className="border-l-2 border-[#EF4444] px-4 py-3 text-sm text-[#F87171]"
                >
                  Unable to search right now.
                </p>
              )}

              {status === 'success' &&
                items.length === 0 && (
                  <p className="px-4 py-4 text-sm text-neutral-500">
                    No results found for "
                    {normalized}".
                  </p>
                )}

              {items.length > 0 && (
                <ul
                  id={listId}
                  role="listbox"
                  aria-label="Search results"
                  className="max-h-80 overflow-y-auto py-1"
                >
                  {items.map(
                    (item, index) => (
                      <li
                        key={`${item.type}-${item.id}`}
                        id={`${listId}-${index}`}
                        role="option"
                        aria-selected={
                          index === active
                        }
                        onMouseDown={(event) =>
                          event.preventDefault()
                        }
                        onClick={() =>
                          go(
                            toSafeInternalPath(
                              item.url,
                            ),
                          )
                        }
                        onMouseEnter={() =>
                          setActive(index)
                        }
                        className={[
                          'cursor-pointer border-l-2 px-4 py-3 transition-colors',
                          index === active
                            ? 'border-[#FF3E00] bg-[#171717]'
                            : 'border-transparent hover:bg-[#171717]',
                        ].join(' ')}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="border border-neutral-700 bg-[#0A0A0A] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-neutral-500">
                            {TYPE_LABELS[item.type]}
                          </span>

                          <span className="break-words text-sm font-medium text-white">
                            {item.title}
                          </span>
                        </div>

                        {item.courseTitle &&
                          item.type !==
                            'course' && (
                            <span className="mt-1 block truncate text-xs text-neutral-600">
                              {item.courseTitle}
                            </span>
                          )}
                      </li>
                    ),
                  )}
                </ul>
              )}

              <Link
                to={`/search?q=${encodeURIComponent(normalized)}`}
                onClick={() => {
                  setOpen(false);
                  setMobileOpen(false);
                }}
                className="block border-t border-neutral-800 px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-wider text-[#FF3E00] transition-colors hover:bg-[#171717] hover:text-[#FF531F] focus-visible:outline-2 focus-visible:outline-[#FF3E00]"
              >
                View all results →
              </Link>
            </div>
          )}
      </div>

      <p
        role="status"
        className="sr-only"
      >
        {status === 'success'
          ? `${items.length} results shown`
          : ''}
      </p>
    </>
  );
}