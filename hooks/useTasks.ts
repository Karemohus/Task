import { useState, useEffect, useCallback } from 'react';
import type { Task, Filters } from '../types';

const TASKS_STORAGE_KEY = 'todoAppTasks';
const LAST_REMINDER_TIMESTAMPS_STORAGE_KEY = 'todoAppLastReminderTimestamps';

const getInitialTasks = (): Task[] => {
    try {
        const item = window.localStorage.getItem(TASKS_STORAGE_KEY);
        const tasksFromStorage = item ? JSON.parse(item) : [];

        // Ad-hoc migration for tasks from old formats.
        return tasksFromStorage.map((task: any) => {
            // Remove deprecated dueDateTime/dueDate properties
            if (task.dueDate) delete task.dueDate;
            if (task.dueDateTime) delete task.dueDateTime;
            
            // Ensure reminderStartTime exists
            if (typeof task.reminderStartTime === 'undefined') {
                 task.reminderStartTime = null;
            }
            // Ensure startDateTime exists
            if (typeof task.startDateTime === 'undefined') {
                task.startDateTime = null;
            }
            // Ensure completedAt exists
            if (typeof task.completedAt === 'undefined') {
                task.completedAt = null;
            }
            // Ensure completionNotes exists
            if (typeof task.completionNotes === 'undefined') {
                task.completionNotes = undefined;
            }
            return task;
        });
    } catch (error) {
        console.error('Error reading tasks from localStorage', error);
        return [];
    }
};

export const useTasks = () => {
    const [tasks, setTasks] = useState<Task[]>(getInitialTasks);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<Filters>({
        status: 'all',
        category: 'all',
        priority: 'all',
        hasNotes: false,
    });
    const [taskToRemind, setTaskToRemind] = useState<Task | null>(null);

    useEffect(() => {
        try {
            window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
        } catch (error) {
            console.error('Error saving tasks to localStorage', error);
        }
    }, [tasks]);

    useEffect(() => {
        const checkReminders = () => {
            if (taskToRemind) return; // Don't show a new reminder if one is already displayed

            const now = new Date();
            let lastReminderTimestamps: Record<string, number> = {};
            try {
                lastReminderTimestamps = JSON.parse(window.localStorage.getItem(LAST_REMINDER_TIMESTAMPS_STORAGE_KEY) || '{}');
            } catch (error) {
                console.error('Error reading reminder timestamps from localStorage', error);
            }

            const taskForReminder = tasks.find(task => {
                if (task.status !== 'todo' || !task.reminderInterval || task.reminderInterval === 'none' || !task.reminderStartTime) {
                    return false;
                }

                const intervalMilliseconds = {
                    '1m': 60 * 1000,
                    '5m': 5 * 60 * 1000,
                    '10m': 10 * 60 * 1000,
                    '1h': 60 * 60 * 1000,
                }[task.reminderInterval];
                
                if (!intervalMilliseconds) return false;

                const lastReminderTime = lastReminderTimestamps[task.id] || task.reminderStartTime;

                return now.getTime() - lastReminderTime >= intervalMilliseconds;
            });

            if (taskForReminder) {
                setTaskToRemind(taskForReminder);
                lastReminderTimestamps[taskForReminder.id] = now.getTime();
                window.localStorage.setItem(LAST_REMINDER_TIMESTAMPS_STORAGE_KEY, JSON.stringify(lastReminderTimestamps));
            }
        };

        const intervalId = setInterval(checkReminders, 5000); // Check every 5 seconds for better accuracy
        checkReminders(); // Run once on load

        return () => clearInterval(intervalId);
    }, [tasks, taskToRemind]);

    const dismissReminder = useCallback(() => {
        setTaskToRemind(null);
    }, []);

    const cleanUpReminderTimestamp = (id: string) => {
        try {
            const timestamps: Record<string, number> = JSON.parse(window.localStorage.getItem(LAST_REMINDER_TIMESTAMPS_STORAGE_KEY) || '{}');
            if (timestamps[id]) {
                delete timestamps[id];
                window.localStorage.setItem(LAST_REMINDER_TIMESTAMPS_STORAGE_KEY, JSON.stringify(timestamps));
            }
        } catch (error) {
            console.error('Error cleaning up reminder timestamps from localStorage', error);
        }
    };

    const addTask = useCallback((taskData: Omit<Task, 'id' | 'status' | 'createdAt' | 'reminderStartTime' | 'completedAt'>) => {
        const newTask: Task = {
            id: crypto.randomUUID(),
            status: 'todo',
            createdAt: Date.now(),
            reminderStartTime: null,
            completedAt: null,
            completionNotes: undefined,
            ...taskData,
        };
        setTasks(prevTasks => [newTask, ...prevTasks]);
    }, []);

    const updateTask = useCallback((id: string, updatedData: Partial<Omit<Task, 'id' | 'status' | 'createdAt'>>) => {
        setTasks(prevTasks =>
            prevTasks.map(task => {
                if (task.id === id) {
                    const wasReminderActive = task.reminderStartTime !== null;
                    const isIntervalBeingDisabled = updatedData.reminderInterval === 'none';
                    
                    const updatedTask = { ...task, ...updatedData };

                    // If reminder is turned off or was active and is being turned off, stop it.
                    if (isIntervalBeingDisabled && wasReminderActive) {
                       updatedTask.reminderStartTime = null;
                       cleanUpReminderTimestamp(id);
                    }
                    return updatedTask;
                }
                return task;
            })
        );
    }, []);

    const deleteTask = useCallback((id: string) => {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
        cleanUpReminderTimestamp(id);
    }, []);

    const toggleTaskStatus = useCallback((id: string, notes?: string) => {
        setTasks(prevTasks =>
            prevTasks.map(task => {
                if (task.id === id) {
                    const newStatus = task.status === 'todo' ? 'done' : 'todo';
                    if (newStatus === 'done') {
                        // Clean up reminder if task is marked done
                        cleanUpReminderTimestamp(id);
                        return { 
                            ...task, 
                            status: newStatus, 
                            reminderStartTime: null, 
                            completedAt: Date.now(),
                            completionNotes: notes || undefined
                        };
                    }
                     // Resetting to 'todo'
                    return { ...task, status: newStatus, completedAt: null, completionNotes: undefined };
                }
                return task;
            })
        );
    }, []);

    const toggleReminder = useCallback((id: string) => {
        setTasks(prevTasks =>
            prevTasks.map(task => {
                if (task.id === id) {
                    if (task.reminderStartTime) {
                        // Reminder is active, so stop it
                        cleanUpReminderTimestamp(id);
                        return { ...task, reminderStartTime: null };
                    } else {
                        // Reminder is inactive, so start it
                        return { ...task, reminderStartTime: Date.now() };
                    }
                }
                return task;
            })
        );
    }, []);

    const reorderTasks = useCallback((startIndex: number, endIndex: number) => {
        setTasks(prevTasks => {
            const result = Array.from(prevTasks);
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);
            return result;
        });
    }, []);

    return {
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        toggleReminder,
        reorderTasks,
        filters,
        setFilters,
        searchTerm,
        setSearchTerm,
        taskToRemind,
        dismissReminder,
    };
};