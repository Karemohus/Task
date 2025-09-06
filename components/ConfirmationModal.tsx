import React from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from './Icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose} aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>
          </div>
          <button onClick={onClose} className="p-2 -mt-2 -mr-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full" aria-label="Close">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="my-6">
            <p className="text-slate-600 dark:text-slate-400">
                {message}
            </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
          <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition w-full sm:w-auto"
          >
              Cancel
          </button>
          <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:ring-offset-slate-800 transition w-full sm:w-auto"
          >
              Delete Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
