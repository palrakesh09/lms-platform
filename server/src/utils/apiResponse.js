export const sendSuccess = (res, { statusCode = 200, message = 'OK', data, pagination, meta } = {}) => {
  const body = { success: true, message };

  if (data !== undefined) {
    body.data = data;
  }
  if (pagination !== undefined) {
    body.pagination = pagination;
  }
  if (meta !== undefined) body.meta = meta;

  return res.status(statusCode).json(body);
};