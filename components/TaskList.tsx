import React, { useState, useRef } from 'react';
import type { Task } from '../types';
import TaskItem from './TaskItem';
import { InboxIcon } from './Icons';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggle: (task: Task) => void;
  onToggleReminder: (id: string) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
  onPreviewAttachment: (attachment: { name: string; data: string }) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onEdit, onDelete, onToggle, onToggleReminder, onReorder, onPreviewAttachment }) => {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const dragOverIndex = useRef<number | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        // Use a transparent image to hide the default drag preview
        const img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        e.dataTransfer.setDragImage(img, 0, 0);
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        dragOverIndex.current = index;
    };

    const handleDragEnd = () => {
        if (draggedIndex !== null && dragOverIndex.current !== null && draggedIndex !== dragOverIndex.current) {
            onReorder(draggedIndex, dragOverIndex.current);
        }
        setDraggedIndex(null);
        dragOverIndex.current = null;
    };

    if (tasks.length === 0) {
        return (
            <div className="text-center py-16 px-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                <InboxIcon className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-500" />
                <h3 className="mt-4 text-lg font-semibold text-slate-600 dark:text-slate-300">No tasks found.</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Click "Add Task" to get started!
                </p>
            </div>
        );
    }
    
    return (
        <div className="space-y-3">
            {tasks.map((task, index) => (
                <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className={`transition-opacity duration-300 ${draggedIndex === index ? 'opacity-50 scale-105' : 'opacity-100'}`}
                >
                    <TaskItem
                        task={task}
                        onEdit={() => onEdit(task)}
                        onDelete={() => onDelete(task.id)}
                        onToggle={() => onToggle(task)}
                        onToggleReminder={() => onToggleReminder(task.id)}
                        onPreviewAttachment={onPreviewAttachment}
                    />
                </div>
            ))}
        </div>
    );
};

export default TaskList;
