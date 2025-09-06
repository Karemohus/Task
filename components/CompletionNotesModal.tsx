import React, { useState } from 'react';
import type { Task } from '../types';
import { XMarkIcon, CheckCircleIcon } from './Icons';

interface CompletionNotesModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onSubmit: (notes: string) => void;
}

const CompletionNotesModal: React.FC<CompletionNotesModalProps> = ({ isOpen, task, onClose, onSubmit }) => {
  const [notes, setNotes] = useState('');

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(notes);
  };
  
  const handleCompleteWithoutNotes = () => {
    onSubmit('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose} aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8 transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-7 h-7 text-green-500" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Complete Task</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full" aria-label="Close">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="my-6">
            <p className="text-slate-600 dark:text-slate-400 mb-2">You are about to complete the task:</p>
            <p className="font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg">{task.title}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="completion-notes" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Add Completion Notes (Optional)</label>
            <textarea
              id="completion-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
              placeholder="E.g., Finished the design mockups and sent them for review."
              className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
            <button
                type="button"
                onClick={handleCompleteWithoutNotes}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition order-2 sm:order-1"
            >
                Complete without Notes
            </button>
            <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition order-1 sm:order-2"
            >
                Complete Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompletionNotesModal;
