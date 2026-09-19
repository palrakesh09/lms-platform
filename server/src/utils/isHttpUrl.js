// Accepts only http(s) URLs. Rejects javascript:, data:, file: and anything unparseable,
// because these values are rendered as links in the browser.
export const isHttpUrl = (value) => {
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};