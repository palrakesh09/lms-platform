export const formatFileSize = (bytes) => {
  if (!bytes) return '0 KB';
  const units = ['B', 'KB', 'MB'];
  let value = bytes, i = 0;
  while (value >= 1024 && i < units.length - 1) { value /= 1024; i += 1; }
  return `${i === 0 ? value : value.toFixed(1)} ${units[i]}`;
};

export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
export const DOCUMENT_ACCEPT = 'application/pdf';

// The server may return an absolute S3 URL (use as-is) or an app-relative path like
// "/api/media/:id/download?..." (prefix with the API's own origin, derived from apiClient's baseURL).
export const resolveDeliveryUrl = (url, apiBaseUrl) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  try {
    return `${new URL(apiBaseUrl).origin}${url}`;
  } catch {
    return url;
  }
};