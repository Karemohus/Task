import React, { useState, useEffect } from 'react';
import type { Task, Priority, Category, ReminderInterval } from '../types';
import { PRIORITY_CONFIG, CATEGORY_CONFIG, REMINDER_INTERVAL_CONFIG } from '../constants';
import { XMarkIcon, PaperClipIcon } from './Icons';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Task, 'id' | 'status' | 'createdAt' | 'reminderStartTime' | 'completedAt'>) => void;
  initialData?: Task | null;
}

// Helper to convert timestamp to datetime-local string
const toDateTimeLocal = (timestamp: number | null | undefined): string => {
    if (!timestamp) return '';
    try {
        const date = new Date(timestamp);
        // Adjust for timezone offset to display correctly in the input
        const timezoneOffset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - timezoneOffset);
        return localDate.toISOString().slice(0, 16);
    } catch (e) {
        return '';
    }
};

// Helper to convert datetime-local string to timestamp
const fromDateTimeLocal = (dateString: string): number | null => {
    if (!dateString) return null;
    return new Date(dateString).getTime();
};

const TaskFormModal: React.FC<TaskFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('personal');
  const [startDateTime, setStartDateTime] = useState('');
  const [reminderInterval, setReminderInterval] = useState<ReminderInterval>('none');
  const [attachment, setAttachment] = useState<{ name: string; data: string } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setPriority(initialData.priority);
      setCategory(initialData.category);
      setReminderInterval(initialData.reminderInterval || 'none');
      setStartDateTime(toDateTimeLocal(initialData.startDateTime));
      setAttachment(initialData.attachment || null);
    } else {
      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('personal');
      setReminderInterval('none');
      setStartDateTime('');
      setAttachment(null);
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size cannot exceed 5MB.');
        e.target.value = ''; // Reset file input
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment({
          name: file.name,
          data: reader.result as string,
        });
        setError('');
      };
      reader.onerror = () => {
        setError('Failed to read file.');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    const fileInput = document.getElementById('attachment-file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setError('');
    onSubmit({ title, description, priority, category, startDateTime: fromDateTimeLocal(startDateTime), reminderInterval, attachment: attachment || undefined });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8 transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{initialData ? 'Edit Task' : 'Add New Task'}</h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Title</label>
            <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none" required />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Description</label>
            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Priority</label>
              <select id="priority" value={priority} onChange={e => setPriority(e.target.value as Priority)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none">
                {Object.entries(PRIORITY_CONFIG).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Category</label>
              <select id="category" value={category} onChange={e => setCategory(e.target.value as Category)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none">
                {Object.entries(CATEGORY_CONFIG).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
              <label htmlFor="startDateTime" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Start Date & Time</label>
              <input
                  type="datetime-local"
                  id="startDateTime"
                  value={startDateTime}
                  onChange={e => setStartDateTime(e.target.value)}
                  className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
          </div>
          <div>
            <label htmlFor="reminderInterval" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Reminder</label>
            <select id="reminderInterval" value={reminderInterval} onChange={e => setReminderInterval(e.target.value as ReminderInterval)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none">
              {Object.entries(REMINDER_INTERVAL_CONFIG).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
           <div>
              <label htmlFor="attachment-file" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Attachment (Max 5MB)</label>
              {!attachment ? (
                <input type="file" id="attachment-file" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 dark:file:bg-sky-900/50 file:text-sky-700 dark:file:text-sky-300 hover:file:bg-sky-100 dark:hover:file:bg-sky-900" />
              ) : (
                <div className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-2 text-sm truncate">
                        <PaperClipIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{attachment.name}</span>
                    </div>
                    <button type="button" onClick={removeAttachment} className="p-1 text-slate-500 hover:text-red-500 rounded-full flex-shrink-0">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
              )}
            </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition">{initialData ? 'Save Changes' : 'Add Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;