import { ApiError } from '../utils/ApiError.js';
import { notFoundError } from '../utils/contentErrors.js';

// Deletes one document, but only if nothing depends on it. There is intentionally NO cascade:
// removing a subtree by accident is worse than asking the caller to remove children first.
// `blockers` is a list of { Model, field, message }: if any Model has a document whose `field`
// equals this id, the delete is refused with a 409 carrying `message`.
//
// Known limit: a child created between the check and the delete can be orphaned. Closing that window
// needs MongoDB transactions (a replica set). Acceptable at this scale.
export const deleteGuarded = async (Model, id, blockers = []) => {
  for (const blocker of blockers) {
    if (await blocker.Model.exists({ [blocker.field]: id })) {
      throw new ApiError(409, blocker.message);
    }
  }

  const deleted = await Model.findByIdAndDelete(id, { lean: true });

  if (!deleted) {
    throw notFoundError();
  }
};