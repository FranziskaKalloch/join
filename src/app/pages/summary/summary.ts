import { DatePipe, registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { Component, inject, LOCALE_ID } from '@angular/core';

import { AuthService } from '../../services/auth/auth.service';
import { TaskService } from '../../services/tasks/task.service';

@Component({
  selector: 'app-summary',
  imports: [DatePipe],
  templateUrl: './summary.html',
  styleUrl: './summary.scss',
})
export class Summary {
  taskService = inject(TaskService);
  authService = inject(AuthService);

  currentDate = new Date();

  get visibleTasks() {
    const user = this.authService.currentUser();

    if (!user || user.is_anonymous) {
      return this.taskService.tasks();
    }

    return this.taskService.tasks().filter((task) => task.authUserId === user.id);
  }

  get todoTasks(): number {
    return this.visibleTasks.filter((task) => task.status === 'todo').length;
  }

  get doneTasks(): number {
    return this.visibleTasks.filter((task) => task.status === 'done').length;
  }

  get tasksInProgress(): number {
    return this.visibleTasks.filter((task) => task.status === 'inProgress').length;
  }

  get awaitingFeedbackTasks(): number {
    return this.visibleTasks.filter((task) => task.status === 'awaitFeedback').length;
  }

  get urgentTasks(): number {
    return this.visibleTasks.filter((task) => {
      return task.priority === 'urgent';
    }).length;
  }

  get tasksInBoard(): number {
    return this.visibleTasks.length;
  }

  get userName(): string {
    const user = this.authService.currentUser();

    if (!user || user.is_anonymous) {
      return '';
    }

    const fullName = user.user_metadata?.['full_name'] ?? '';

    return fullName;
  }
}
