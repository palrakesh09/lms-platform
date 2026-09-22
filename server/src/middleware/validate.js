import { ApiError } from '../utils/ApiError.js';
import { forbiddenError } from '../utils/authErrors.js';

const formatIssues = (issues) =>
  issues.map((issue) => ({
    field: issue.path.map(String).join('.') || 'body',
    message: issue.message,
  }));

// Returns the parsed (trimmed, normalized) data or throws a 422 with per-field details.
const parse = (schema, input) => {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new ApiError(422, 'Validation failed', formatIssues(result.error.issues));
  }
  return result.data;
};

// Validates req.body and replaces it with the parsed result.
export const validate = (schema) => (req, _res, next) => {
  req.body = parse(schema, req.body ?? {});
  next();
};

// Validates req.query. Express 5 makes req.query read-only, so the result goes to req.validatedQuery.
export const validateQuery = (schema) => (req, _res, next) => {
  req.validatedQuery = parse(schema, req.query);
  next();
};

// Picks the body schema by the caller's role (from the database via authenticate).
// A role with no schema gets a 403, so new roles are denied by default.
export const validateByRole = (schemasByRole) => (req, res, next) => {
  const schema = schemasByRole[req.user?.role];

  if (!schema) {
    throw forbiddenError();
  }
  return validate(schema)(req, res, next);
};