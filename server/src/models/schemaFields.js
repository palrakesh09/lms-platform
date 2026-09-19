import mongoose from 'mongoose';
import { CONTENT_STATUS, SLUG_PATTERN } from '../constants/lms.js';
import { isHttpUrl } from '../utils/isHttpUrl.js';

const { Schema } = mongoose;

const MAX_URL_LENGTH = 2048;

export const titleField = () => ({
  type: String,
  required: [true, 'Title is required'],
  trim: true,
  minlength: [2, 'Title must be at least 2 characters'],
  maxlength: [150, 'Title cannot exceed 150 characters'],
});

export const slugField = () => ({
  type: String,
  required: [true, 'Slug is required'],
  trim: true,
  lowercase: true,
  maxlength: [160, 'Slug cannot exceed 160 characters'],
  match: [SLUG_PATTERN, 'Slug may contain only lowercase letters, numbers and single hyphens'],
});

export const textField = (label, maxlength) => ({
  type: String,
  trim: true,
  default: '',
  maxlength: [maxlength, `${label} cannot exceed ${maxlength} characters`],
});

// Optional http(s) URL. An empty value is allowed; anything else must be a valid URL.
export const optionalUrlField = (label) => ({
  type: String,
  trim: true,
  default: '',
  maxlength: [MAX_URL_LENGTH, `${label} URL cannot exceed ${MAX_URL_LENGTH} characters`],
  validate: {
    validator: (value) => !value || isHttpUrl(value),
    message: `${label} must be a valid http(s) URL`,
  },
});

export const orderField = () => ({
  type: Number,
  default: 0,
  min: [0, 'Order cannot be negative'],
  validate: {
    validator: Number.isInteger,
    message: 'Order must be an integer',
  },
});

// Defaults to draft so new content is never visible to students by accident.
export const statusField = () => ({
  type: String,
  enum: {
    values: Object.values(CONTENT_STATUS),
    message: '{VALUE} is not a valid status',
  },
  default: CONTENT_STATUS.DRAFT,
});

// Required reference that cannot be changed after creation.
export const requiredRef = (ref) => ({
  type: Schema.Types.ObjectId,
  ref,
  required: [true, `${ref} reference is required`],
  immutable: true,
});

// Values are always set by the server from the authenticated user, never from the request body.
export const auditFields = () => ({
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'createdBy is required'],
    immutable: true,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
});