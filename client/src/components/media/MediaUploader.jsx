import { useRef, useState } from 'react';
import { uploadMedia } from '../../services/mediaService.js';
import { getMutationError } from '../../utils/getMutationError.js';
import { secondaryButton } from '../common/buttonClasses.js';
import Icon from '../common/Icon.jsx';

export default function MediaUploader({
  accept,
  maxSizeLabel,
  entityType,
  entityId,
  onUploaded,
  buttonLabel = 'Upload file',
}) {
  const inputRef = useRef(null);

  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');

  const uploading = progress !== null;

  const upload = async (file) => {
    if (!file || uploading) return;

    setError('');
    setProgress(0);

    try {
      const media = await uploadMedia(
        {
          file,
          entityType,
          entityId,
        },
        setProgress,
      );

      onUploaded(media);
    } catch (failure) {
      setError(getMutationError(failure).message);
    } finally {
      setProgress(null);

      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();

    if (uploading) return;

    setDragging(false);

    const file = event.dataTransfer.files?.[0];

    upload(file);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(event) => {
          event.preventDefault();

          if (!uploading) {
            setDragging(true);
          }
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={[
          'relative overflow-hidden border border-dashed p-6 text-center transition',
          dragging
            ? 'border-[var(--lms-accent)] bg-[var(--lms-accent)]/5'
            : 'border-[var(--lms-border)] bg-[#0D0D0D] hover:border-white/30',
          uploading ? 'pointer-events-none opacity-70' : '',
        ].join(' ')}
      >
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.035]">
          <div className="grid-background h-full w-full" />
        </div>

        <div className="relative">
          <div
            className={[
              'mx-auto flex size-12 items-center justify-center border transition',
              dragging
                ? 'border-[var(--lms-accent)] text-[var(--lms-accent)]'
                : 'border-[var(--lms-border)] text-[var(--lms-muted)]',
            ].join(' ')}
          >
            <Icon
              name={dragging ? 'upload' : 'plus'}
              className="size-5"
            />
          </div>

          <p className="mt-4 text-sm font-medium text-white">
            {dragging
              ? 'Drop file to upload'
              : uploading
                ? 'Uploading asset…'
                : 'Upload media asset'}
          </p>

          <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-[var(--lms-muted)]">
            Drag and drop a file here, or select one from your device.
          </p>

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="sr-only"
            disabled={uploading}
            onChange={(event) =>
              upload(event.target.files?.[0])
            }
            aria-label={buttonLabel}
          />

          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className={`${secondaryButton} mt-4`}
          >
            <Icon name="upload" className="size-4" />
            {uploading ? 'Uploading…' : buttonLabel}
          </button>

          {maxSizeLabel && (
            <p className="mt-3 font-mono text-[9px] uppercase tracking-wider text-[var(--lms-muted)]">
              {maxSizeLabel}
            </p>
          )}
        </div>
      </div>

      {/* Progress */}
      {progress !== null && (
        <div
          role="status"
          aria-live="polite"
          className="border border-[var(--lms-border)] bg-[#0D0D0D] p-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="mono-label">
              UPLOAD PROGRESS
            </span>

            <span className="font-mono text-xs text-white">
              {progress}%
            </span>
          </div>

          <div className="h-1 overflow-hidden bg-[var(--lms-border)]">
            <div
              className="h-full bg-[var(--lms-accent)] transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 border border-red-500/30 bg-red-500/10 px-3 py-3"
        >
          <Icon
            name="warning"
            className="mt-0.5 size-4 shrink-0 text-red-400"
          />

          <div>
            <p className="text-sm font-medium text-red-300">
              Upload failed
            </p>

            <p className="mt-0.5 text-xs text-red-300/80">
              {error}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}