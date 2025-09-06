import React from 'react';
import type { Task } from '../types';
import { PRIORITY_CONFIG, CATEGORY_CONFIG } from '../constants';
import { CalendarIcon, PencilIcon, TrashIcon, CheckCircleIcon, CircleIcon, PaperClipIcon } from './Icons';
import { format, isPast, isToday } from 'date-fns';

interface TaskItemProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, onDelete, onToggle }) => {
    const { title, description, dueDate, priority, category, status, attachment } = task;

    const formattedDate = format(new Date(dueDate), 'MMM dd, yyyy');
    const isOverdue = isPast(new Date(dueDate)) && !isToday(new Date(dueDate)) && status === 'todo';

    const dateColorClass = isOverdue ? 'text-red-500' : 'text-slate-500 dark:text-slate-400';

    return (
        <div className={`
            bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border-l-4
            transition-all duration-200 hover:shadow-md
            ${PRIORITY_CONFIG[priority].ring.replace('ring-', 'border-')}
            ${status === 'done' ? 'opacity-60' : ''}
        `}>
            <div className="flex items-start gap-4">
                <button onClick={onToggle} className="mt-1 flex-shrink-0">
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
                        <span className={`flex items-center gap-1.5 ${dateColorClass}`}>
                            <CalendarIcon className="w-4 h-4" />
                            {formattedDate} {isOverdue && "(Overdue)"}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-medium ${PRIORITY_CONFIG[priority].color}`}>
                            {PRIORITY_CONFIG[priority].label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-medium ${CATEGORY_CONFIG[category].color}`}>
                            {CATEGORY_CONFIG[category].label}
                        </span>
                    </div>
                    {attachment && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                            <a
                                href={attachment.data}
                                download={attachment.name}
                                className="inline-flex items-center gap-2 text-sm text-sky-600 dark:text-sky-400 hover:underline"
                                title={`Download ${attachment.name}`}
                            >
                                <PaperClipIcon className="w-4 h-4" />
                                <span className="truncate max-w-[200px] sm:max-w-xs">{attachment.name}</span>
                            </a>
                        </div>
                    )}
                </div>
                <div className="flex-shrink-0 flex items-center gap-1">
                    <button onClick={onEdit} className="p-2 text-slate-500 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition">
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button onClick={onDelete} className="p-2 text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskItem;
