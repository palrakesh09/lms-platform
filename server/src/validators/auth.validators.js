import { z } from 'zod';

const MAX_PASSWORD_BYTES = 72; // bcrypt silently ignores anything beyond 72 bytes

const emailSchema = z
  .string('Email is required')
  .trim()
  .toLowerCase()
  .max(254, 'Email cannot exceed 254 characters')
  .pipe(z.email('Enter a valid email address'));

// strictObject rejects unknown keys, so a payload containing "role" fails instead of being ignored.
export const registerSchema = z.strictObject({
  name: z
    .string('Name is required')
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name cannot exceed 80 characters'),
  email: emailSchema,
  // Passwords are deliberately not trimmed or transformed.
  password: z
    .string('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .refine(
      (value) => Buffer.byteLength(value, 'utf8') <= MAX_PASSWORD_BYTES,
      `Password cannot exceed ${MAX_PASSWORD_BYTES} bytes`,
    ),
});

// Login does not repeat the strength rules, so it doesn't reveal them or reject legacy passwords.
export const loginSchema = z.strictObject({
  email: emailSchema,
  password: z
    .string('Password is required')
    .min(1, 'Password is required')
    .max(256, 'Password is too long'),
});