import React, { useState, useRef, useEffect } from 'react';
import type { Status } from '../types';
import { STATUS_CONFIG } from '../constants';

interface StatusChangerProps {
    currentStatus: Status;
    onStatusChange: (newStatus: Status) => void;
}

const StatusChanger: React.FC<StatusChangerProps> = ({ currentStatus, onStatusChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const Icon = STATUS_CONFIG[currentStatus].icon;
    const color = STATUS_CONFIG[currentStatus].color;

    const handleStatusSelect = (newStatus: Status) => {
        onStatusChange(newStatus);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={wrapperRef} className="relative mt-1 flex-shrink-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-1 rounded-full transition-colors duration-200 ${isOpen ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label={`Current status: ${STATUS_CONFIG[currentStatus].label}. Click to change.`}
            >
                <Icon className={`w-6 h-6 ${color} transition-colors`} />
            </button>
            {isOpen && (
                <div 
                    className="absolute z-20 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5"
                    role="menu"
                    aria-orientation="vertical"
                >
                    <div className="py-1" role="none">
                        {(Object.keys(STATUS_CONFIG) as Status[]).map((statusKey) => {
                            const { label, icon: StatusIcon, color: statusColor } = STATUS_CONFIG[statusKey];
                            return (
                                <button
                                    key={statusKey}
                                    onClick={() => handleStatusSelect(statusKey)}
                                    className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                                    role="menuitem"
                                >
                                    <StatusIcon className={`w-5 h-5 ${statusColor}`} />
                                    <span>{label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatusChanger;
