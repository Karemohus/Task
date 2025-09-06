
import type { Priority, Category, ReminderInterval } from './types';

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; ring: string }> = {
  low: { label: 'Low', color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300', ring: 'ring-green-500' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300', ring: 'ring-yellow-500' },
  high: { label: 'High', color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300', ring: 'ring-red-500' },
};

export const CATEGORY_CONFIG: Record<Category, { label: string; color: string }> = {
  personal: { label: 'Personal', color: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300' },
  work: { label: 'Work', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300' },
  custom: { label: 'Custom', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' },
};

export const STATUS_CONFIG = {
  todo: { label: 'To Do', color: 'text-slate-500' },
  done: { label: 'Done', color: 'text-green-500' },
};

export const REMINDER_INTERVAL_CONFIG: Record<ReminderInterval, { label: string }> = {
    'none': { label: 'None' },
    '1m': { label: 'Every minute' },
    '5m': { label: 'Every 5 minutes' },
    '10m': { label: 'Every 10 minutes' },
    '1h': { label: 'Every hour' },
};
