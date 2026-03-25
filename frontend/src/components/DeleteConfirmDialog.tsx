interface DeleteConfirmDialogProps {
  recipeName: string;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmDialog({ recipeName, open, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-surface rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h3 className="font-serif text-lg font-bold text-text-primary mb-2">Delete Recipe</h3>
        <p className="text-text-secondary mb-6">
          Are you sure you want to delete <strong className="text-text-primary">{recipeName}</strong>? This action can be undone for a few seconds.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-lg border border-border text-text-secondary hover:bg-warm-gray transition-colors font-medium cursor-pointer min-h-[48px]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-150 cursor-pointer min-h-[48px]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
