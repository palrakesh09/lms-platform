import * as userService from '../services/user.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { toAdminUser } from '../utils/userSerializers.js';

export const list = async (req, res) => {
  const { items, pagination } = await userService.listUsers(req.validatedQuery);

  sendSuccess(res, { message: 'Users fetched successfully', data: items.map(toAdminUser), pagination });
};

export const get = async (req, res) => {
  const user = await userService.getUser(req.params.id);

  sendSuccess(res, { message: 'User fetched successfully', data: toAdminUser(user) });
};

export const updateStatus = async (req, res) => {
  const user = await userService.setUserStatus(req.params.id, req.body.isActive, req.user);

  sendSuccess(res, {
    message: user.isActive ? 'User activated successfully' : 'User deactivated successfully',
    data: toAdminUser(user),
  });
};

export const updateRole = async (req, res) => {
  const user = await userService.setUserRole(req.params.id, req.body.role, req.user);

  sendSuccess(res, { message: 'User role updated successfully', data: toAdminUser(user) });
};