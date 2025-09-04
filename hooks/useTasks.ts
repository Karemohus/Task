
import { useState, useEffect, useCallback } from 'react';
import type { Task, Filters } from '../types';

const TASKS_STORAGE_KEY = 'todoAppTasks';

const getInitialTasks = (): Task[] => {
    try {
        const item = window.localStorage.getItem(TASKS_STORAGE_KEY);
        return item ? JSON.parse(item) : [];
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
    });

    useEffect(() => {
        // Do not save if we are in a collaboration session and have no tasks yet,
        // to avoid overwriting a previous local state with an empty list on join.
        // The collaboration logic will provide the tasks.
        const hash = window.location.hash.slice(1);
        if (hash && tasks.length === 0) {
            return;
        }

        try {
            window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
        } catch (error) {
            console.error('Error saving tasks to localStorage', error);
        }
    }, [tasks]);

    useEffect(() => {
        const checkReminders = () => {
            if (Notification.permission !== 'granted') return;
            const now = new Date();
            tasks.forEach(task => {
                if (task.status === 'todo') {
                    const dueDate = new Date(task.dueDate);
                    const timeDiff = dueDate.getTime() - now.getTime();
                    // Remind 1 hour before due date
                    if (timeDiff > 0 && timeDiff < 60 * 60 * 1000) {
                        new Notification('Upcoming Task Reminder', {
                            body: `Your task "${task.title}" is due soon!`,
                            icon: '/favicon.ico'
                        });
                    }
                }
            });
        };

        const intervalId = setInterval(checkReminders, 60 * 1000); // Check every minute
        return () => clearInterval(intervalId);
    }, [tasks]);

     useEffect(() => {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const addTask = useCallback((taskData: Omit<Task, 'id' | 'status' | 'createdAt'>) => {
        const newTask: Task = {
            id: crypto.randomUUID(),
            status: 'todo',
            createdAt: Date.now(),
            ...taskData,
        };
        setTasks(prevTasks => [newTask, ...prevTasks]);
    }, []);

    const updateTask = useCallback((id: string, updatedData: Partial<Omit<Task, 'id' | 'status' | 'createdAt'>>) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === id ? { ...task, ...updatedData } : task
            )
        );
    }, []);

    const deleteTask = useCallback((id: string) => {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    }, []);

    const toggleTaskStatus = useCallback((id: string) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === id ? { ...task, status: task.status === 'todo' ? 'done' : 'todo' } : task
            )
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
        setTasks, // Expose setTasks for real-time updates
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        reorderTasks,
        filters,
        setFilters,
        searchTerm,
        setSearchTerm,
    };
};