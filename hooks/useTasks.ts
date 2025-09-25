import { useState, useEffect, useCallback } from 'react';
import type { Task, Filters, Attachment, Status } from '../types';

const TASKS_STORAGE_KEY = 'todoAppTasks';
const LAST_REMINDER_TIMESTAMPS_STORAGE_KEY = 'todoAppLastReminderTimestamps';
const LAST_ATTACHMENT_REMINDER_TIMESTAMPS_STORAGE_KEY = 'todoAppLastAttachmentReminderTimestamps';

const getInitialTasks = (): Task[] => {
    try {
        const item = window.localStorage.getItem(TASKS_STORAGE_KEY);
        const tasksFromStorage = item ? JSON.parse(item) : [];

        // Ad-hoc migration for tasks from old formats.
        return tasksFromStorage.map((task: any) => {
            if (task.dueDate) delete task.dueDate;
            if (task.dueDateTime) delete task.dueDateTime;
            if (typeof task.reminderStartTime === 'undefined') task.reminderStartTime = null;
            if (typeof task.startDateTime === 'undefined') task.startDateTime = null;
            if (typeof task.completedAt === 'undefined') task.completedAt = null;
            if (typeof task.completionNotes === 'undefined') task.completionNotes = undefined;
            if (typeof task.status === 'undefined') task.status = 'todo'; // Add status for old tasks


            // Migrate single attachment to attachments array
            if (task.attachment && !task.attachments) {
                task.attachments = [{
                    id: crypto.randomUUID(),
                    name: task.attachment.name,
                    data: task.attachment.data,
                    expiryDate: null,
                    reminderInterval: 'none',
                    reminderStartTime: null,
                }];
                delete task.attachment;
            }
            if (typeof task.attachments === 'undefined') {
                task.attachments = [];
            } else {
                // Ensure attachments have all required fields from new model
                task.attachments = task.attachments.map((att: any) => ({
                    ...att,
                    id: att.id || crypto.randomUUID(),
                    expiryDate: att.expiryDate === undefined ? null : att.expiryDate,
                    reminderInterval: att.reminderInterval || 'none',
                    reminderStartTime: att.reminderStartTime === undefined ? null : att.reminderStartTime,
                }));
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
    const [attachmentToRemind, setAttachmentToRemind] = useState<{ task: Task, attachment: Attachment } | null>(null);

    useEffect(() => {
        try {
            window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
        } catch (error) {
            console.error('Error saving tasks to localStorage', error);
        }
    }, [tasks]);

    useEffect(() => {
        const checkReminders = () => {
            const now = new Date();

            // Task Reminders
            if (!taskToRemind && !attachmentToRemind) {
                let lastReminderTimestamps: Record<string, number> = {};
                try {
                    lastReminderTimestamps = JSON.parse(window.localStorage.getItem(LAST_REMINDER_TIMESTAMPS_STORAGE_KEY) || '{}');
                } catch (error) { console.error('Error reading reminder timestamps', error); }

                const taskForReminder = tasks.find(task => {
                    if (task.status !== 'todo' || !task.reminderInterval || task.reminderInterval === 'none' || !task.reminderStartTime) return false;
                    const intervalMilliseconds = { '1m': 60000, '5m': 300000, '10m': 600000, '1h': 3600000 }[task.reminderInterval];
                    if (!intervalMilliseconds) return false;
                    const lastReminderTime = lastReminderTimestamps[task.id] || task.reminderStartTime;
                    return now.getTime() - lastReminderTime >= intervalMilliseconds;
                });

                if (taskForReminder) {
                    setTaskToRemind(taskForReminder);
                    lastReminderTimestamps[taskForReminder.id] = now.getTime();
                    window.localStorage.setItem(LAST_REMINDER_TIMESTAMPS_STORAGE_KEY, JSON.stringify(lastReminderTimestamps));
                    return; // Show one reminder at a time
                }
            }

            // Attachment Reminders
            if (!taskToRemind && !attachmentToRemind) {
                 let lastAttachmentReminderTimestamps: Record<string, number> = {};
                 try {
                     lastAttachmentReminderTimestamps = JSON.parse(window.localStorage.getItem(LAST_ATTACHMENT_REMINDER_TIMESTAMPS_STORAGE_KEY) || '{}');
                 } catch (error) { console.error('Error reading attachment reminder timestamps', error); }

                 for (const task of tasks) {
                    if (task.status !== 'todo' || !task.attachments) continue;
                    for (const attachment of task.attachments) {
                        if (!attachment.reminderInterval || attachment.reminderInterval === 'none' || !attachment.reminderStartTime) continue;
                        const intervalMilliseconds = { '1m': 60000, '5m': 300000, '10m': 600000, '1h': 3600000 }[attachment.reminderInterval];
                        if (!intervalMilliseconds) continue;
                        const lastReminderTime = lastAttachmentReminderTimestamps[attachment.id] || attachment.reminderStartTime;
                        
                        if (now.getTime() - lastReminderTime >= intervalMilliseconds) {
                            setAttachmentToRemind({ task, attachment });
                            lastAttachmentReminderTimestamps[attachment.id] = now.getTime();
                            window.localStorage.setItem(LAST_ATTACHMENT_REMINDER_TIMESTAMPS_STORAGE_KEY, JSON.stringify(lastAttachmentReminderTimestamps));
                            return; // Found a reminder, exit
                        }
                    }
                 }
            }
        };

        const intervalId = setInterval(checkReminders, 5000);
        checkReminders();

        return () => clearInterval(intervalId);
    }, [tasks, taskToRemind, attachmentToRemind]);

    const dismissReminder = useCallback(() => setTaskToRemind(null), []);
    const dismissAttachmentReminder = useCallback(() => setAttachmentToRemind(null), []);

    const cleanUpTimestamps = (storageKey: string, id: string) => {
        try {
            const timestamps: Record<string, number> = JSON.parse(window.localStorage.getItem(storageKey) || '{}');
            if (timestamps[id]) {
                delete timestamps[id];
                window.localStorage.setItem(storageKey, JSON.stringify(timestamps));
            }
        } catch (error) { console.error('Error cleaning up timestamps', error); }
    };

    const cleanUpTaskReminderTimestamp = (id: string) => cleanUpTimestamps(LAST_REMINDER_TIMESTAMPS_STORAGE_KEY, id);
    const cleanUpAttachmentReminderTimestamp = (id: string) => cleanUpTimestamps(LAST_ATTACHMENT_REMINDER_TIMESTAMPS_STORAGE_KEY, id);


    const addTask = useCallback((taskData: Omit<Task, 'id' | 'status' | 'createdAt' | 'reminderStartTime' | 'completedAt'>) => {
        const newTask: Task = {
            id: crypto.randomUUID(),
            status: 'todo',
            createdAt: Date.now(),
            reminderStartTime: null,
            completedAt: null,
            completionNotes: undefined,
            ...taskData,
            attachments: taskData.attachments?.map(att => ({ ...att, reminderStartTime: null })) || [],
        };
        setTasks(prevTasks => [newTask, ...prevTasks]);
    }, []);

    const updateTask = useCallback((id: string, updatedData: Partial<Omit<Task, 'id' | 'status' | 'createdAt'>>) => {
        setTasks(prevTasks =>
            prevTasks.map(task => {
                if (task.id === id) {
                    const originalTask = prevTasks.find(t => t.id === id);
                    const wasReminderActive = task.reminderStartTime !== null;
                    const isIntervalBeingDisabled = updatedData.reminderInterval === 'none';
                    
                    const updatedTask = { ...task, ...updatedData };

                    if (isIntervalBeingDisabled && wasReminderActive) {
                       updatedTask.reminderStartTime = null;
                       cleanUpTaskReminderTimestamp(id);
                    }

                    // Handle attachment reminder cleanup
                    if (updatedData.attachments && originalTask?.attachments) {
                        const removedAttachmentIds = originalTask.attachments
                            .filter(originalAtt => !updatedData.attachments!.some(updatedAtt => updatedAtt.id === originalAtt.id))
                            .map(att => att.id);
                        removedAttachmentIds.forEach(cleanUpAttachmentReminderTimestamp);

                        // Handle attachments being turned off
                        updatedTask.attachments = updatedTask.attachments?.map(att => {
                            const originalAtt = originalTask.attachments?.find(oa => oa.id === att.id);
                            if (originalAtt && originalAtt.reminderInterval !== 'none' && att.reminderInterval === 'none') {
                                cleanUpAttachmentReminderTimestamp(att.id);
                                return { ...att, reminderStartTime: null };
                            }
                            return att;
                        });
                    }
                    
                    return updatedTask;
                }
                return task;
            })
        );
    }, []);

    const deleteTask = useCallback((id: string) => {
        const taskToDelete = tasks.find(task => task.id === id);
        if (taskToDelete) {
            cleanUpTaskReminderTimestamp(id);
            taskToDelete.attachments?.forEach(att => cleanUpAttachmentReminderTimestamp(att.id));
        }
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    }, [tasks]);

    const changeTaskStatus = useCallback((id: string, newStatus: Status, notes?: string) => {
        setTasks(prevTasks =>
            prevTasks.map(task => {
                if (task.id === id) {
                    const wasDone = task.status === 'done';
                    const isNowDone = newStatus === 'done';

                    const updatedTask = { ...task, status: newStatus };

                    if (isNowDone && !wasDone) {
                        // Task is being completed
                        cleanUpTaskReminderTimestamp(id);
                        task.attachments?.forEach(att => cleanUpAttachmentReminderTimestamp(att.id));
                        updatedTask.reminderStartTime = null;
                        updatedTask.attachments = task.attachments?.map(att => ({...att, reminderStartTime: null})) || [];
                        updatedTask.completedAt = Date.now();
                        updatedTask.completionNotes = notes || undefined;
                    } else if (!isNowDone && wasDone) {
                        // Task is being moved out of 'done' state
                        updatedTask.completedAt = null;
                        updatedTask.completionNotes = undefined;
                    }
                    
                    return updatedTask;
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
                        cleanUpTaskReminderTimestamp(id);
                        return { ...task, reminderStartTime: null };
                    } else {
                        return { ...task, reminderStartTime: Date.now() };
                    }
                }
                return task;
            })
        );
    }, []);
    
    const toggleAttachmentReminder = useCallback((taskId: string, attachmentId: string) => {
        setTasks(prevTasks =>
            prevTasks.map(task => {
                if (task.id === taskId && task.attachments) {
                    const newAttachments = task.attachments.map(att => {
                        if (att.id === attachmentId) {
                            if (att.reminderStartTime) {
                                cleanUpAttachmentReminderTimestamp(att.id);
                                return { ...att, reminderStartTime: null };
                            } else {
                                return { ...att, reminderStartTime: Date.now() };
                            }
                        }
                        return att;
                    });
                    return { ...task, attachments: newAttachments };
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
        changeTaskStatus,
        toggleReminder,
        toggleAttachmentReminder,
        reorderTasks,
        filters,
        setFilters,
        searchTerm,
        setSearchTerm,
        taskToRemind,
        dismissReminder,
        attachmentToRemind,
        dismissAttachmentReminder
    };
};