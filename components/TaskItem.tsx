import React from 'react';
import { format } from 'date-fns';
import type { Task } from '../types';
import { PRIORITY_CONFIG, CATEGORY_CONFIG } from '../constants';
import { BellIcon, PencilIcon, TrashIcon, CheckCircleIcon, CircleIcon, PaperClipIcon, BellSlashIcon, CalendarIcon, CheckBadgeIcon, ChatBubbleLeftRightIcon } from './Icons';

interface TaskItemProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  onToggleReminder: () => void;
  onPreviewAttachment: (attachment: { name: string; data: string }) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, onDelete, onToggle, onToggleReminder, onPreviewAttachment }) => {
    const { title, description, priority, category, status, attachment, reminderInterval, reminderStartTime, startDateTime, completedAt, completionNotes } = task;

    const isReminderActive = !!reminderStartTime;
    const canSetReminder = reminderInterval && reminderInterval !== 'none';

    return (
        <div className={`
            bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border-l-4
            transition-all duration-200 hover:shadow-md
            ${PRIORITY_CONFIG[priority].ring.replace('ring-', 'border-')}
            ${status === 'done' ? 'opacity-60' : ''}
        `}>
            <div className="flex items-start gap-4">
                <button onClick={onToggle} className="mt-1 flex-shrink-0" aria-label={status === 'done' ? 'Mark as to-do' : 'Mark as done'}>
                    {status === 'done' ? (
                        <CheckCircleIcon className="w-6 h-6 text-green-500" />
                    ) : (
                        <CircleIcon className="w-6 h-6 text-slate-300 dark:text-slate-600 hover:text-sky-500 transition" />
                    )}
                </button>
                <div className="flex-grow">
                    <h4 className={`font-semibold text-lg text-slate-800 dark:text-slate-100 ${status === 'done' ? 'line-through' : ''}`}>
                        {title}
                    </h4>
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
                    {attachment && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                            <button
                                onClick={() => onPreviewAttachment(attachment)}
                                className="inline-flex items-center gap-2 text-sm text-sky-600 dark:text-sky-400 hover:underline"
                                title={`Preview ${attachment.name}`}
                            >
                                <PaperClipIcon className="w-4 h-4" />
                                <span className="truncate max-w-[200px] sm:max-w-xs">{attachment.name}</span>
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex-shrink-0 flex items-center gap-1">
                    <button 
                      onClick={onToggleReminder} 
                      disabled={!canSetReminder}
                      className="p-2 text-slate-500 rounded-full transition disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label={isReminderActive ? 'Stop reminder' : 'Start reminder'}
                      title={!canSetReminder ? 'Set a reminder interval to enable' : (isReminderActive ? 'Stop reminder' : 'Start reminder')}
                    >
                      {isReminderActive ? (
                        <BellIcon className="w-5 h-5 text-sky-500" />
                      ) : (
                        <BellSlashIcon className="w-5 h-5 hover:text-sky-500" />
                      )}
                    </button>
                    <button onClick={onEdit} className="p-2 text-slate-500 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition" aria-label="Edit task">
                        <PencilIcon className="w-5 h-5" />
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
