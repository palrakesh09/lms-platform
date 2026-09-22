// Creates an administrator from environment variables. This is the ONLY way to create an admin:
// public registration always creates students, and there is no HTTP endpoint that sets a role.
// Requires access to the server and its database, which is what makes it a protected mechanism.
//
//   SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD must be set (server/.env or the shell).
//   Delete SEED_ADMIN_PASSWORD afterwards.
//
// It never modifies an existing account: if the email is taken, it stops.
import { connectDB, disconnectDB } from '../src/config/db.js';
import { ROLES } from '../src/constants/lms.js';
import User from '../src/models/User.js';
import { hashPassword } from '../src/utils/password.js';
import { registerSchema } from '../src/validators/auth.validators.js';

const main = async () => {
  // Same validation rules as public registration. Error messages never echo the password.
  const parsed = registerSchema.safeParse({
    name: process.env.SEED_ADMIN_NAME,
    email: process.env.SEED_ADMIN_EMAIL,
    password: process.env.SEED_ADMIN_PASSWORD,
  });

  if (!parsed.success) {
    console.error('[create-admin] Invalid or missing SEED_ADMIN_* values:');
    for (const issue of parsed.error.issues) {
      console.error(`  - ${issue.path.join('.') || 'input'}: ${issue.message}`);
    }
    return 1;
  }

  const { name, email, password } = parsed.data;

  await connectDB();

  if (await User.exists({ email })) {
    console.error('[create-admin] An account with that email already exists. Nothing was changed.');
    return 1;
  }

  const user = await User.create({
    name,
    email,
    password: await hashPassword(password),
    role: ROLES.ADMIN,
  });

  console.log(`[create-admin] Admin created: ${user.email} (id ${user._id})`);
  console.log('[create-admin] Remove SEED_ADMIN_PASSWORD from your environment now.');
  return 0;
};

main()
  .then(async (exitCode) => {
    await disconnectDB();
    process.exit(exitCode);
  })
  .catch(async (error) => {
    console.error('[create-admin] Unexpected error:', error.message);
    await disconnectDB().catch(() => {});
    process.exit(1);
  });