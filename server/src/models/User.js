import mongoose from 'mongoose';
import { ROLES } from '../constants/lms.js';
import { optionalUrlField } from './schemaFields.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true, // normalization makes uniqueness case-insensitive
      maxlength: [254, 'Email cannot exceed 254 characters'],
      match: [EMAIL_PATTERN, 'Email must be a valid email address'],
    },
    // Holds the password HASH. Hashing happens in the auth service (Phase 3), never in a controller.
    // Plaintext strength rules belong in request validation, not in this schema.
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // omitted from query results unless explicitly requested with .select('+password')
    },
    role: {
      type: String,
      enum: {
        values: Object.values(ROLES),
        message: '{VALUE} is not a valid role',
      },
      default: ROLES.STUDENT,
    },
    avatar: optionalUrlField('Avatar'),
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      // select:false does not apply to freshly created documents, so strip the password here too.
      transform: (_doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
  },
);

// Admin lists such as "all mentors, newest first".
userSchema.index({ role: 1, createdAt: -1 });

export default mongoose.model('User', userSchema);