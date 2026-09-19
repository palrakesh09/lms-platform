// Prevents browsers and proxies from caching responses that contain user data.
export const noStore = (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
};