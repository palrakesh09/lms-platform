import { useEffect, useRef } from 'react';
import Icon from './Icon.jsx';

export default function SearchInput({
  id,
  label,
  defaultValue = '',
  placeholder,
  onSearch,
  delay = 350,
  maxLength = 100,
}) {
  const timer = useRef(null);

  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  const handleChange = (event) => {
    const value = event.target.value;

    clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      onSearch(value.trim());
    }, delay);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    clearTimeout(timer.current);

    const formData = new FormData(event.currentTarget);

    onSearch(
      String(formData.get('q') ?? '').trim(),
    );
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="group w-full"
    >
      {label && (
        <label
          htmlFor={id}
          className={[
            'mb-2 block',
            'font-mono text-[10px] font-semibold',
            'uppercase tracking-[0.15em]',
            'text-neutral-500',
          ].join(' ')}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <Icon
          name="search"
          className={[
            'pointer-events-none absolute left-3',
            'top-1/2 size-4 -translate-y-1/2',
            'text-neutral-600',
            'transition-colors duration-200',
            'group-focus-within:text-[#FF3E00]',
          ].join(' ')}
        />

        <input
          id={id}
          name="q"
          type="search"
          defaultValue={defaultValue}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={handleChange}
          className={[
            'min-h-11 w-full',
            'rounded-sm border border-[#2A2A2A]',
            'bg-[#111111]',
            'pl-10 pr-10',
            'text-sm text-white',
            'outline-none',
            'placeholder:text-neutral-700',
            'transition-all duration-200',
            'hover:border-[#3A3A3A]',
            'focus:border-[#FF3E00]',
            'focus:bg-[#151515]',
            'focus:ring-1 focus:ring-[#FF3E00]/20',
          ].join(' ')}
        />

        <kbd
          aria-hidden="true"
          className={[
            'pointer-events-none absolute right-3 top-1/2',
            'hidden -translate-y-1/2',
            'rounded-sm border border-[#2A2A2A]',
            'bg-[#171717] px-1.5 py-1',
            'font-mono text-[9px] text-neutral-600',
            'sm:block',
          ].join(' ')}
        >
          /
        </kbd>
      </div>
    </form>
  );
}

