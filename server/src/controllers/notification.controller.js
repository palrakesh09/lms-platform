// server/src/controllers/notification.controller.js
import * as service from '../services/notification.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { toNotification } from '../utils/notificationSerializers.js';

// req.user.id is the only identity used. No route reads a user id from params, query or body.
export const list = async (req, res) => {
  const { items, unreadCount, pagination } = await service.listForUser(req.user.id, req.validatedQuery);
  sendSuccess(res, { message: 'Notifications fetched successfully', data: items.map(toNotification), pagination, meta: { unreadCount } });
};
export const unreadCount = async (req, res) => sendSuccess(res, { data: { count: await service.countUnread(req.user.id) } });
export const markRead = async (req, res) => sendSuccess(res, { message: 'Marked as read', data: toNotification(await service.markRead(req.user.id, req.params.id)) });
export const markAllRead = async (req, res) => sendSuccess(res, { message: 'All notifications marked as read', data: { updated: await service.markAllRead(req.user.id) } });
export const remove = async (req, res) => { await service.remove(req.user.id, req.params.id); sendSuccess(res, { message: 'Notification deleted' }); };