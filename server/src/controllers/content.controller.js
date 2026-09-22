import {
  conceptService,
  moduleService,
  resourceService,
  topicService,
} from '../services/content.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { toConcept, toModule, toResource, toTopic } from '../utils/serializers.js';

// One thin controller shape for modules, topics, concepts and resources.
// req.content.node is the authorized target (or, for list/create, the authorized PARENT).
const createContentController = ({ service, serialize, label }) => {
  const title = label[0].toUpperCase() + label.slice(1);

  return {
    listByParent: async (req, res) => {
      const items = await service.listByParent(req.content.node._id, req.user, req.validatedQuery);

      sendSuccess(res, {
        message: `${title}s fetched successfully`,
        data: items.map((item) => serialize(item, req.user)),
      });
    },

    get: (req, res) => {
      sendSuccess(res, { message: `${title} fetched successfully`, data: serialize(req.content.node, req.user) });
    },

    create: async (req, res) => {
      const item = await service.create(req.content.node._id, req.body, req.user);

      sendSuccess(res, {
        statusCode: 201,
        message: `${title} created successfully`,
        data: serialize(item, req.user),
      });
    },

    update: async (req, res) => {
      const item = await service.update(req.content.node._id, req.body, req.user);

      sendSuccess(res, { message: `${title} updated successfully`, data: serialize(item, req.user) });
    },

    remove: async (req, res) => {
      await service.remove(req.content.node._id);

      sendSuccess(res, { message: `${title} deleted successfully` });
    },
  };
};

export const moduleController = createContentController({ service: moduleService, serialize: toModule, label: 'module' });
export const topicController = createContentController({ service: topicService, serialize: toTopic, label: 'topic' });
export const conceptController = createContentController({ service: conceptService, serialize: toConcept, label: 'concept' });
export const resourceController = createContentController({ service: resourceService, serialize: toResource, label: 'resource' });