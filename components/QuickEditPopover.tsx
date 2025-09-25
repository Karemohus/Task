import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import type { Task, Priority, Category } from '../types';
import { PRIORITY_CONFIG, CATEGORY_CONFIG } from '../constants';
import { XMarkIcon } from './Icons';

interface QuickEditPopoverProps {
    task: Task;
    anchorEl: HTMLElement;
    onClose: () => void;
    onUpdate: (id: string, updatedData: Partial<Omit<Task, 'id' | 'status' | 'createdAt'>>) => void;
    onAdvancedEdit: () => void;
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

const QuickEditPopover: React.FC<QuickEditPopoverProps> = ({ task, anchorEl, onClose, onUpdate, onAdvancedEdit }) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    const [priority, setPriority] = useState(task.priority);
    const [category, setCategory] = useState(task.category);
    const [startDateTime, setStartDateTime] = useState(toDateTimeLocal(task.startDateTime));
    
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        const calculatePosition = () => {
            if (anchorEl && popoverRef.current) {
                const anchorRect = anchorEl.getBoundingClientRect();
                const popoverRect = popoverRef.current.getBoundingClientRect();
                
                let top = anchorRect.bottom + window.scrollY + 8;
                let left = anchorRect.right - popoverRect.width;

                // Adjust if it overflows the viewport
                if (top + popoverRect.height > window.innerHeight + window.scrollY) {
                    top = anchorRect.top + window.scrollY - popoverRect.height - 8;
                }
                if (left < 0) {
                    left = anchorRect.left;
                }
                
                setPosition({ top, left });
            }
        };

        calculatePosition();
        
        // Recalculate on window resize
        window.addEventListener('resize', calculatePosition);
        return () => window.removeEventListener('resize', calculatePosition);

    }, [anchorEl]);


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        const handleClickOutside = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node) && !anchorEl.contains(e.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose, anchorEl]);

    const handleUpdate = () => {
        const updatedData: Partial<Task> = {};
        if (priority !== task.priority) updatedData.priority = priority;
        if (category !== task.category) updatedData.category = category;
        
        const newTimestamp = fromDateTimeLocal(startDateTime);
        if (newTimestamp !== (task.startDateTime || null)) {
            updatedData.startDateTime = newTimestamp;
        }

        if (Object.keys(updatedData).length > 0) {
            onUpdate(task.id, updatedData);
        }
    };

    // Auto-save when a value changes
    useEffect(() => {
        handleUpdate();
    }, [priority, category, startDateTime]);

    return ReactDOM.createPortal(
        <div
            ref={popoverRef}
            style={{ top: position.top, left: position.left, opacity: position.top === 0 ? 0 : 1 }}
            className="absolute z-40 bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-80 transform transition-opacity"
            onClick={e => e.stopPropagation()}
        >
            <div className="flex justify-between items-center px-4 pt-4 pb-2">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Quick Edit</h3>
                <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="p-4 space-y-4">
                 <div>
                    <label htmlFor="quick-priority" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Priority</label>
                    <select id="quick-priority" value={priority} onChange={e => setPriority(e.target.value as Priority)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none">
                        {Object.entries(PRIORITY_CONFIG).map(([key, { label }]) => (<option key={key} value={key}>{label}</option>))}
                    </select>
                </div>
                <div>
                    <label htmlFor="quick-category" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Category</label>
                    <select id="quick-category" value={category} onChange={e => setCategory(e.target.value as Category)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none">
                        {Object.entries(CATEGORY_CONFIG).map(([key, { label }]) => (<option key={key} value={key}>{label}</option>))}
                    </select>
                </div>
                 <div>
                    <label htmlFor="quick-startDateTime" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Start Date & Time</label>
                    <input type="datetime-local" id="quick-startDateTime" value={startDateTime} onChange={e => setStartDateTime(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none" />
                </div>
            </div>
             <div className="px-4 pb-4">
                <button onClick={onAdvancedEdit} className="w-full px-4 py-2 text-sm bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition">
                    Advanced Edit...
                </button>
            </div>
        </div>,
        document.body
    );
};

export default QuickEditPopover;
