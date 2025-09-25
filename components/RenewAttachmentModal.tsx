import React, { useState, useRef } from 'react';
import type { Task, Attachment } from '../types';
import { XMarkIcon, DocumentDuplicateIcon, ArrowPathIcon } from './Icons';

interface RenewAttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (attachmentId: string, newFileData: { data: string; name: string }, newExpiryDate: number | null) => void;
  task: Task;
  attachment: Attachment;
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

const RenewAttachmentModal: React.FC<RenewAttachmentModalProps> = ({ isOpen, onClose, onSubmit, task, attachment }) => {
  const [newFile, setNewFile] = useState<{ data: string, name: string } | null>(null);
  const [newExpiryDate, setNewExpiryDate] = useState(toDateTimeLocal(attachment.expiryDate));
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size cannot exceed 5MB.');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewFile({
          name: file.name,
          data: reader.result as string,
        });
        setError(null);
      };
      reader.onerror = () => {
        setError('Failed to read file.');
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFile) {
      setError('Please select a new file to upload.');
      return;
    }
    onSubmit(attachment.id, newFile, fromDateTimeLocal(newExpiryDate));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose} aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8 transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <ArrowPathIcon className="w-7 h-7 text-sky-500" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Renew Attachment</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full" aria-label="Close">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="my-6 space-y-2">
            <p className="text-slate-600 dark:text-slate-400">Renewing attachment <strong className="text-slate-800 dark:text-slate-200">{attachment.name}</strong> for task <strong className="text-slate-800 dark:text-slate-200">{task.title}</strong>.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">New Attachment File <span className="text-red-500">*</span></label>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-sky-50 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900 border border-sky-200 dark:border-sky-800 transition">
                    <DocumentDuplicateIcon className="w-5 h-5" />
                    {newFile ? <span className="truncate">{newFile.name}</span> : 'Select File (Max 5MB)'}
                </button>
            </div>
            <div>
              <label htmlFor="expiryDateTime" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">New Expiry Date & Time</label>
              <input type="datetime-local" id="expiryDateTime" value={newExpiryDate} onChange={e => setNewExpiryDate(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
            <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition"
            >
                Cancel
            </button>
            <button
                type="submit"
                className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition"
            >
                Save Renewal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenewAttachmentModal;