import { Router } from 'express';
import multer from 'multer';
import { ROLES } from '../constants/lms.js';
import { MEDIA_LIMITS } from '../constants/media.js';
import * as mediaController from '../controllers/media.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { noStore } from '../middleware/noStore.js';
import { uploadLimiter } from '../middleware/uploadLimiter.js';
import { validate, validateQuery } from '../middleware/validate.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import { ApiError } from '../utils/ApiError.js';
import { accessQuerySchema, listMediaQuerySchema, uploadMetaSchema } from '../validators/media.validators.js';

const { ADMIN, MENTOR } = ROLES;
const router = Router();

const multerSingle = multer({ storage: multer.memoryStorage(), limits: { fileSize: MEDIA_LIMITS.MULTER_CEILING_BYTES, files: 1 } }).single('file');
const handleUpload = (req, res, next) =>
  multerSingle(req, res, (error) => {
    if (!error) return next();
    if (error.code === 'LIMIT_FILE_SIZE') return next(new ApiError(413, 'File is too large'));
    return next(new ApiError(400, 'Upload failed'));
  });

// /download supports an unauthenticated signed-token path (for <img>/download links), so it is NOT
// behind the blanket authenticate() below — the controller itself requires either a valid token or a
// session. Every other route is authenticated.
router.get('/:id/download', validateObjectId('id'), mediaController.download);

router.use(authenticate, noStore);

router.post('/upload', authorize(ADMIN, MENTOR), uploadLimiter, handleUpload, validate(uploadMetaSchema), mediaController.upload);
router.get('/', authorize(ADMIN, MENTOR), validateQuery(listMediaQuerySchema), mediaController.list);
router.get('/:id', authorize(ADMIN, MENTOR), validateObjectId('id'), mediaController.get);
router.delete('/:id', authorize(ADMIN, MENTOR), validateObjectId('id'), mediaController.remove);
router.get('/:id/access', validateObjectId('id'), validateQuery(accessQuerySchema), mediaController.access);
router.post('/resolve-batch', mediaController.resolveBatch);

export default router;