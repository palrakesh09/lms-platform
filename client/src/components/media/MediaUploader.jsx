import { useRef, useState } from 'react';
import { uploadMedia } from '../../services/mediaService.js';
import { getMutationError } from '../../utils/getMutationError.js';
import { secondaryButton } from '../common/buttonClasses.js';
import Icon from '../common/Icon.jsx';

// Generic file picker with drag-and-drop, progress, and validation feedback. `accept` and `maxSizeLabel`
// are display hints only — the server is the actual authority on type and size.
export default function MediaUploader({ accept, maxSizeLabel, entityType, entityId, onUploaded, buttonLabel = 'Upload file' }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');

  const upload = async (file) => {
    if (!file) return;
    setError('');
    setProgress(0);
    try {
      const media = await uploadMedia({ file, entityType, entityId }, setProgress);
      onUploaded(media);
    } catch (failure) {
      setError(getMutationError(failure).message);
    } finally {
      setProgress(null);
    }
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); upload(e.dataTransfer.files?.[0]); }}
        className={`rounded-lg border-2 border-dashed p-4 text-center text-sm ${dragging ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300'}`}
      >
        <input ref={inputRef} type="file" accept={accept} className="sr-only" onChange={(e) => upload(e.target.files?.[0])} aria-label={buttonLabel} />
        <Icon name="plus" className="mx-auto size-6 text-slate-400" />
        <button type="button" onClick={() => inputRef.current?.click()} className={`${secondaryButton} mt-2`}>{buttonLabel}</button>
        <p className="mt-1 text-xs text-slate-600">Drag and drop, or click to choose. {maxSizeLabel}</p>
      </div>
      {progress !== null && (
        <div role="status" aria-live="polite" className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}