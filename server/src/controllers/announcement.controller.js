// server/src/controllers/announcement.controller.js
import * as service from '../services/announcement.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { toAnnouncement } from '../utils/notificationSerializers.js';

export const create = async (req, res) =>
  sendSuccess(res, { statusCode: 201, message: 'Announcement created', data: toAnnouncement(await service.createAnnouncement(req.body, req.user), req.user) });

export const list = async (req, res) => {
  const { items, pagination } = await service.listAnnouncements(req.validatedQuery, req.user);
  sendSuccess(res, { message: 'Announcements fetched successfully', data: items.map((a) => toAnnouncement(a, req.user)), pagination });
};

export const get = async (req, res) =>
  sendSuccess(res, { message: 'Announcement fetched successfully', data: toAnnouncement(await service.getAnnouncement(req.params.id, req.user), req.user) });

export const update = async (req, res) =>
  sendSuccess(res, { message: 'Announcement updated', data: toAnnouncement(await service.updateAnnouncement(req.params.id, req.body, req.user), req.user) });

export const remove = async (req, res) => { await service.deleteAnnouncement(req.params.id, req.user); sendSuccess(res, { message: 'Announcement deleted' }); };

export const publish = async (req, res) => {
  const { announcement, recipients } = await service.publishAnnouncement(req.params.id, req.user);
  sendSuccess(res, { message: 'Announcement published', data: { announcement: toAnnouncement(announcement, req.user), recipients } });
};