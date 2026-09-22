export const sendSuccess = (res, { statusCode = 200, message = 'OK', data, pagination } = {}) => {
  const body = { success: true, message };

  if (data !== undefined) {
    body.data = data;
  }
  if (pagination !== undefined) {
    body.pagination = pagination;
  }

  return res.status(statusCode).json(body);
};