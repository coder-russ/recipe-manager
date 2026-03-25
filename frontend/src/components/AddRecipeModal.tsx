import { useState } from 'react';
import { importRecipe, updateRecipe } from '../api';

interface AddRecipeModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

type Step = 'url' | 'preview' | 'saving';

interface EditableRecipe {
  id: number;
  title: string;
  ingredients: string[];
  steps: string[];
  cook_time: string;
  prep_time: string;
  total_time: string;
  servings: string;
  image_path: string | null;
  source_url: string | null;
}

export default function AddRecipeModal({ open, onClose, onSaved }: AddRecipeModalProps) {
  const [step, setStep] = useState<Step>('url');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editableRecipe, setEditableRecipe] = useState<EditableRecipe | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const reset = () => {
    setStep('url');
    setUrl('');
    setLoading(false);
    setError(null);
    setEditableRecipe(null);
    setShowSuccess(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleImport = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const recipe = await importRecipe(url.trim());
      setEditableRecipe({
        id: recipe.id,
        title: recipe.title,
        ingredients: [...recipe.ingredients],
        steps: [...recipe.steps],
        cook_time: recipe.cook_time || '',
        prep_time: recipe.prep_time || '',
        total_time: recipe.total_time || '',
        servings: recipe.servings || '',
        image_path: recipe.image_path,
        source_url: recipe.source_url,
      });
      setStep('preview');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editableRecipe) return;
    setStep('saving');
    setError(null);
    try {
      await updateRecipe(editableRecipe.id, {
        title: editableRecipe.title,
        ingredients: editableRecipe.ingredients.filter((i) => i.trim()),
        steps: editableRecipe.steps.filter((s) => s.trim()),
        cook_time: editableRecipe.cook_time || null,
        prep_time: editableRecipe.prep_time || null,
        total_time: editableRecipe.total_time || null,
        servings: editableRecipe.servings || null,
      });
      setShowSuccess(true);
      setTimeout(() => {
        onSaved();
        handleClose();
      }, 1200);
    } catch (e: any) {
      setError(e.message);
      setStep('preview');
    }
  };

  const updateIngredient = (idx: number, value: string) => {
    if (!editableRecipe) return;
    const updated = [...editableRecipe.ingredients];
    updated[idx] = value;
    setEditableRecipe({ ...editableRecipe, ingredients: updated });
  };

  const removeIngredient = (idx: number) => {
    if (!editableRecipe) return;
    const updated = editableRecipe.ingredients.filter((_, i) => i !== idx);
    setEditableRecipe({ ...editableRecipe, ingredients: updated });
  };

  const addIngredient = () => {
    if (!editableRecipe) return;
    setEditableRecipe({
      ...editableRecipe,
      ingredients: [...editableRecipe.ingredients, ''],
    });
  };

  const updateStep = (idx: number, value: string) => {
    if (!editableRecipe) return;
    const updated = [...editableRecipe.steps];
    updated[idx] = value;
    setEditableRecipe({ ...editableRecipe, steps: updated });
  };

  const removeStep = (idx: number) => {
    if (!editableRecipe) return;
    const updated = editableRecipe.steps.filter((_, i) => i !== idx);
    setEditableRecipe({ ...editableRecipe, steps: updated });
  };

  const addStep = () => {
    if (!editableRecipe) return;
    setEditableRecipe({
      ...editableRecipe,
      steps: [...editableRecipe.steps, ''],
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-surface rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        {/* Success toast */}
        {showSuccess && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-sage text-white px-6 py-2.5 rounded-lg font-medium shadow-lg z-10 animate-[fadeIn_0.2s_ease]">
            Recipe saved!
          </div>
        )}

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl font-bold text-text-primary">
              {step === 'url' ? 'Add Recipe' : 'Review & Edit'}
            </h2>
            <button
              onClick={handleClose}
              className="text-text-secondary hover:text-text-primary transition-colors p-1 cursor-pointer"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Step 1: URL Input */}
          {step === 'url' && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Recipe URL
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleImport()}
                  placeholder="Paste a recipe URL..."
                  autoFocus
                  className="flex-1 px-4 py-3 rounded-lg border border-border bg-cream text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta text-base"
                />
                <button
                  onClick={handleImport}
                  disabled={loading || !url.trim()}
                  className="bg-terracotta hover:bg-terracotta-dark disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors duration-150 cursor-pointer shrink-0"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Importing...
                    </span>
                  ) : (
                    'Import'
                  )}
                </button>
              </div>
              {error && (
                <p className="mt-3 text-red-600 bg-red-50 rounded-lg p-3 text-sm">
                  {error}
                </p>
              )}
            </div>
          )}

          {/* Step 2: Editable Preview */}
          {step === 'preview' && editableRecipe && (
            <div className="space-y-5">
              {/* Image preview */}
              {editableRecipe.image_path && (
                <div className="rounded-lg overflow-hidden max-h-48">
                  <img
                    src={editableRecipe.image_path}
                    alt={editableRecipe.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Title</label>
                <input
                  type="text"
                  value={editableRecipe.title}
                  onChange={(e) => setEditableRecipe({ ...editableRecipe, title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-cream text-text-primary focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta font-semibold text-lg"
                />
              </div>

              {/* Time fields row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Prep Time</label>
                  <input
                    type="text"
                    value={editableRecipe.prep_time}
                    onChange={(e) => setEditableRecipe({ ...editableRecipe, prep_time: e.target.value })}
                    placeholder="e.g. 15 min"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-cream text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Cook Time</label>
                  <input
                    type="text"
                    value={editableRecipe.cook_time}
                    onChange={(e) => setEditableRecipe({ ...editableRecipe, cook_time: e.target.value })}
                    placeholder="e.g. 30 min"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-cream text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Total Time</label>
                  <input
                    type="text"
                    value={editableRecipe.total_time}
                    onChange={(e) => setEditableRecipe({ ...editableRecipe, total_time: e.target.value })}
                    placeholder="e.g. 45 min"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-cream text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Servings</label>
                  <input
                    type="text"
                    value={editableRecipe.servings}
                    onChange={(e) => setEditableRecipe({ ...editableRecipe, servings: e.target.value })}
                    placeholder="e.g. 4"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-cream text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta"
                  />
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-text-secondary">
                    Ingredients ({editableRecipe.ingredients.length})
                  </label>
                  <button
                    onClick={addIngredient}
                    className="text-xs text-terracotta hover:text-terracotta-dark font-medium cursor-pointer"
                  >
                    + Add ingredient
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {editableRecipe.ingredients.map((ing, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={ing}
                        onChange={(e) => updateIngredient(idx, e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg border border-border bg-cream text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta"
                      />
                      <button
                        onClick={() => removeIngredient(idx)}
                        className="text-text-secondary/50 hover:text-red-500 transition-colors px-1 cursor-pointer shrink-0"
                        title="Remove ingredient"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-text-secondary">
                    Steps ({editableRecipe.steps.length})
                  </label>
                  <button
                    onClick={addStep}
                    className="text-xs text-terracotta hover:text-terracotta-dark font-medium cursor-pointer"
                  >
                    + Add step
                  </button>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {editableRecipe.steps.map((s, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-sm text-terracotta font-bold mt-2.5 w-6 shrink-0 text-right">
                        {idx + 1}.
                      </span>
                      <textarea
                        value={s}
                        onChange={(e) => updateStep(idx, e.target.value)}
                        rows={2}
                        className="flex-1 px-3 py-2 rounded-lg border border-border bg-cream text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta resize-y"
                      />
                      <button
                        onClick={() => removeStep(idx)}
                        className="text-text-secondary/50 hover:text-red-500 transition-colors px-1 cursor-pointer shrink-0 mt-2"
                        title="Remove step"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-red-600 bg-red-50 rounded-lg p-3 text-sm">
                  {error}
                </p>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 rounded-lg border border-border text-text-secondary hover:bg-warm-gray transition-colors font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-terracotta hover:bg-terracotta-dark text-white px-4 py-3 rounded-lg font-medium transition-colors duration-150 cursor-pointer"
                >
                  Save Recipe
                </button>
              </div>
            </div>
          )}

          {/* Saving state */}
          {step === 'saving' && (
            <div className="flex flex-col items-center py-8">
              <svg className="w-10 h-10 animate-spin text-terracotta mb-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-text-secondary">Saving recipe...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
