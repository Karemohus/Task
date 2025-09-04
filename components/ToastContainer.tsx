
import React from 'react';
import { useToast } from '../hooks/useToast';
import type { ToastType } from '../types';
import { CheckCircleIcon, XMarkIcon } from './Icons';

const toastConfig: Record<ToastType, { bg: string; icon: React.ReactNode }> = {
    success: {
        bg: 'bg-green-500',
        icon: <CheckCircleIcon className="w-6 h-6 text-white" />
    },
    error: {
        bg: 'bg-red-500',
        icon: <XMarkIcon className="w-6 h-6 text-white" />
    },
    info: {
        bg: 'bg-sky-500',
        icon: <CheckCircleIcon className="w-6 h-6 text-white" />
    }
};

const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed bottom-0 right-0 p-4 space-y-2 w-full max-w-xs z-50">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`
                        flex items-center gap-4 p-4 rounded-lg shadow-lg text-white
                        ${toastConfig[toast.type].bg}
                        animate-fade-in-up
                    `}
                >
                    {toastConfig[toast.type].icon}
                    <span className="flex-grow">{toast.message}</span>
                    <button onClick={() => removeToast(toast.id)} className="p-1 rounded-full hover:bg-white/20">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
