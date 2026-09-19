import { ROLES } from '../constants/lms.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { hashPassword, verifyAgainstDummyHash, verifyPassword } from '../utils/password.js';
import { signAccessToken } from '../utils/token.js';

const emailTakenError = () =>
  new ApiError(409, 'An account with this email already exists', [
    { field: 'email', message: 'This email is already registered' },
  ]);

// One message for every login failure, so callers can't tell which part was wrong.
const invalidCredentialsError = () => new ApiError(401, 'Invalid email or password');

export const registerUser = async ({ name, email, password }) => {
  // Cheap early exit that also avoids a needless bcrypt hash for known duplicates.
  if (await User.exists({ email })) {
    throw emailTakenError();
  }

  const passwordHash = await hashPassword(password);

  try {
    // Role is set here by the server. Public registration can only ever create students.
    return await User.create({ name, email, password: passwordHash, role: ROLES.STUDENT });
  } catch (error) {
    // Two simultaneous registrations can both pass the check above. The unique index decides.
    if (error?.code === 11000) {
      throw emailTakenError();
    }
    throw error;
  }
};

export const loginUser = async ({ email, password }) => {
  // Inactive accounts are excluded here and get the same failure as unknown emails.
  const user = await User.findOne({ email, isActive: true }).select('+password');

  if (!user) {
    await verifyAgainstDummyHash(password); // equalize timing with the real-user path
    throw invalidCredentialsError();
  }

  if (!(await verifyPassword(password, user.password))) {
    throw invalidCredentialsError();
  }

  return { user, token: signAccessToken(user._id) };
};