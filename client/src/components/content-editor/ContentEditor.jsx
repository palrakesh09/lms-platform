import { useState } from 'react';
import { BLOCK_TYPE_OPTIONS, emptyBlock } from '../../utils/contentBlocks.js';
import { secondaryButton, smallButton, smallDangerButton } from '../common/buttonClasses.js';
import Icon from '../common/Icon.jsx';
import ContentRenderer from '../content-renderer/ContentRenderer.jsx';
import BlockEditor from './BlockEditor.jsx';

// Add → Edit → Preview → Save, exactly as the phase brief describes. Preview renders through the SAME
// ContentRenderer students see, so authoring and student rendering can never drift apart (§12).
export default function ContentEditor({ blocks, onChange }) {
  const [mode, setMode] = useState('edit'); // 'edit' | 'preview'
  const [pickerOpen, setPickerOpen] = useState(false);

  const updateBlock = (index, next) => onChange(blocks.map((b, i) => (i === index ? next : b)));
  const removeBlock = (index) => onChange(blocks.filter((_, i) => i !== index));
  const duplicateBlock = (index) => {
    const copy = { ...blocks[index], id: `${blocks[index].id ?? index}-copy-${Date.now()}` };
    onChange([...blocks.slice(0, index + 1), copy, ...blocks.slice(index + 1)]);
  };
  const moveBlock = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  const addBlock = (type) => {
    onChange([...blocks, emptyBlock(type)]);
    setPickerOpen(false);
  };

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Content</h4>
        <div role="group" aria-label="Editor mode" className="inline-flex rounded-md border border-slate-300 bg-white p-0.5">
          <button type="button" onClick={() => setMode('edit')} aria-pressed={mode === 'edit'} className={`rounded px-2.5 py-1 text-xs font-medium ${mode === 'edit' ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>Edit</button>
          <button type="button" onClick={() => setMode('preview')} aria-pressed={mode === 'preview'} className={`rounded px-2.5 py-1 text-xs font-medium ${mode === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>Preview</button>
        </div>
      </div>

      {mode === 'preview' ? (
        blocks.length === 0 ? (
          <p className="text-sm text-slate-600">No content blocks yet.</p>
        ) : (
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <ContentRenderer content={{ version: 1, blocks }} />
          </div>
        )
      ) : (
        <>
          {blocks.length === 0 && <p className="text-sm text-slate-600">No content blocks yet. Add one below.</p>}

          <ul className="space-y-3">
            {blocks.map((block, index) => (
              <li key={block.id ?? index} className="rounded-md border border-slate-200 bg-white p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{block.type.replace('-', ' ')}</span>
                  <div className="flex flex-wrap gap-1">
                    <button type="button" onClick={() => moveBlock(index, -1)} disabled={index === 0} aria-label="Move block up" className={smallButton}>
                      <Icon name="chevron-right" className="size-3.5 -rotate-90" />
                    </button>
                    <button type="button" onClick={() => moveBlock(index, 1)} disabled={index === blocks.length - 1} aria-label="Move block down" className={smallButton}>
                      <Icon name="chevron-right" className="size-3.5 rotate-90" />
                    </button>
                    <button type="button" onClick={() => duplicateBlock(index)} aria-label="Duplicate block" className={smallButton}>Duplicate</button>
                    <button type="button" onClick={() => removeBlock(index)} aria-label="Delete block" className={smallDangerButton}>
                      <Icon name="trash" className="size-3.5" />
                    </button>
                  </div>
                </div>
                <BlockEditor block={block} onChange={(next) => updateBlock(index, next)} />
              </li>
            ))}
          </ul>

          <div className="relative">
            <button type="button" onClick={() => setPickerOpen((v) => !v)} aria-expanded={pickerOpen} className={secondaryButton}>
              <Icon name="plus" className="size-4" />
              Add Content
            </button>
            {pickerOpen && (
              <div role="menu" className="absolute z-10 mt-1 grid w-56 grid-cols-2 gap-1 rounded-md border border-slate-200 bg-white p-2 shadow-lg">
                {BLOCK_TYPE_OPTIONS.map((option) => (
                  <button key={option.value} type="button" role="menuitem" onClick={() => addBlock(option.value)} className="rounded px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600">
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}