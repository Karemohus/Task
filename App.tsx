import React, { useState, useMemo } from 'react';
import { useTasks } from './hooks/useTasks';
import type { Task, Attachment, Status } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import FilterControls from './components/FilterControls';
import TaskList from './components/TaskList';
import TaskFormModal from './components/TaskFormModal';
import { PlusIcon } from './components/Icons';
import { ToastProvider, useToast } from './hooks/useToast';
import ToastContainer from './components/ToastContainer';
import ReminderModal from './components/ReminderModal';
import CompletionNotesModal from './components/CompletionNotesModal';
import AttachmentPreviewModal from './components/AttachmentPreviewModal';
import ConfirmationModal from './components/ConfirmationModal';
import AttachmentReminderModal from './components/AttachmentReminderModal';
import QuickEditPopover from './components/QuickEditPopover';
import RenewAttachmentModal from './components/RenewAttachmentModal';

const AppContent: React.FC = () => {
    const {
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
        dismissAttachmentReminder,
    } = useTasks();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const [attachmentToPreview, setAttachmentToPreview] = useState<Attachment | null>(null);
    const [attachmentToRenew, setAttachmentToRenew] = useState<{ task: Task, attachment: Attachment } | null>(null);
    const [quickEditTask, setQuickEditTask] = useState<{ task: Task; anchorEl: HTMLElement } | null>(null);
    const { addToast } = useToast();

    const openAddTaskModal = () => {
        setTaskToEdit(null);
        setIsModalOpen(true);
    };

    const openEditTaskModal = (task: Task) => {
        setQuickEditTask(null); // Close quick edit popover if open
        setTaskToEdit(task);
        setIsModalOpen(true);
    };
    
    const openQuickEdit = (task: Task, anchorEl: HTMLElement) => {
        setQuickEditTask({ task, anchorEl });
    };

    const handleFormSubmit = (taskData: Omit<Task, 'id' | 'status' | 'createdAt' | 'reminderStartTime' | 'completedAt'>) => {
        if (taskToEdit) {
            updateTask(taskToEdit.id, taskData);
            addToast('Task updated successfully!', 'success');
        } else {
            addTask(taskData);
            addToast('Task added successfully!', 'success');
        }
        setIsModalOpen(false);
    };

    const handleQuickUpdate = (id: string, updatedData: Partial<Omit<Task, 'id' | 'status' | 'createdAt'>>) => {
        updateTask(id, updatedData);
        setQuickEditTask(null);
        addToast('Task updated quickly!', 'success');
    };
    
    const openDeleteConfirmation = (task: Task) => {
        setTaskToDelete(task);
    };

    const handleConfirmDelete = () => {
        if (taskToDelete) {
            deleteTask(taskToDelete.id);
            addToast('Task deleted.', 'error');
            setTaskToDelete(null);
        }
    };
    
    const handleStatusChange = (task: Task, newStatus: Status) => {
        if (newStatus === 'done' && task.status !== 'done') {
            setTaskToComplete(task);
        } else {
            changeTaskStatus(task.id, newStatus);
        }
    };

    const handleCompleteTask = (notes: string) => {
        if (taskToComplete) {
            changeTaskStatus(taskToComplete.id, 'done', notes);
            addToast('Task completed!', 'success');
        }
        setTaskToComplete(null);
    };

    const handleRenewAttachmentSubmit = (attachmentId: string, newFileData: { data: string; name: string }, newExpiryDate: number | null) => {
        if (!attachmentToRenew) return;
        const { task } = attachmentToRenew;

        const updatedAttachments = task.attachments?.map(att => {
            if (att.id === attachmentId) {
                return {
                    ...att,
                    name: newFileData.name,
                    data: newFileData.data,
                    expiryDate: newExpiryDate,
                };
            }
            return att;
        }) || [];

        updateTask(task.id, { attachments: updatedAttachments });
        setAttachmentToRenew(null);
        addToast('Attachment renewed successfully!', 'success');
    };

    const filteredTasks = useMemo(() => {
        return tasks
            .filter(task => {
                const categoryMatch = filters.category === 'all' || task.category === filters.category;
                const priorityMatch = filters.priority === 'all' || task.priority === filters.priority;
                const searchMatch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    (task.completionNotes || '').toLowerCase().includes(searchTerm.toLowerCase());

                if (filters.hasNotes) {
                    const hasNotesCondition = task.status === 'done' && !!task.completionNotes;
                    return hasNotesCondition && categoryMatch && priorityMatch && searchMatch;
                }

                const statusMatch = filters.status === 'all' || task.status === filters.status;
                return statusMatch && categoryMatch && priorityMatch && searchMatch;
            });
    }, [tasks, filters, searchTerm]);

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
                            onQuickEdit={openQuickEdit}
                            onAdvancedEdit={openEditTaskModal}
                            onUpdate={updateTask}
                            onDelete={openDeleteConfirmation}
                            onStatusChange={handleStatusChange}
                            onToggleReminder={toggleReminder}
                            onToggleAttachmentReminder={toggleAttachmentReminder}
                            onReorder={reorderTasks}
                            onPreviewAttachment={setAttachmentToPreview}
                            onRenewAttachment={(task, attachment) => setAttachmentToRenew({ task, attachment })}
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
             {taskToComplete && (
                <CompletionNotesModal
                    isOpen={!!taskToComplete}
                    task={taskToComplete}
                    onClose={() => setTaskToComplete(null)}
                    onSubmit={handleCompleteTask}
                />
            )}
            {attachmentToPreview && (
                <AttachmentPreviewModal 
                    attachment={attachmentToPreview}
                    onClose={() => setAttachmentToPreview(null)}
                />
            )}
            {taskToDelete && (
                <ConfirmationModal
                    isOpen={!!taskToDelete}
                    onClose={() => setTaskToDelete(null)}
                    onConfirm={handleConfirmDelete}
                    title="Confirm Deletion"
                    message={
                        <span>
                            Are you sure you want to delete the task <strong className="font-semibold text-slate-800 dark:text-slate-100">"{taskToDelete.title}"</strong>? This action cannot be undone.
                        </span>
                    }
                />
            )}
            {attachmentToRenew && (
                <RenewAttachmentModal
                    isOpen={!!attachmentToRenew}
                    onClose={() => setAttachmentToRenew(null)}
                    onSubmit={handleRenewAttachmentSubmit}
                    task={attachmentToRenew.task}
                    attachment={attachmentToRenew.attachment}
                />
            )}
            {quickEditTask && (
                <QuickEditPopover
                    task={quickEditTask.task}
                    anchorEl={quickEditTask.anchorEl}
                    onClose={() => setQuickEditTask(null)}
                    onUpdate={handleQuickUpdate}
                    onAdvancedEdit={() => openEditTaskModal(quickEditTask.task)}
                />
            )}
            <ReminderModal task={taskToRemind} onClose={dismissReminder} />
            <AttachmentReminderModal data={attachmentToRemind} onClose={dismissAttachmentReminder} />
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