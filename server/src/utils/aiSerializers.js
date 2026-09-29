const idOf = (v) => (v === null || v === undefined ? null : String(v));

export const toMessage = (m) => ({
  role: m.role,
  content: m.content,
  sources: m.sources ?? [],
  createdAt: m.createdAt,
});

export const toConversationSummary = (c) => ({
  id: idOf(c._id),
  title: c.title,
  contextType: c.contextType,
  contextId: idOf(c.contextId),
  course: idOf(c.course),
  mode: c.mode,
  language: c.language,
  messageCount: c.messages?.length ?? 0,
  createdAt: c.createdAt,
  updatedAt: c.updatedAt,
});

export const toConversationDetail = (c) => ({ ...toConversationSummary(c), messages: (c.messages ?? []).map(toMessage) });