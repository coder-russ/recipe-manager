import { useState } from 'react';
import { createRecipe } from '../api';
import type { TagCount } from '../types';
import TagInput from './TagInput';

interface ManualRecipeModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  allTags: TagCount[];
}

interface FormData {
  title: string;
  ingredients: string[];
  steps: string[];
  cook_time: string;
  prep_time: string;
  total_time: string;
  servings: string;
  recipe_yield: string;
  source_url: string;
  tags: string[];
  notes: string;
  rating: number | null;
}

const EMPTY_FORM: FormData = {
  title: '',
  ingredients: [''],
  steps: [''],
  cook_time: '',
  prep_time: '',
  total_time: '',
  servings: '',
  recipe_yield: '',
  source_url: '',
  tags: [],
  notes: '',
  rating: null,
};

export default function ManualRecipeModal({ open, onClose, onSaved, allTags }: ManualRecipeModalProps) {
  const [form, setForm] = useState<FormData>({ ...EMPTY_FORM, ingredients: [''], steps: [''] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setForm({ ...EMPTY_FORM, ingredients: [''], steps: [''] });
    setSaving(false);
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    const ingredients = form.ingredients.filter((i) => i.trim());
    if (ingredients.length === 0) {
      setError('At least one ingredient is required');
      return;
    }
    const steps = form.steps.filter((s) => s.trim());
    if (steps.length === 0) {
      setError('At least one step is required');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await createRecipe({
        title: form.title.trim(),
        ingredients,
        steps,
        cook_time: form.cook_time || null,
        prep_time: form.prep_time || null,
        total_time: form.total_time || null,
        servings: form.servings || null,
        recipe_yield: form.recipe_yield || null,
        source_url: form.source_url || null,
        tags: form.tags,
        notes: form.notes || null,
        rating: form.rating,
      });
      onSaved();
      handleClose();
    } catch (e: any) {
      setError(e.message);
      setSaving(false);
    }
  };

  const updateIngredient = (idx: number, value: string) => {
    const updated = [...form.ingredients];
    updated[idx] = value;
    setForm({ ...form, ingredients: updated });
  };

  const removeIngredient = (idx: number) => {
    if (form.ingredients.length <= 1) return;
    setForm({ ...form, ingredients: form.ingredients.filter((_, i) => i !== idx) });
  };

  const updateStep = (idx: number, value: string) => {
    const updated = [...form.steps];
    updated[idx] = value;
    setForm({ ...form, steps: updated });
  };

  const removeStep = (idx: number) => {
    if (form.steps.length <= 1) return;
    setForm({ ...form, steps: form.steps.filter((_, i) => i !== idx) });
  };

  const addTag = (tag: string) => {
    if (!form.tags.includes(tag)) {
      setForm({ ...form, tags: [...form.tags, tag] });
    }
  };

  const removeTag = (tag: string) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-12 px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-surface rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl font-bold text-text-primary">Create Recipe</h2>
            <button onClick={handleClose} className="text-text-secondary hover:text-text-primary transition-colors p-1 cursor-pointer">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Recipe title"
                autoFocus
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-cream text-text-primary focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta font-semibold text-lg"
              />
            </div>

            {/* Time fields */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Prep Time</label>
                <input type="text" value={form.prep_time} onChange={(e) => setForm({ ...form, prep_time: e.target.value })} placeholder="e.g. 15 min" className="w-full px-3 py-2 rounded-lg border border-border bg-cream text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Cook Time</label>
                <input type="text" value={form.cook_time} onChange={(e) => setForm({ ...form, cook_time: e.target.value })} placeholder="e.g. 30 min" className="w-full px-3 py-2 rounded-lg border border-border bg-cream text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Total Time</label>
                <input type="text" value={form.total_time} onChange={(e) => setForm({ ...form, total_time: e.target.value })} placeholder="e.g. 45 min" className="w-full px-3 py-2 rounded-lg border border-border bg-cream text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Servings</label>
                <input type="text" value={form.servings} onChange={(e) => setForm({ ...form, servings: e.target.value })} placeholder="e.g. 4" className="w-full px-3 py-2 rounded-lg border border-border bg-cream text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta" />
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-text-secondary">Ingredients * ({form.ingredients.filter((i) => i.trim()).length})</label>
                <button onClick={() => setForm({ ...form, ingredients: [...form.ingredients, ''] })} className="text-xs text-terracotta hover:text-terracotta-dark font-medium cursor-pointer">+ Add ingredient</button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {form.ingredients.map((ing, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={ing}
                      onChange={(e) => updateIngredient(idx, e.target.value)}
                      placeholder={`Ingredient ${idx + 1}`}
                      className="flex-1 px-3 py-2 rounded-lg border border-border bg-cream text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta min-h-[44px]"
                    />
                    <button onClick={() => removeIngredient(idx)} className="text-text-secondary/50 hover:text-red-500 transition-colors px-2 cursor-pointer shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center" title="Remove">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-text-secondary">Steps * ({form.steps.filter((s) => s.trim()).length})</label>
                <button onClick={() => setForm({ ...form, steps: [...form.steps, ''] })} className="text-xs text-terracotta hover:text-terracotta-dark font-medium cursor-pointer">+ Add step</button>
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {form.steps.map((s, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-sm text-terracotta font-bold mt-3 w-6 shrink-0 text-right">{idx + 1}.</span>
                    <textarea value={s} onChange={(e) => updateStep(idx, e.target.value)} rows={2} placeholder={`Step ${idx + 1}`} className="flex-1 px-3 py-2 rounded-lg border border-border bg-cream text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta resize-y" />
                    <button onClick={() => removeStep(idx)} className="text-text-secondary/50 hover:text-red-500 transition-colors px-2 cursor-pointer shrink-0 mt-2 min-w-[44px] min-h-[44px] flex items-center justify-center" title="Remove">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 bg-sage-light text-sage rounded-full pl-3 pr-1 py-1 text-sm font-medium">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="ml-0.5 p-0.5 rounded-full hover:bg-sage/20 cursor-pointer"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
                  </span>
                ))}
              </div>
              <div className="w-48">
                <TagInput allTags={allTags.filter((t) => !form.tags.includes(t.name))} onAdd={addTag} placeholder="Add tag..." />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Any personal notes..." className="w-full px-3 py-2 rounded-lg border border-border bg-cream text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta resize-y" />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setForm({ ...form, rating: form.rating === star ? null : star })}
                    className="cursor-pointer p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <svg className={`w-7 h-7 ${form.rating && star <= form.rating ? 'text-terracotta' : 'text-border'} transition-colors`} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-red-600 bg-red-50 rounded-lg p-3 text-sm">{error}</p>}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button onClick={handleClose} className="flex-1 px-4 py-3 rounded-lg border border-border text-text-secondary hover:bg-warm-gray transition-colors font-medium cursor-pointer min-h-[48px]">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-terracotta hover:bg-terracotta-dark disabled:opacity-50 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-150 cursor-pointer min-h-[48px]">
                {saving ? 'Saving...' : 'Create Recipe'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
