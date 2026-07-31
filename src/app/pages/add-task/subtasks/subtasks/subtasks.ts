import { Component, signal, input, effect, output } from '@angular/core';
import { Subtask } from '../../../../interfaces/task/subtask';

@Component({
  selector: 'app-subtasks',
  imports: [],
  templateUrl: './subtasks.html',
  styleUrl: './subtasks.scss',
})
export class Subtasks {
  newSubtaskTitle = signal<string>('');
  subtasks = signal<Subtask[]>([]);
  editingIndex = signal<number | null>(null);
  editingTitle = signal<string>('');
  subtasksChange = output<Subtask[]>();

   /**
   * Update the value used for the new subtask input.
   *
   * @param value - Current input value.
   */
  onInputChange(value: string): void {
    this.newSubtaskTitle.set(value);
  }

  /**
   * Add a new subtask to the list.
   */
  addSubtask(): void {
    const title = this.newSubtaskTitle().trim();
    if (!title) return;
    this.subtasks.update((list) => [...list, { title, done: false }]);
    this.newSubtaskTitle.set('');
    this.emitChange();
  }

  /**
   * Clear the new subtask input value.
   */
  clearInput(): void {
    this.newSubtaskTitle.set('');
  }

  /**
   * Begin editing the subtask at the specified index.
   *
   * @param index - Index of the subtask to edit.
   */
  startEdit(index: number): void {
    this.editingIndex.set(index);
    this.editingTitle.set(this.subtasks()[index].title);
  }

  /**
   * Update the current edit input value.
   *
   * @param value - Current edit input value.
   */
  onEditInputChange(value: string): void {
    this.editingTitle.set(value);
  }

  /**
   * Save the edited title for the subtask at the specified index.
   *
   * @param index - Index of the subtask being saved.
   */
  saveEdit(index: number): void {
    const title = this.editingTitle().trim();
    if (!title) return;
    this.subtasks.update((list) => list.map((sub, i) => (i === index ? { ...sub, title } : sub)));
    this.editingIndex.set(null);
    this.emitChange();
  }

  /**
   * Remove the subtask at the specified index.
   *
   * @param index - Index of the subtask to delete.
   */
  deleteSubtask(index: number): void {
    this.subtasks.update((list) => list.filter((_, i) => i !== index));
    if (this.editingIndex() === index) this.editingIndex.set(null);
    this.emitChange();
  }

  /**
   * Emit the current subtasks list through the output event.
   */
  private emitChange(): void {
    this.subtasksChange.emit(this.subtasks());
  }

  initialSubtasks = input<Subtask[]>([]);
  private initialized = false;

  constructor() {
    effect(() => {
      if (this.initialized) {
        return;
      }

      const initial = this.initialSubtasks();

      this.subtasks.set([...initial]);
      this.subtasksChange.emit([...initial]);

      this.initialized = true;
    });
  }

  isClearHover = signal(false);
  isAddHover = signal(false);

  clear(): void {
    this.subtasks.set([]);
    this.newSubtaskTitle.set('');
    this.editingIndex.set(null);

    this.emitChange();
    this.initialized = false;
  }

  /**
   * Truncate a text string to a maximum length and append an ellipsis if needed.
   *
   * @param text - Text to truncate.
   * @param max - Maximum length before truncation.
   * @returns Truncated text.
   */
  truncate(text: string, max = 30): string {
    return text.length > max ? text.slice(0, max) + '…' : text;
  }
}