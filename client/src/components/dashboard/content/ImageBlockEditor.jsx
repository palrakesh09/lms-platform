import { useState } from 'react';
import MediaUploader from '../../media/MediaUploader.jsx';
import { getMediaAccessUrl } from '../../../services/mediaService.js';
import { IMAGE_ACCEPT } from '../../../utils/mediaUtils.js';

 export default function ImageBlockEditor({ block, onChange }) {
  const [preview, setPreview] = useState(null);
  const mode = block.mediaId ? 'upload' : 'url';

  const handleUploaded = async (media) => {
    onChange({ ...block, mediaId: media.id, url: undefined });
    setPreview((await getMediaAccessUrl(media.id)).url);
  };
   return (
     <div className="space-y-2">
      {mode === 'upload' ? (
        <div className="space-y-2">
          {preview && <img src={preview} alt="" className="max-h-32 rounded border border-slate-200" />}
          <button type="button" onClick={() => onChange({ ...block, mediaId: undefined, url: '' })} className="text-xs font-medium text-indigo-700 underline">Use an external URL instead</button>
        </div>
      ) : (
        <>
          <input type="url" value={block.url ?? ''} onChange={(e) => onChange({ ...block, url: e.target.value })} placeholder="https://example.com/image.png" aria-label="Image URL" className="block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm" />
          <p className="text-xs text-slate-600">or</p>
          <MediaUploader accept={IMAGE_ACCEPT} maxSizeLabel="Up to 5MB." entityType="concept" entityId={window.__currentConceptId} buttonLabel="Upload an image" onUploaded={handleUploaded} />
        </>
      )}
       <input type="text" value={block.alt} onChange={(e) => onChange({ ...block, alt: e.target.value })} placeholder="Alt text (required)" aria-label="Alt text" />
       <input type="text" value={block.caption ?? ''} onChange={(e) => onChange({ ...block, caption: e.target.value })} placeholder="Caption (optional)" aria-label="Caption" />
     </div>
   );
 }