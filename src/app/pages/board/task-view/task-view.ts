import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { Component, computed, inject, Input, signal } from '@angular/core';

import { Task } from '../../../interfaces/task/task';
import { TaskStatus } from '../../../interfaces/task/task.types';
import { DialogService, DialogType } from '../../../services/dialog/dialog.service';
import { TaskService } from '../../../services/tasks/task.service';
import { TaskCardComponent } from './task-card/task-card';

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

  @Input() set searchTerm(value: string) {
    this._searchTerm.set(value ? value.toLowerCase() : '');
  }

  private taskService = inject(TaskService);

  tasks = computed(() => {
    const search = this._searchTerm();
    let columnTasks = this.taskService.tasks().filter((task) => task.status === this.status);

    if (search) {
      columnTasks = columnTasks.filter(
        (task) =>
          task.title?.toLowerCase().includes(search) ||
          task.description?.toLowerCase().includes(search),
      );
    }

    return columnTasks;
  });

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer !== event.container) {
      const task = event.item.data as Task;
      this.taskService.updateTaskStatus(task.id, this.status);
    }
  }

  readonly dialogService = inject(DialogService);

  openAddTask(): void {
    // console.log(this.status);
    this.dialogService.open(DialogType.AddTask, {
      status: this.status,
    });
  }
}
