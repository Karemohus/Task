
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTasks } from './hooks/useTasks';
import type { Task } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import FilterControls from './components/FilterControls';
import TaskList from './components/TaskList';
import TaskFormModal from './components/TaskFormModal';
import { PlusIcon, UsersIcon, ClipboardIcon } from './components/Icons';
import { ToastProvider, useToast } from './hooks/useToast';
import ToastContainer from './components/ToastContainer';
import mqtt from 'mqtt';

type CollaborationStatus = 'idle' | 'connecting' | 'connected' | 'error';

const AppContent: React.FC = () => {
    const {
        tasks,
        setTasks, // Direct access to setTasks for collaboration
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        reorderTasks,
        filters,
        setFilters,
        searchTerm,
        setSearchTerm,
    } = useTasks();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const { addToast } = useToast();

    // --- Collaboration State ---
    const [collabStatus, setCollabStatus] = useState<CollaborationStatus>('idle');
    const [roomId, setRoomId] = useState<string | null>(null);
    const mqttClient = useRef<mqtt.MqttClient | null>(null);
    const clientId = useRef<string>(`todo-app-${crypto.randomUUID()}`);
    const isReceiving = useRef<boolean>(false); // Prevents broadcast loops

    // Effect to join a room from URL hash
    useEffect(() => {
        const hash = window.location.hash.slice(1);
        if (hash) {
            joinRoom(hash);
        }

        const handleHashChange = () => {
            const newHash = window.location.hash.slice(1);
            if (newHash && newHash !== roomId) {
                joinRoom(newHash);
            }
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Effect to broadcast local changes
    useEffect(() => {
        if (collabStatus === 'connected' && !isReceiving.current) {
            const payload = JSON.stringify({ sender: clientId.current, tasks });
            mqttClient.current?.publish(getTopic(roomId!), payload);
        }
        // Reset the flag after a potential update
        isReceiving.current = false;
    }, [tasks, collabStatus, roomId]);


    const getTopic = (id: string) => `todo-app/room/${id}`;

    const joinRoom = (newRoomId: string) => {
        if (mqttClient.current) {
            mqttClient.current.end();
        }
        setRoomId(newRoomId);
        setCollabStatus('connecting');

        const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');
        mqttClient.current = client;

        client.on('connect', () => {
            setCollabStatus('connected');
            addToast(`Joined collaboration room!`, 'success');
            client.subscribe(getTopic(newRoomId), (err) => {
                if (err) {
                    setCollabStatus('error');
                    addToast('Failed to subscribe to room.', 'error');
                } else {
                     // On successful connection, broadcast current state
                    const payload = JSON.stringify({ sender: clientId.current, tasks });
                    client.publish(getTopic(newRoomId), payload);
                }
            });
        });

        client.on('message', (topic, message) => {
            try {
                const data = JSON.parse(message.toString());
                if (data.sender !== clientId.current) {
                    isReceiving.current = true; // Set flag before updating state
                    setTasks(data.tasks);
                }
            } catch (e) {
                console.error("Failed to parse incoming message:", e);
            }
        });

        client.on('error', (err) => {
            console.error('MQTT Connection Error:', err);
            setCollabStatus('error');
            addToast('Connection error. Collaboration disabled.', 'error');
            client.end();
        });

        client.on('close', () => {
            if (collabStatus !== 'error') {
               setCollabStatus('idle');
            }
        });
    };

    const handleStartCollaboration = () => {
        const newRoomId = crypto.randomUUID();
        window.location.hash = newRoomId;
        // The hashchange listener will trigger joinRoom
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            addToast('Collaboration link copied!', 'success');
        } catch (error) {
            addToast('Could not copy link.', 'error');
        }
    };


    const openAddTaskModal = () => {
        setTaskToEdit(null);
        setIsModalOpen(true);
    };

    const openEditTaskModal = (task: Task) => {
        setTaskToEdit(task);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (taskData: Omit<Task, 'id' | 'status' | 'createdAt'>) => {
        if (taskToEdit) {
            updateTask(taskToEdit.id, taskData);
            addToast('Task updated successfully!', 'success');
        } else {
            addTask(taskData);
            addToast('Task added successfully!', 'success');
        }
        setIsModalOpen(false);
    };
    
    const handleDeleteTask = (id: string) => {
        deleteTask(id);
        addToast('Task deleted.', 'error');
    };

    const filteredTasks = useMemo(() => {
        return tasks
            .filter(task => {
                const statusMatch = filters.status === 'all' || task.status === filters.status;
                const categoryMatch = filters.category === 'all' || task.category === filters.category;
                const priorityMatch = filters.priority === 'all' || task.priority === filters.priority;
                const searchMatch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    task.description.toLowerCase().includes(searchTerm.toLowerCase());
                return statusMatch && categoryMatch && priorityMatch && searchMatch;
            });
    }, [tasks, filters, searchTerm]);

    const renderCollabButton = () => {
        switch (collabStatus) {
            case 'connecting':
                return (
                    <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg shadow-md" disabled>
                        <UsersIcon className="w-5 h-5 animate-pulse" />
                        <span className="hidden sm:inline">Connecting...</span>
                    </button>
                );
            case 'connected':
                return (
                    <button
                        onClick={handleCopyLink}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-all duration-200 transform hover:scale-105"
                        aria-label="Copy collaboration link"
                    >
                        <ClipboardIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Copy Link</span>
                    </button>
                );
            case 'error':
                 return (
                    <button
                        onClick={handleStartCollaboration}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-all duration-200 transform hover:scale-105"
                        aria-label="Start Collaboration"
                    >
                        <UsersIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Retry Collab</span>
                    </button>
                );
            case 'idle':
            default:
                return (
                    <button
                        onClick={handleStartCollaboration}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 transition-all duration-200 transform hover:scale-105"
                        aria-label="Start Collaboration"
                    >
                        <UsersIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Collaborate</span>
                    </button>
                );
        }
    }

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
            <Header />
            <main className="container mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
                    <Dashboard tasks={tasks} />
                    <FilterControls
                        filters={filters}
                        setFilters={setFilters}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                    />
                </aside>
                <div className="lg:col-span-8 xl:col-span-9">
                    <div className="bg-white dark:bg-slate-800/50 p-4 sm:p-6 rounded-2xl shadow-lg">
                        <div className="flex justify-between items-center mb-4 gap-2">
                            <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200">My Tasks</h2>
                            <div className="flex items-center gap-2">
                                {renderCollabButton()}
                                <button
                                    onClick={openAddTaskModal}
                                    className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg shadow-md hover:bg-sky-600 transition-all duration-200 transform hover:scale-105"
                                    aria-label="Add New Task"
                                >
                                    <PlusIcon className="w-5 h-5" />
                                    <span className="hidden sm:inline">Add Task</span>
                                </button>
                            </div>
                        </div>
                        <TaskList
                            tasks={filteredTasks}
                            onEdit={openEditTaskModal}
                            onDelete={handleDeleteTask}
                            onToggle={toggleTaskStatus}
                            onReorder={reorderTasks}
                        />
                    </div>
                </div>
            </main>
            {isModalOpen && (
                <TaskFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleFormSubmit}
                    initialData={taskToEdit}
                />
            )}
            <ToastContainer />
        </div>
    );
};

const App: React.FC = () => (
    <ToastProvider>
        <AppContent />
    </ToastProvider>
);

export default App;