// Explicit whitelist: a field added to the User model later is NOT exposed unless listed here.
export const toSafeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  createdAt: user.createdAt,
});