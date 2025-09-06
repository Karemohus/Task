import React from 'react';
import type { Task } from '../types';
import { BellIcon, XMarkIcon } from './Icons';

interface ReminderModalProps {
  task: Task | null;
  onClose: () => void;
}

const ReminderModal: React.FC<ReminderModalProps> = ({ task, onClose }) => {
  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <BellIcon className="w-7 h-7 text-sky-500" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Task Reminder</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full" aria-label="Close reminder">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-6">
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">{task.title}</h3>
          <p className="text-slate-600 dark:text-slate-400">
            {task.description || 'No description provided.'}
          </p>
        </div>
        <div className="flex justify-end mt-8">
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-transform transform hover:scale-105"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderModal;