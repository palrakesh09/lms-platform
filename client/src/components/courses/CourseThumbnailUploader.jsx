import { useState } from 'react';
import { apiClient } from '../../services/apiClient.js';
import { getMediaAccessUrl, uploadMedia } from '../../services/mediaService.js';
import { resolveDeliveryUrl, IMAGE_ACCEPT } from '../../utils/mediaUtils.js';
import { secondaryButton, smallDangerButton } from '../common/buttonClasses.js';
import MediaUploader from '../media/MediaUploader.jsx';

export default function CourseThumbnailUploader({ courseId, currentUrl, onChanged }) {
  const [preview, setPreview] = useState(currentUrl);

  const setThumbnail = async (mediaId) => {
    const { data } = await apiClient.patch(`/courses/${courseId}/thumbnail`, { mediaId });
    setPreview(data.data.thumbnailUrl);
    onChanged(data.data);
  };

  const handleUploaded = async (media) => {
    await setThumbnail(media.id);
  };

  return (
    <div className="space-y-3">
      {preview && <img src={preview} alt="Course thumbnail" className="aspect-video w-full max-w-xs rounded-lg border border-slate-200 object-cover" />}
      <MediaUploader accept={IMAGE_ACCEPT} maxSizeLabel="JPEG, PNG, WebP or GIF, up to 5MB." entityType="course" entityId={courseId} buttonLabel="Upload thumbnail" onUploaded={handleUploaded} />
      {preview && <button type="button" onClick={() => setThumbnail(null)} className={smallDangerButton}>Remove thumbnail</button>}
    </div>
  );
}