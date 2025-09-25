import React, { useState, useEffect, useRef } from 'react';
import type { Task, Priority, Category, ReminderInterval, Attachment } from '../types';
import { PRIORITY_CONFIG, CATEGORY_CONFIG, REMINDER_INTERVAL_CONFIG } from '../constants';
import { XMarkIcon, DocumentDuplicateIcon, DocumentIcon, TrashIcon } from './Icons';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Task, 'id' | 'status' | 'createdAt' | 'reminderStartTime' | 'completedAt'>) => void;
  initialData?: Task | null;
}

const toDateTimeLocal = (timestamp: number | null | undefined): string => {
    if (!timestamp) return '';
    try {
        const date = new Date(timestamp);
        const timezoneOffset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - timezoneOffset);
        return localDate.toISOString().slice(0, 16);
    } catch (e) {
        return '';
    }
};

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
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setPriority(initialData.priority);
      setCategory(initialData.category);
      setReminderInterval(initialData.reminderInterval || 'none');
      setStartDateTime(toDateTimeLocal(initialData.startDateTime));
      setAttachments(initialData.attachments || []);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('personal');
      setReminderInterval('none');
      setStartDateTime('');
      setAttachments([]);
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, attachments: 'File size cannot exceed 5MB.' }));
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAttachment: Attachment = {
          id: crypto.randomUUID(),
          name: file.name,
          data: reader.result as string,
        };
        setAttachments(prev => [...prev, newAttachment]);
        setErrors(prev => {
            const newErrors = {...prev};
            delete newErrors.attachments;
            return newErrors;
        });
      };
      reader.onerror = () => {
        setErrors(prev => ({ ...prev, attachments: 'Failed to read file.' }));
      };
      reader.readAsDataURL(file);
      e.target.value = ''; // Reset file input to allow selecting the same file again
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };
  
  const updateAttachment = (id: string, updatedValues: Partial<Attachment>) => {
    setAttachments(prev => prev.map(att => att.id === id ? { ...att, ...updatedValues } : att));
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = 'Title is required.';
    if (!description.trim()) newErrors.description = 'Description is required.';
    if (!startDateTime) newErrors.startDateTime = 'Start date and time are required.';
    return newErrors;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    onSubmit({ title, description, priority, category, startDateTime: fromDateTimeLocal(startDateTime), reminderInterval, attachments });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 px-6 sm:px-8 pt-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{initialData ? 'Edit Task' : 'Add New Task'}</h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
        <div className="max-h-[75vh] overflow-y-auto px-6 sm:px-8 pb-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Title <span className="text-red-500">*</span></label>
            <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none" />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none" />
            {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Priority</label>
              <select id="priority" value={priority} onChange={e => setPriority(e.target.value as Priority)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none">
                {Object.entries(PRIORITY_CONFIG).map(([key, { label }]) => (<option key={key} value={key}>{label}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Category</label>
              <select id="category" value={category} onChange={e => setCategory(e.target.value as Category)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none">
                {Object.entries(CATEGORY_CONFIG).map(([key, { label }]) => (<option key={key} value={key}>{label}</option>))}
              </select>
            </div>
          </div>
          <div>
              <label htmlFor="startDateTime" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Start Date & Time <span className="text-red-500">*</span></label>
              <input type="datetime-local" id="startDateTime" value={startDateTime} onChange={e => setStartDateTime(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none" />
              {errors.startDateTime && <p className="text-sm text-red-500 mt-1">{errors.startDateTime}</p>}
          </div>
          <div>
            <label htmlFor="reminderInterval" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Task Reminder</label>
            <select id="reminderInterval" value={reminderInterval} onChange={e => setReminderInterval(e.target.value as ReminderInterval)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none">
              {Object.entries(REMINDER_INTERVAL_CONFIG).map(([key, { label }]) => (<option key={key} value={key}>{label}</option>))}
            </select>
          </div>
           <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Attachments (Max 5MB each)</label>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              {attachments.map((att) => (
                <div key={att.id} className="p-3 bg-slate-100 dark:bg-slate-700/80 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm truncate text-slate-700 dark:text-slate-200">
                            <DocumentIcon className="w-5 h-5 flex-shrink-0 text-slate-500" />
                            <span className="truncate" title={att.name}>{att.name}</span>
                        </div>
                        <button type="button" onClick={() => removeAttachment(att.id)} className="p-1 text-slate-500 hover:text-red-500 rounded-full flex-shrink-0">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                             <label htmlFor={`att-expiry-${att.id}`} className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Expiry Date</label>
                            <input type="datetime-local" id={`att-expiry-${att.id}`} value={toDateTimeLocal(att.expiryDate)} onChange={e => updateAttachment(att.id, { expiryDate: fromDateTimeLocal(e.target.value) })} className="w-full p-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none" />
                        </div>
                        <div>
                             <label htmlFor={`att-reminder-${att.id}`} className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Reminder</label>
                            <select id={`att-reminder-${att.id}`} value={att.reminderInterval || 'none'} onChange={e => updateAttachment(att.id, { reminderInterval: e.target.value as ReminderInterval })} className="w-full p-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none">
                                {Object.entries(REMINDER_INTERVAL_CONFIG).map(([key, { label }]) => (<option key={key} value={key}>{label}</option>))}
                            </select>
                        </div>
                    </div>
                </div>
              ))}
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-sky-50 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900 border border-sky-200 dark:border-sky-800 transition">
                <DocumentDuplicateIcon className="w-5 h-5" />
                Add Attachment
              </button>
              {errors.attachments && <p className="text-sm text-red-500 mt-1">{errors.attachments}</p>}
            </div>
        </div>
          <div className="flex justify-end gap-4 p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition">{initialData ? 'Save Changes' : 'Add Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;