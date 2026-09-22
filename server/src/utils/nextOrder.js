// Order for a new item: one past the highest sibling, so new items append to the end.
// Two simultaneous creates can get the same value. That is harmless because ties sort by _id.
export const nextOrder = async (Model, filter = {}) => {
  const last = await Model.findOne(filter, 'order', { sort: { order: -1 }, lean: true });
  return last ? last.order + 1 : 1;
};