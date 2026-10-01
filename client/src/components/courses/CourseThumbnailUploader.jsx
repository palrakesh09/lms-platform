import { useState } from 'react';
import { apiClient } from '../../services/apiClient.js';
import { IMAGE_ACCEPT } from '../../utils/mediaUtils.js';
import {
  secondaryButton,
  smallDangerButton,
} from '../common/buttonClasses.js';
import Icon from '../common/Icon.jsx';
import MediaUploader from '../media/MediaUploader.jsx';

export default function CourseThumbnailUploader({
  courseId,
  currentUrl,
  onChanged,
}) {
  const [preview, setPreview] = useState(currentUrl);
  const [saving, setSaving] = useState(false);

  const setThumbnail = async (mediaId) => {
    setSaving(true);

    try {
      const { data } = await apiClient.patch(
        `/courses/${courseId}/thumbnail`,
        { mediaId },
      );

      setPreview(data.data.thumbnailUrl);
      onChanged(data.data);
    } finally {
      setSaving(false);
    }
  };

  const handleUploaded = async (media) => {
    await setThumbnail(media.id);
  };

  const removeThumbnail = async () => {
    setSaving(true);

    try {
      await setThumbnail(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Current asset */}
      <div className="border border-[var(--lms-border)] bg-[#0D0D0D]">
        <div className="flex items-center justify-between border-b border-[var(--lms-border)] px-4 py-3">
          <div>
            <p className="mono-label text-[var(--lms-accent)]">
              COURSE ASSET
            </p>

            <p className="mt-1 text-sm font-medium text-white">
              Thumbnail
            </p>
          </div>

          {preview && (
            <span className="font-mono text-[9px] uppercase tracking-wider text-green-400">
              ACTIVE
            </span>
          )}
        </div>

        {preview ? (
          <div className="p-4">
            <div className="relative max-w-2xl overflow-hidden border border-[var(--lms-border)] bg-black">
              <img
                src={preview}
                alt="Course thumbnail"
                className="aspect-video w-full object-cover"
              />

              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-black/75 px-3 py-2 backdrop-blur-sm">
                <span className="font-mono text-[9px] uppercase tracking-widest text-white">
                  CURRENT THUMBNAIL
                </span>

                <button
                  type="button"
                  disabled={saving}
                  onClick={removeThumbnail}
                  className={smallDangerButton}
                >
                  <Icon
                    name="trash"
                    className="size-3.5"
                  />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid-background flex min-h-52 items-center justify-center">
            <div className="text-center">
              <Icon
                name="image"
                className="mx-auto size-8 text-[var(--lms-muted)]"
              />

              <p className="mt-3 text-sm text-[var(--lms-muted)]">
                No thumbnail configured
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Upload */}
      <MediaUploader
        accept={IMAGE_ACCEPT}
        maxSizeLabel="JPEG, PNG, WebP or GIF · maximum 5MB"
        entityType="course"
        entityId={courseId}
        buttonLabel="Choose thumbnail"
        onUploaded={handleUploaded}
      />

      {saving && (
        <div
          role="status"
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--lms-muted)]"
        >
          <span className="status-dot" />
          Updating course asset…
        </div>
      )}
    </div>
  );
}