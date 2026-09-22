const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

// Strict 24-hex check. mongoose.isValidObjectId() also accepts any 12-character string.
export const isObjectIdString = (value) => typeof value === 'string' && OBJECT_ID_PATTERN.test(value);