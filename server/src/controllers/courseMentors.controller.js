import { getCourseMentors, setCourseMentors } from '../services/courseMentors.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { toMentorSummary } from '../utils/userSerializers.js';

// req.content.node is the authorized course (set by requireCourseAccess).
export const list = async (req, res) => {
  const mentors = await getCourseMentors(req.content.node);

  sendSuccess(res, { message: 'Course mentors fetched successfully', data: mentors.map(toMentorSummary) });
};

export const replace = async (req, res) => {
  const mentors = await setCourseMentors(req.content.node, req.body.mentorIds, req.user);

  sendSuccess(res, { message: 'Course mentors updated successfully', data: mentors.map(toMentorSummary) });
};