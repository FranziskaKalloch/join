import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { ContactService } from '../../services/contacts/contact.service';
import { TaskService } from '../../services/tasks/task.service';

/**
 * Displays a summary (dashboard) of the currently logged-in user's tasks.
 *
 * Computes various metrics such as the number of open, in-progress, done,
 * and urgent tasks. Anonymous or unauthenticated users see all tasks by
 * default; authenticated users only see the tasks assigned to their
 * associated contact.
 */
@Component({
  selector: 'app-summary',
  imports: [DatePipe, RouterLink],
  templateUrl: './summary.html',
  styleUrl: './summary.scss',
})
export class Summary {
  /** Service for managing and retrieving task data. */
  taskService = inject(TaskService);

  /** Authentication service, provides among other things the currently logged-in user. */
  authService = inject(AuthService);

  /** Service for managing contacts, used to map user → contact. */
  contactService = inject(ContactService);

  /** Current date, e.g. used for display in the template. */
  currentDate = new Date();

  /**
   * Returns the tasks visible to the current user.
   *
   * If no user is logged in or the user is anonymous, all existing tasks
   * are returned. Otherwise, it checks whether a contact belonging to the
   * user exists; only tasks assigned to that contact are returned. If no
   * matching contact exists, an empty array is returned.
   *
   * @returns List of tasks visible to the user.
   */
  get visibleTasks() {
    const user = this.authService.currentUser();

    if (!user || user.is_anonymous) {
      return this.taskService.tasks();
    }

    const myContact = this.contactService
      .contacts()
      .find((contact) => contact.authUserId === user.id);

    if (!myContact) {
      return [];
    }

    return this.taskService
      .tasks()
      .filter((task) => task.assignedContactIds?.includes(myContact.id!));
  }

  /**
   * Number of visible tasks with status `'todo'`.
   *
   * @returns Number of open tasks.
   */
  get todoTasks(): number {
    return this.visibleTasks.filter((task) => task.status === 'todo').length;
  }

  /**
   * Number of visible tasks with status `'done'`.
   *
   * @returns Number of completed tasks.
   */
  get doneTasks(): number {
    return this.visibleTasks.filter((task) => task.status === 'done').length;
  }

  /**
   * Number of visible tasks with status `'inProgress'`.
   *
   * @returns Number of tasks in progress.
   */
  get tasksInProgress(): number {
    return this.visibleTasks.filter((task) => task.status === 'inProgress').length;
  }

  /**
   * Number of visible tasks with status `'awaitFeedback'`.
   *
   * @returns Number of tasks awaiting feedback.
   */
  get awaitingFeedbackTasks(): number {
    return this.visibleTasks.filter((task) => task.status === 'awaitFeedback').length;
  }

  /**
   * Number of visible tasks with priority `'urgent'`.
   *
   * @returns Number of urgent tasks.
   */
  get urgentTasks(): number {
    return this.visibleTasks.filter((task) => {
      return task.priority === 'urgent';
    }).length;
  }

  /**
   * Total number of visible tasks in the board.
   *
   * @returns Number of all visible tasks.
   */
  get tasksInBoard(): number {
    return this.visibleTasks.length;
  }

  /**
   * Full name of the currently logged-in user.
   *
   * If no user is logged in or the user is anonymous, an empty string is
   * returned.
   *
   * @returns The user's full name, or an empty string.
   */
  get userName(): string {
    const user = this.authService.currentUser();

    if (!user || user.is_anonymous) {
      return '';
    }

    const fullName = user.user_metadata?.['full_name'] ?? '';

    return fullName;
  }

  /*Marc Test*/

  showGreetingAnimation = this.authService.showSummaryGreeting;
  isClosingGreeting = signal(false);

  ngOnInit() {
    if (!this.showGreetingAnimation()) {
      return;
    }

    setTimeout(() => {
      this.isClosingGreeting.set(true);

      setTimeout(() => {
        this.authService.hideSummaryGreeting();
      }, 600);
    }, 1200);
  }

  get greeting(): string {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good morning!';
    if (hour < 18) return 'Good afternoon!';
    return 'Good evening!';
  }
}
