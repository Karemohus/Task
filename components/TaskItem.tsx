import React, { useState, useRef, useEffect } from 'react';
import { format, isWithinInterval, addHours } from 'date-fns';
import type { Task, Attachment, Status } from '../types';
import { PRIORITY_CONFIG, CATEGORY_CONFIG } from '../constants';
import { BellIcon, TrashIcon, PaperClipIcon, BellSlashIcon, CalendarIcon, CheckBadgeIcon, ChatBubbleLeftRightIcon, ClockIcon, Cog6ToothIcon, ArrowPathIcon } from './Icons';
import StatusChanger from './StatusChanger';

interface TaskItemProps {
  task: Task;
  onQuickEdit: (anchorEl: HTMLElement) => void;
  onAdvancedEdit: () => void;
  onUpdate: (id: string, updatedData: Partial<Omit<Task, 'id' | 'status' | 'createdAt'>>) => void;
  onDelete: () => void;
  onStatusChange: (newStatus: Status) => void;
  onToggleReminder: () => void;
  onToggleAttachmentReminder: (taskId: string, attachmentId: string) => void;
  onPreviewAttachment: (attachment: Attachment) => void;
  onRenewAttachment: (attachment: Attachment) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onQuickEdit, onUpdate, onDelete, onStatusChange, onToggleReminder, onToggleAttachmentReminder, onPreviewAttachment, onRenewAttachment }) => {
    const { id, title, description, priority, category, status, attachments, reminderInterval, reminderStartTime, startDateTime, completedAt, completionNotes } = task;

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [currentTitle, setCurrentTitle] = useState(title);
    const titleInputRef = useRef<HTMLInputElement>(null);

    const isReminderActive = !!reminderStartTime;
    const canSetReminder = reminderInterval && reminderInterval !== 'none';

    useEffect(() => {
        if (isEditingTitle && titleInputRef.current) {
            titleInputRef.current.focus();
            titleInputRef.current.select();
        }
    }, [isEditingTitle]);

    const handleTitleSave = () => {
        if (currentTitle.trim() && currentTitle.trim() !== title) {
            onUpdate(id, { title: currentTitle.trim() });
        } else {
            setCurrentTitle(title);
        }
        setIsEditingTitle(false);
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleTitleSave();
        } else if (e.key === 'Escape') {
            setCurrentTitle(title);
            setIsEditingTitle(false);
        }
    };

    return (
        <div className={`
            bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border-l-4
            transition-all duration-200 hover:shadow-md
            ${PRIORITY_CONFIG[priority].ring.replace('ring-', 'border-')}
            ${status === 'done' ? 'opacity-60' : ''}
        `}>
            <div className="flex items-start gap-4">
                <StatusChanger currentStatus={status} onStatusChange={onStatusChange} />
                <div className="flex-grow min-w-0">
                    {isEditingTitle ? (
                        <input
                            ref={titleInputRef}
                            type="text"
                            value={currentTitle}
                            onChange={(e) => setCurrentTitle(e.target.value)}
                            onBlur={handleTitleSave}
                            onKeyDown={handleTitleKeyDown}
                            className={`font-semibold text-lg w-full bg-slate-100 dark:bg-slate-700 rounded-md p-1 -m-1 focus:outline-none focus:ring-2 focus:ring-sky-500 ${status === 'done' ? 'line-through' : ''}`}
                        />
                    ) : (
                        <h4 
                            onClick={() => setIsEditingTitle(true)}
                            className={`font-semibold text-lg text-slate-800 dark:text-slate-100 cursor-pointer ${status === 'done' ? 'line-through' : ''}`}
                        >
                            {title}
                        </h4>
                    )}
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {description}
                    </p>
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-3 text-xs">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${PRIORITY_CONFIG[priority].color}`}>
                            {PRIORITY_CONFIG[priority].label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-medium ${CATEGORY_CONFIG[category].color}`}>
                            {CATEGORY_CONFIG[category].label}
                        </span>
                    </div>
                     <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-3 text-xs text-slate-500 dark:text-slate-400">
                        {startDateTime && (
                            <div className="flex items-center gap-1.5" title="Start date">
                                <CalendarIcon className="w-4 h-4" />
                                <span>Starts: {format(new Date(startDateTime), 'MMM d, p')}</span>
                            </div>
                        )}
                        {completedAt && status === 'done' && (
                            <div className="flex items-center gap-1.5" title="Completion date">
                                <CheckBadgeIcon className="w-4 h-4 text-green-500" />
                                <span className="text-green-600 dark:text-green-400">Completed: {format(new Date(completedAt), 'MMM d, p')}</span>
                            </div>
                        )}
                    </div>
                    {completionNotes && status === 'done' && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex items-start gap-2.5">
                                <ChatBubbleLeftRightIcon className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                                    {completionNotes}
                                </p>
                            </div>
                        </div>
                    )}
                    {attachments && attachments.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                            {attachments.map((att) => {
                                const isAttReminderActive = !!att.reminderStartTime;
                                const canSetAttReminder = att.reminderInterval && att.reminderInterval !== 'none';
                                const isExpiringSoon = att.expiryDate ? isWithinInterval(new Date(att.expiryDate), { start: new Date(), end: addHours(new Date(), 24) }) : false;

                                return (
                                <div key={att.id} className="flex items-center justify-between gap-2 p-2 rounded-md bg-slate-50 dark:bg-slate-700/50">
                                    <button
                                        onClick={() => onPreviewAttachment(att)}
                                        className="inline-flex items-center gap-2 text-sm text-sky-600 dark:text-sky-400 hover:underline flex-grow min-w-0"
                                        title={`Preview ${att.name}`}
                                    >
                                        <PaperClipIcon className="w-4 h-4 flex-shrink-0" />
                                        <span className="truncate">{att.name}</span>
                                    </button>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                    {task.status === 'recurring' && att.expiryDate && (
                                        <button onClick={() => onRenewAttachment(att)} className="flex items-center gap-1 text-xs px-2 py-1 bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300 rounded-md hover:bg-sky-200 dark:hover:bg-sky-800 transition">
                                            <ArrowPathIcon className="w-3 h-3" />
                                            Renew
                                        </button>
                                    )}
                                    {att.expiryDate && (
                                        <div className={`flex items-center gap-1.5 text-xs ${isExpiringSoon ? 'text-yellow-600 dark:text-yellow-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`} title={`Expires: ${format(new Date(att.expiryDate), 'MMM d, p')}`}>
                                            <ClockIcon className="w-4 h-4" />
                                            <span>{format(new Date(att.expiryDate), 'MMM d')}</span>
                                        </div>
                                    )}
                                    <button 
                                      onClick={() => onToggleAttachmentReminder(task.id, att.id)} 
                                      disabled={!canSetAttReminder}
                                      className="p-1 text-slate-500 rounded-full transition disabled:opacity-30 disabled:cursor-not-allowed"
                                      aria-label={isAttReminderActive ? 'Stop attachment reminder' : 'Start attachment reminder'}
                                      title={!canSetAttReminder ? 'Set a reminder interval to enable' : (isAttReminderActive ? 'Stop reminder' : 'Start reminder')}
                                    >
                                      {isAttReminderActive ? (
                                        <BellIcon className="w-4 h-4 text-sky-500" />
                                      ) : (
                                        <BellSlashIcon className="w-4 h-4 hover:text-sky-500" />
                                      )}
                                    </button>
                                    </div>
                                </div>
                            )})}
                        </div>
                    )}
                </div>
                <div className="flex-shrink-0 flex items-center gap-1">
                    <button 
                      onClick={onToggleReminder} 
                      disabled={!canSetReminder}
                      className="p-2 text-slate-500 rounded-full transition disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label={isReminderActive ? 'Stop task reminder' : 'Start task reminder'}
                      title={!canSetReminder ? 'Set a reminder interval to enable' : (isReminderActive ? 'Stop reminder' : 'Start reminder')}
                    >
                      {isReminderActive ? (
                        <BellIcon className="w-5 h-5 text-sky-500" />
                      ) : (
                        <BellSlashIcon className="w-5 h-5 hover:text-sky-500" />
                      )}
                    </button>
                    <button onClick={(e) => onQuickEdit(e.currentTarget)} className="p-2 text-slate-500 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition" aria-label="Quick edit task">
                        <Cog6ToothIcon className="w-5 h-5" />
                    </button>
                    <button onClick={onDelete} className="p-2 text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition" aria-label="Delete task">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskItem;