import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { Component, inject, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { TaskStatus } from '../../interfaces/task/task.types';
import { ContactService } from '../../services/contacts/contact.service';
import { DialogService, DialogType } from '../../services/dialog/dialog.service';
import { TaskService } from '../../services/tasks/task.service';
import { TaskDialog } from './task-dialog/task-dialog';
import { TaskView } from './task-view/task-view';

/**
 * Component responsible for managing and displaying the Kanban task board.
 */
@Component({
  selector: 'app-board',
  standalone: true,
  imports: [TaskView, FormsModule, TaskDialog, CdkDropListGroup],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class BoardComponent implements OnInit, OnDestroy {
  taskService = inject(TaskService);
  private contactService = inject(ContactService);
  private renderer = inject(Renderer2);
  searchTerm = '';

  boardColumns: { title: string; status: TaskStatus }[] = [
    { title: 'To do', status: 'todo' },
    { title: 'In progress', status: 'inProgress' },
    { title: 'Await feedback', status: 'awaitFeedback' },
    { title: 'Done', status: 'done' },
  ];

  readonly dialogService = inject(DialogService);
  readonly DialogType = DialogType;
  private router = inject(Router);

  /**
   * Lifecycle hook that runs upon component initialization.
   * Subscribes to task updates and adds the early mobile class to the body.
   */
  ngOnInit(): void {
    this.taskService.subscribeToTaskChanges();
    this.renderer.addClass(document.body, 'board-early-mobile');
  }

  /**
   * Lifecycle hook that runs when the component is destroyed.
   * Unsubscribes from task changes and removes the early mobile body class.
   */
  ngOnDestroy(): void {
    this.taskService.unsubscribeFromTaskChanges();
    this.renderer.removeClass(document.body, 'board-early-mobile');
  }

  /**
   * Opens the task creation dialog on desktop viewports or navigates 
   * to the dedicated add-task route on mobile viewports.
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