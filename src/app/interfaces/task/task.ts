import { Subtask } from './subtask';
import { TaskCategory, TaskPriority, TaskStatus } from './task.types';

export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  category: TaskCategory;
  status: TaskStatus;
  assignedContactIds: number[];
  subtasks: Subtask[];
  createdAt: string;
  authUserId?: string;
}
