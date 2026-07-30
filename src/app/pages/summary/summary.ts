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

  get todoTasks(): number {
    return this.taskService.getTasksByStatus('todo').length;
  }

  get doneTasks(): number {
    return this.taskService.getTasksByStatus('done').length;
  }

  get tasksInProgress(): number {
    return this.taskService.getTasksByStatus('inProgress').length;
  }

  get awaitingFeedbackTasks(): number {
    return this.taskService.getTasksByStatus('awaitFeedback').length;
  }

  get urgentTasks(): number {
    return this.taskService.tasks().filter((task) => {
      return task.priority === 'urgent';
    }).length;
  }

  get tasksInBoard(): number {
    return this.taskService.tasks().length;
  }

  get firstName(): string {
    const user = this.authService.currentUser();

    if (!user || user.is_anonymous) {
      return '';
    }

    const fullName = user.user_metadata?.['full_name'] ?? '';

    return fullName.split('')[0];
  }
}
