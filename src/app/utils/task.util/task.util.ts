import { Component } from '@angular/core';
import { TaskCategory } from '../../interfaces/task/task.types';

@Component({
  selector: 'app-task.util',
  imports: [],
  templateUrl: './task.util.html',
  styleUrl: './task.util.scss',
})
export class TaskUtil {
}

/**
 * Get the CSS class name for a task category.
 *
 * @param category - The task category value.
 * @returns The CSS class name matching the category.
 */
export function getCategoryClass(category: TaskCategory | string): string {
  return category === 'technical-task'
    ? 'technicalTask'
    : 'userStory';
}

/**
 * Get the display label for a task category.
 *
 * @param category - The task category value.
 * @returns The human-readable task category name.
 */
export function getCategoryDisplayName(category: TaskCategory | string): string {
  return category === 'technical-task'
    ? 'Technical Task'
    : 'User Story';
}