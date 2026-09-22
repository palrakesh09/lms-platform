import { CONTENT_STATUS } from '../constants/lms.js';
import * as courseService from '../services/course.service.js';
import { getCourseStructure } from '../services/structure.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { toCourse } from '../utils/serializers.js';

// By the time these run, requireCourseAccess has authorized the request and set req.content.

export const list = async (req, res) => {
  const { items, pagination } = await courseService.listCourses(req.validatedQuery, req.user);

  sendSuccess(res, {
    message: 'Courses fetched successfully',
    data: items.map((course) => toCourse(course, req.user)),
    pagination,
  });
};

export const get = (req, res) => {
  sendSuccess(res, { message: 'Course fetched successfully', data: toCourse(req.content.node, req.user) });
};

export const create = async (req, res) => {
  const course = await courseService.createCourse(req.body, req.user);

  sendSuccess(res, { statusCode: 201, message: 'Course created successfully', data: toCourse(course, req.user) });
};

export const update = async (req, res) => {
  const course = await courseService.updateCourse(req.content.node._id, req.body, req.user);

  sendSuccess(res, { message: 'Course updated successfully', data: toCourse(course, req.user) });
};

export const publish = async (req, res) => {
  const course = await courseService.setCourseStatus(req.content.node._id, CONTENT_STATUS.PUBLISHED, req.user);

  sendSuccess(res, { message: 'Course published successfully', data: toCourse(course, req.user) });
};

export const archive = async (req, res) => {
  const course = await courseService.setCourseStatus(req.content.node._id, CONTENT_STATUS.ARCHIVED, req.user);

  sendSuccess(res, { message: 'Course archived successfully', data: toCourse(course, req.user) });
};

export const remove = async (req, res) => {
  await courseService.deleteCourse(req.content.node._id);

  sendSuccess(res, { message: 'Course deleted successfully' });
};

export const structure = async (req, res) => {
  const data = await getCourseStructure(req.content.node, req.user);

  sendSuccess(res, { message: 'Course structure fetched successfully', data });
};