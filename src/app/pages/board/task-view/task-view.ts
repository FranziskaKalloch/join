import { Component, Input, inject, computed, signal } from '@angular/core';
import { CdkDragDrop, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { Task } from '../../../interfaces/task/task';
import { TaskStatus } from '../../../interfaces/task/task.types';
import { TaskService } from '../../../services/tasks/task.service';
import { TaskCardComponent } from './task-card/task-card';
import { DialogService, DialogType } from '../../../services/dialog/dialog.service';

@Component({
  selector: 'app-task-view',
  standalone: true,
  imports: [TaskCardComponent, CdkDropList, CdkDrag],
  templateUrl: './task-view.html',
  styleUrl: './task-view.scss',
})
export class TaskView {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) status!: TaskStatus;

  private _searchTerm = signal('');

  /**
   * Sets the search term used to filter tasks in the column.
   * Converts the value to lowercase for case-insensitive matching.
   * 
   * @param value The search string.
   */
  @Input() set searchTerm(value: string) {
    this._searchTerm.set(value ? value.toLowerCase() : '');
  }

  private taskService = inject(TaskService);

  /**
   * Computed signal that returns the filtered tasks for this column based on their status and the search term.
   */
  tasks = computed(() => {
    const search = this._searchTerm();
    let columnTasks = this.taskService.tasks().filter((task) => task.status === this.status);

    if (search) {
      columnTasks = columnTasks.filter(task =>
        task.title?.toLowerCase().includes(search) ||
        task.description?.toLowerCase().includes(search)
      );
    }

    return columnTasks;
  });

  /**
   * Handles the drag-and-drop event when a task is moved into this column.
   * Updates the task status via the task service if dropped into a different container.
   * 
   * @param event The CDK drag-and-drop event containing the task data and container details.
   */
  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer !== event.container) {
      const task = event.item.data as Task;
      this.taskService.updateTaskStatus(task.id, this.status);
    }
  }

  readonly dialogService = inject(DialogService);

  /**
   * Opens the add task dialog pre-configured with the current column's status.
   */
  openAddTask(): void {
    this.dialogService.open(DialogType.AddTask, {
      status: this.status
    });
  }
}