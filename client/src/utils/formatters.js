// "web-development" -> "Web development"
export const formatLabel = (value) => {
  if (!value) return '';
  const text = String(value).replace(/[-_]+/g, ' ').trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// (1, "module") -> "1 module", (2, "topic") -> "2 topics"
export const pluralize = (count, singular, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;

// 0 -> "01"
export const padNumber = (number) => String(number).padStart(2, '0');

// ISO string -> "Jan 5, 2026" in the visitor's locale. Anything unparseable -> "".
export const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
};