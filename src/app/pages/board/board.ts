import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { TaskStatus } from '../../interfaces/task/task.types';
import { ContactService } from '../../services/contacts/contact.service';
import { DialogService, DialogType } from '../../services/dialog/dialog.service';
import { TaskService } from '../../services/tasks/task.service';
import { TaskDialog } from './task-dialog/task-dialog';
import { TaskView } from './task-view/task-view';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [TaskView, FormsModule, TaskDialog, CdkDropListGroup],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class BoardComponent implements OnInit {
  taskService = inject(TaskService);
  private contactService = inject(ContactService);
  searchTerm = '';

  boardColumns: { title: string; status: TaskStatus }[] = [
    { title: 'To do', status: 'todo' },
    { title: 'In progress', status: 'inProgress' },
    { title: 'Await feedback', status: 'awaitFeedback' },
    { title: 'Done', status: 'done' },
  ];

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound properties.
   * Loads tasks, contacts, and sets up real-time task synchronization.
   */
  ngOnInit(): void {
    this.taskService.subscribeToTaskChanges();
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   * Cleans up subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.taskService.unsubscribeFromTaskChanges();
  }

  readonly dialogService = inject(DialogService);
  readonly DialogType = DialogType;
  private router = inject(Router);

  /**
   * Opens the add task dialog on desktop viewports or navigates to the add-task route on mobile screens.
   */
  openDialog(): void {
    const isDesktop = window.matchMedia('(min-width: 569px)').matches;

    if (isDesktop) {
      this.dialogService.open(DialogType.AddTask);
    } else {
      this.router.navigate(['/add-task']);
    }
  }
}
