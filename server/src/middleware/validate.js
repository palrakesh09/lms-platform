import { ApiError } from '../utils/ApiError.js';

const formatIssues = (issues) =>
  issues.map((issue) => ({
    field: issue.path.map(String).join('.') || 'body',
    message: issue.message,
  }));

// Validates req.body and replaces it with the parsed (trimmed, normalized) result.
export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body ?? {});

  if (!result.success) {
    return next(new ApiError(422, 'Validation failed', formatIssues(result.error.issues)));
  }

  req.body = result.data;
  return next();
};