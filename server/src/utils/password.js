import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';

// Cost 12 is roughly a few hundred milliseconds per hash on current hardware.
// Kept as a constant on purpose: a security floor should not be lowerable by an env typo.
const BCRYPT_COST = 12;

export const hashPassword = (plainPassword) => bcrypt.hash(plainPassword, BCRYPT_COST);

export const verifyPassword = (plainPassword, passwordHash) => bcrypt.compare(plainPassword, passwordHash);

// Hash computed once at startup. Used to spend the same time on "unknown email" logins as on real
// ones, so response timing does not reveal which emails are registered.
const dummyHash = hashPassword(randomUUID());

export const verifyAgainstDummyHash = async (plainPassword) => {
  await bcrypt.compare(plainPassword, await dummyHash);
};