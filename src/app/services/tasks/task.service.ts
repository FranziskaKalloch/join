import { inject, Injectable, OnInit, signal } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';

import { Task } from '../../interfaces/task/task';
import { TaskPriority, TaskStatus } from '../../interfaces/task/task.types';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private supabase = inject(SupabaseService);
  private taskChannel: RealtimeChannel | undefined;
  tasks = signal<Task[]>([]);
  selectedTask = signal<Task | null>(null);

  /**
   * Loads all tasks from the Supabase database and maps them
   * to the application's Task interface.
   *
   * The loaded tasks are stored in the tasks signal and also
   * returned as an array.
   *
   * @returns A promise that resolves with an array of all loaded tasks.
   * Returns an empty array if the request fails or no data is available.
   */
  async loadTasks(): Promise<Task[]> {
    const { data, error } = await this.supabase.supabase.from('tasks').select('*');

    if (!error && data) {
      const mappedTasks: Task[] = data.map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.due_date,
        priority: task.priority,
        category: task.category,
        status: task.status,
        assignedContactIds: task.assigned_contact_ids,
        subtasks: task.subtasks,
        createdAt: task.created_at,
        authUserId: task.auth_user_id,
      }));

      this.tasks.set(mappedTasks);
      return mappedTasks;
    }
    return [];
  }

  /**
   * Creates a new task in the Supabase database.
   *
   * After the task has been successfully created, all tasks are
   * reloaded to keep the local tasks signal up to date.
   *
   * @param task The task data to create, excluding the id and createdAt properties.
   * @returns A promise that resolves when the task has been created and the task list has been updated.
   */
  async createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<void> {
    const { data, error } = await this.supabase.supabase.from('tasks').insert([
      {
        title: task.title,
        description: task.description,
        due_date: task.dueDate,
        priority: task.priority,
        category: task.category,
        status: task.status,
        assigned_contact_ids: task.assignedContactIds,
        subtasks: task.subtasks,
        auth_user_id: task.authUserId,
      },
    ]);
    console.log('insert result:', data, error);
    if (!error) {
      await this.loadTasks();
    }
  }

  /**
   * Updates an existing task in the Supabase database.
   *
   * After the task has been successfully updated, all tasks are
   * reloaded and the selected task signal is updated with the
   * latest version of the task.
   *
   * @param task The task containing the updated values.
   * @returns A promise that resolves when the task has been updated and the local state has been refreshed.
   * @throws Throws an error if the task could not be updated.
   */
  async updateTask(task: Task): Promise<void> {
    const { error } = await this.supabase.supabase
      .from('tasks')
      .update({
        title: task.title,
        description: task.description,
        due_date: task.dueDate,
        priority: task.priority,
        category: task.category,
        status: task.status,
        assigned_contact_ids: task.assignedContactIds,
        subtasks: task.subtasks,
        auth_user_id: task.authUserId,
      })
      .eq('id', task.id);

    if (error) {
      throw error;
    }

    await this.loadTasks();

    const updatedTask = this.tasks().find((t) => t.id === task.id);

    if (updatedTask) {
      this.selectedTask.set(updatedTask);
    }
  }

  /**
   * Deletes a task from the Supabase database.
   *
   * If the deleted task is currently selected, the selected task
   * signal is cleared. Afterwards, all tasks are reloaded to keep
   * the local state up to date.
   *
   * @param taskId The id of the task to delete.
   * @returns A promise that resolves when the task has been deleted and the task list has been refreshed.
   * @throws Throws an error if the task could not be deleted.
   */
  async deleteTask(taskId: number): Promise<void> {
    const { error } = await this.supabase.supabase.from('tasks').delete().eq('id', taskId);
    if (error) {
      throw error;
    }
    if (this.selectedTask()?.id === taskId) {
      this.selectedTask.set(null);
    }
    await this.loadTasks();
  }

  /**
   * Subscribes to realtime changes on the tasks table.
   *
   * Whenever a task is created, updated, or deleted in the database,
   * the local task list is reloaded to keep the application state
   * synchronized with Supabase.
   */
  subscribeToTaskChanges(): void {
    this.taskChannel = this.supabase.supabase
      .channel('task-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },

        async () => {
          await this.loadTasks();
        },
      )
      .subscribe();
  }

  /**
   * Unsubscribes from the realtime task changes channel.
   *
   * Removes the active Supabase realtime channel and clears the
   * local channel reference to stop receiving task updates.
   *
   * @returns A promise that resolves when the realtime subscription has been removed.
   */
  async unsubscribeFromTaskChanges(): Promise<void> {
    if (this.taskChannel) {
      await this.supabase.supabase.removeChannel(this.taskChannel);
      this.taskChannel = undefined;
    }
  }

  /**
   * Updates the status of an existing task in the Supabase database.
   *
   * After the status has been successfully updated, all tasks are
   * reloaded to keep the local task list synchronized with the database.
   *
   * @param taskId The id of the task to update.
   * @param status The new status to assign to the task.
   * @returns A promise that resolves when the task status has been updated and the task list has been refreshed.
   * @throws Throws an error if the task status could not be updated.
   */
  async updateTaskStatus(taskId: number, status: TaskStatus): Promise<void> {
    const { error } = await this.supabase.supabase
      .from('tasks')
      .update({
        status: status,
      })
      .eq('id', taskId);
    if (error) {
      throw error;
    }
    await this.loadTasks();
  }

  /**
   * Returns all tasks with the specified status.
   *
   * @param status The status used to filter the tasks.
   * @returns An array containing all tasks with the given status.
   */
  getTasksByStatus(status: TaskStatus): Task[] {
    return this.tasks().filter((task) => {
      return task.status === status;
    });
  }

  /**
   * Toggles the completion state of a subtask and updates
   * the corresponding task in the Supabase database.
   *
   * @param task The task containing the subtask to update.
   * @param index The index of the subtask to toggle.
   * @returns A promise that resolves when the task has been updated.
   */
  async toggleSubtask(task: Task, index: number): Promise<void> {
    task.subtasks[index].done = !task.subtasks[index].done;

    await this.updateTask(task);
  }

  /**
   * Clears the currently selected task.
   */
  clearSelectedTask(): void {
    this.selectedTask.set(null);
  }
}
