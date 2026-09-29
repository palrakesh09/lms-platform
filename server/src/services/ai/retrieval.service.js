import { CONTENT_STATUS, ROLES } from '../../constants/lms.js';
import Course from '../../models/Course.js';
import Enrollment from '../../models/Enrollment.js';
import Resource from '../../models/Resource.js';
import { canReadContent, canReadCourse, isStaff } from '../../policies/courseAccess.js';
import { loadContentChain } from '../contentAccess.service.js';
import { resolveScope, search } from '../search.service.js'; // Phase 13, reused verbatim — no parallel search
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import { notFoundError } from '../../utils/contentErrors.js';

const STAFF_AREA = { [ROLES.ADMIN]: 'admin', [ROLES.MENTOR]: 'mentor' };

// Same "reject before rendering" rule as everywhere else: authorization happens here, before any text
// is ever assembled for the model — the model never decides who may see what.
const assertAuthorized = async (user, contextType, contextId) => {
  if (contextType === 'course') {
    const course = await Course.findById(contextId, 'title status instructors category level shortDescription description').lean();
    if (!course) throw notFoundError();
    if (!canReadCourse(user, course)) throw notFoundError();
    if (user.role === ROLES.STUDENT) {
      const enrolled = await Enrollment.exists({ student: user.id, course: course._id, status: { $ne: 'cancelled' } });
      if (!enrolled) throw new ApiError(403, 'You must enroll in this course to ask about its content');
    }
    return { course, node: course, path: [] };
  }

  const chain = await loadContentChain(contextType, contextId);
  if (!chain) throw notFoundError();
  if (!canReadContent(user, chain)) throw notFoundError();
  if (user.role === ROLES.STUDENT) {
    const enrolled = await Enrollment.exists({ student: user.id, course: chain.course._id, status: { $ne: 'cancelled' } });
    if (!enrolled) throw new ApiError(403, 'You must enroll in this course to ask about its content');
  }
  return chain;
};

// Converts a Phase 12 structured content document to plain text. Images/links are represented by their
// text only — never rendered as markup, and never given the ability to inject formatting.
const blocksToPlainText = (content) => {
  const lines = [];
  for (const block of content?.blocks ?? []) {
    switch (block.type) {
      case 'heading': lines.push(`${'#'.repeat(block.level)} ${block.text}`); break;
      case 'paragraph': case 'quote': lines.push(block.text); break;
      case 'note': case 'warning': lines.push(`[${block.type.toUpperCase()}] ${block.title ? `${block.title}: ` : ''}${block.text}`); break;
      case 'bullet-list': case 'numbered-list': lines.push((block.items ?? []).map((item) => `- ${item}`).join('\n')); break;
      case 'code': lines.push(`\`\`\`${block.language}\n${block.code}\n\`\`\``); break;
      case 'image': lines.push(`[image: ${block.alt}]`); break;
      case 'link': lines.push(`(reference: ${block.text})`); break;
      case 'table': lines.push([block.headers.join(' | '), ...(block.rows ?? []).map((r) => r.join(' | '))].join('\n')); break;
      default: break;
    }
  }
  return lines.join('\n\n');
};

const contentUrl = (kind, ids, role) => {
  const area = STAFF_AREA[role];
  const course = String(ids.course);
  if (area) return kind === 'course' ? `/${area}/courses/${course}` : `/${area}/courses/${course}`;
  if (kind === 'course') return `/courses/${course}`;
  if (kind === 'resource') return `/learn/${course}/resource/${ids.self}`;
  return `/learn/${course}`; // module/topic/concept: the learning page resumes to the right spot
}

const truncate = (text, max) => (text.length > max ? `${text.slice(0, max)}…` : text);

// Assembles: 1) the text of the exact node the student is looking at, and 2) up to a couple of
// supplementary matches for the free-text QUESTION, found via Phase 13's own authorized search — never
// a second, parallel content-discovery mechanism.
export const buildRetrievedContext = async (user, { contextType, contextId, query }) => {
  if (!contextType || contextType === 'general') return { text: '', sources: [], course: null };

  const chain = await assertAuthorized(user, contextType, contextId);
  const budget = env.aiMaxContextChars;
  const parts = [];
  const sources = [];

  if (contextType === 'course') {
    parts.push(`Course: ${chain.course.title}\n${chain.course.shortDescription || chain.course.description || ''}`);
  } else {
    parts.push(`Course: ${chain.course.title}\n${['module', 'topic', 'concept'].includes(contextType) ? `Section: ${chain.node.title}` : ''}\n${chain.node.description || ''}`);
    if (contextType === 'resource') parts.push(blocksToPlainText(chain.node.content));
    sources.push({ type: contextType, title: chain.node.title, url: contentUrl(contextType, { course: chain.course._id, self: chain.node._id }, user.role) });
  }

  if (query && query.trim().length >= 2) {
    const scope = await resolveScope(user, chain.course._id);
    const { results } = await search({ q: query.trim().slice(0, 100), types: ['concept', 'resource'], sort: 'relevance', page: 1, limit: 3 }, scope);
    for (const hit of results) {
      if (sources.length >= 3) break;
      if (hit.type === 'resource') {
        const resource = await Resource.findOne({ _id: hit.id, status: CONTENT_STATUS.PUBLISHED }, 'title content').lean();
        if (resource) parts.push(`Related lesson — ${resource.title}:\n${truncate(blocksToPlainText(resource.content), 1500)}`);
      } else {
        parts.push(`Related concept — ${hit.title}: ${hit.description}`);
      }
      if (!sources.some((s) => s.url === hit.url)) sources.push({ type: hit.type, title: hit.title, url: hit.url });
    }
  }

  return { text: truncate(parts.filter(Boolean).join('\n\n'), budget), sources: sources.slice(0, 3), course: chain.course };
};

export { isStaff };