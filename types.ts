export type Priority = 'low' | 'medium' | 'high';
export type Category = 'personal' | 'work' | 'custom';
export type Status = 'todo' | 'inprogress' | 'done' | 'recurring';
export type ReminderInterval = 'none' | '1m' | '5m' | '10m' | '1h';

export interface Attachment {
  id: string;
  name: string;
  data: string; // Base64 encoded data URL
  expiryDate?: number | null;
  reminderInterval?: ReminderInterval;
  reminderStartTime?: number | null;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: Category;
  status: Status;
  createdAt: number; // timestamp
  startDateTime?: number | null; // Timestamp for when the task should start
  completedAt?: number | null; // Timestamp for when the task was marked as done
  completionNotes?: string;
  reminderInterval?: ReminderInterval;
  reminderStartTime?: number | null; // Timestamp when the reminder was activated
  attachments?: Attachment[];
}

export interface Filters {
  status: Status | 'all';
  category: Category | 'all';
  priority: Priority | 'all';
  hasNotes: boolean;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}