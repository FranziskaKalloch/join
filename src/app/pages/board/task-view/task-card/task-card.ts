import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { Task } from '../../../../interfaces/task/task';
import { ContactService } from '../../../../services/contacts/contact.service';
import { DialogService, DialogType } from '../../../../services/dialog/dialog.service';
import { TaskService } from '../../../../services/tasks/task.service';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss',
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;
  private contactService = inject(ContactService);

  /**
   * Retrieves the initials of a contact by their unique identifier.
   * 
   * @param contactId The ID of the contact.
   * @returns The contact's initials or an empty string if not found.
   */
  getContactInitials(contactId: number): string {
    const contact = this.contactService.contacts().find((contact) => contact.id === contactId);
    return contact?.initials ?? '';
  }

  /**
   * Returns the CSS class corresponding to the task's category.
   */
  get categoryClass(): string {
    return (this.task.category as any) === 'technical-task' ? 'technicalTask' : 'userStory';
  }

  /**
   * Returns the formatted display name for the task's category.
   */
  get categoryDisplayName(): string {
    return (this.task.category as any) === 'technical-task' ? 'Technical Task' : 'User Story';
  }

  /**
   * Returns the number of completed subtasks.
   */
  get completedSubtasks(): number {
    return this.task.subtasks ? this.task.subtasks.filter((subtask) => subtask.done).length : 0;
  }

  /**
   * Returns the total number of subtasks for the task.
   */
  get totalSubtasks(): number {
    return this.task.subtasks ? this.task.subtasks.length : 0;
  }

  /**
   * Calculates the completion percentage of the subtasks.
   */
  get progressPercentage(): number {
    return this.totalSubtasks === 0 ? 0 : (this.completedSubtasks / this.totalSubtasks) * 100;
  }

  /**
   * Returns the file path for the priority icon based on the task's priority level.
   */
  get priorityIcon(): string {
    return `/assets/img/components/board/priority-symbol-${this.task.priority}.svg`;
  }

  /**
   * Retrieves the background color for a contact's avatar badge.
   * 
   * @param id The ID of the contact.
   * @returns The color string.
   */
  getAssigneeColor(id: number): string {
    return this.contactService.getBubbleColors(id);
  }

  /**
   * Returns a limited list of assigned contact IDs to display on the card (up to 4).
   */
  get displayedAssignees(): number[] {
    return this.task.assignedContactIds ? this.task.assignedContactIds.slice(0, 4) : [];
  }

  /**
   * Returns the number of additional assignees exceeding the display limit.
   */
  get extraAssigneesCount(): number {
    return this.task.assignedContactIds ? Math.max(0, this.task.assignedContactIds.length - 4) : 0;
  }

  private dialogService = inject(DialogService);
  private taskService = inject(TaskService);

  /**
   * Selects the current task in the task service and opens the task details dialog.
   */
  openTaskDetails(): void {
    this.taskService.selectedTask.set(this.task);
    this.dialogService.open(DialogType.TaskDetails);
  }

  /**
   * Lifecycle hook for component initialization.
   */
  ngOnInit() {
}

}