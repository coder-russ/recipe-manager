import { useState } from 'react';
import type { TagCount } from '../types';
import TagInput from './TagInput';

interface BulkActionBarProps {
  selectedCount: number;
  allTags: TagCount[];
  selectedRecipeTags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onCancel: () => void;
}

export default function BulkActionBar({
  selectedCount,
  allTags,
  selectedRecipeTags,
  onAddTag,
  onRemoveTag,
  onCancel,
}: BulkActionBarProps) {
  const [showAddTag, setShowAddTag] = useState(false);
  const [showRemoveTag, setShowRemoveTag] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border shadow-lg">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-text-primary">
          {selectedCount} selected
        </span>

        <div className="relative">
          <button
            onClick={() => { setShowAddTag(!showAddTag); setShowRemoveTag(false); }}
            className="px-3 py-1.5 rounded-lg bg-sage text-white text-sm font-medium hover:bg-sage/90 transition-colors cursor-pointer"
          >
            Add tags
          </button>
          {showAddTag && (
            <div className="absolute bottom-full mb-2 left-0 w-56 bg-surface border border-border rounded-lg shadow-lg p-3">
              <TagInput
                allTags={allTags}
                onAdd={(tag) => {
                  onAddTag(tag);
                  setShowAddTag(false);
                }}
                placeholder="Tag to add..."
              />
            </div>
          )}
        </div>

        {selectedRecipeTags.length > 0 && (
          <div className="relative">
            <button
              onClick={() => { setShowRemoveTag(!showRemoveTag); setShowAddTag(false); }}
              className="px-3 py-1.5 rounded-lg bg-warm-gray text-text-secondary text-sm font-medium hover:bg-border transition-colors cursor-pointer"
            >
              Remove tags
            </button>
            {showRemoveTag && (
              <div className="absolute bottom-full mb-2 left-0 w-56 bg-surface border border-border rounded-lg shadow-lg p-2">
                {selectedRecipeTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      onRemoveTag(tag);
                      setShowRemoveTag(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-warm-gray rounded transition-colors cursor-pointer"
                  >
                    Remove "{tag}"
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={onCancel}
          className="ml-auto px-3 py-1.5 rounded-lg border border-border text-text-secondary text-sm font-medium hover:bg-warm-gray transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
