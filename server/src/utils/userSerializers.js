// Explicit whitelists. The password hash is never selected, and a field added to User later is not exposed unless listed.
export const toAdminUser = (doc) => ({
  id: String(doc._id),
  name: doc.name,
  email: doc.email,
  role: doc.role,
  avatar: doc.avatar,
  isActive: doc.isActive,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export const toMentorSummary = (doc) => ({
  id: String(doc._id),
  name: doc.name,
  email: doc.email,
  avatar: doc.avatar,
  role: doc.role,
  isActive: doc.isActive,
});