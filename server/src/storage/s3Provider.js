import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl as presign } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env.js';
import { MEDIA_LIMITS } from '../constants/media.js';

// Credentials never leave this module: they are read once here from env.js (the sole reader of
// process.env) and are never included in any API response.
const client = new S3Client({
  region: env.storageRegion,
  ...(env.storageEndpoint ? { endpoint: env.storageEndpoint, forcePathStyle: true } : {}),
  credentials: { accessKeyId: env.storageAccessKeyId, secretAccessKey: env.storageSecretAccessKey },
});

const putObject = async ({ buffer, key, contentType }) => {
  await client.send(new PutObjectCommand({ Bucket: env.storageBucket, Key: key, Body: buffer, ContentType: contentType, ServerSideEncryption: 'AES256' }));
};

const deleteObject = async (key) => {
  await client.send(new DeleteObjectCommand({ Bucket: env.storageBucket, Key: key }));
};

// Presigning is a local cryptographic operation — no network call — so this is cheap to call per item.
const getSignedUrl = async (media, { expiresInSeconds = MEDIA_LIMITS.SIGNED_URL_TTL_SECONDS, disposition = 'inline', filename } = {}) => {
  const command = new GetObjectCommand({
    Bucket: env.storageBucket,
    Key: media.storageKey,
    ResponseContentType: media.mimeType,
    ResponseContentDisposition: `${disposition}${filename ? `; filename="${filename}"` : ''}`,
  });
  return presign(client, command, { expiresIn: expiresInSeconds });
};

export default { putObject, deleteObject, getSignedUrl };