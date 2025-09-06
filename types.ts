export type Priority = 'low' | 'medium' | 'high';
export type Category = 'personal' | 'work' | 'custom';
export type Status = 'todo' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO string format: YYYY-MM-DD
  priority: Priority;
  category: Category;
  status: Status;
  createdAt: number; // timestamp
  attachment?: {
    name: string;
    data: string; // Base64 encoded data URL
  };
}

export interface Filters {
  status: Status | 'all';
  category: Category | 'all';
  priority: Priority | 'all';
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}