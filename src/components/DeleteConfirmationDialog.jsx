'use client';

import { AlertTriangle, Trash2 } from 'lucide-react';

/**
 * Reusable delete confirmation dialog.
 *
 * Props:
 *   isOpen    - boolean
 *   onClose   - () => void
 *   onConfirm - () => void
 *   title     - string (optional)
 *   message   - string (optional)
 *   loading   - boolean (optional) — disables buttons while deleting
 */
export default function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
            {title || 'Confirm Delete'}
          </h2>
          <p className="text-gray-600 text-center mb-6">
            {message || 'Are you sure you want to delete this item? This action cannot be undone.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Trash2 size={18} />
              {loading ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
