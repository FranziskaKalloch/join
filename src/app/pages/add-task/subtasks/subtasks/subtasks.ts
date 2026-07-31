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

  /** Updates the new-subtask input value on keystroke. */
  onInputChange(value: string): void {
    this.newSubtaskTitle.set(value);
  }

  /** Adds the current input as a new subtask, then clears the input. */
  addSubtask(): void {
    const title = this.newSubtaskTitle().trim();
    if (!title) return;
    this.subtasks.update((list) => [...list, { title, done: false }]);
    this.newSubtaskTitle.set('');
    this.emitChange();
  }

  /** Clears the input text without adding a subtask. */
  clearInput(): void {
    this.newSubtaskTitle.set('');
  }

  /** Enters edit mode for a given subtask (triggered by pencil click or double-click). */
  startEdit(index: number): void {
    this.editingIndex.set(index);
    this.editingTitle.set(this.subtasks()[index].title);
  }

  /** Updates the editingTitle value on keystroke while editing. */
  onEditInputChange(value: string): void {
    this.editingTitle.set(value);
  }

  /** Confirms the edit and writes the new title back into the subtasks list. */
  saveEdit(index: number): void {
    const title = this.editingTitle().trim();
    if (!title) return;
    this.subtasks.update((list) => list.map((sub, i) => (i === index ? { ...sub, title } : sub)));
    this.editingIndex.set(null);
    this.emitChange();
  }

  /** Removes a subtask by index, whether idle or currently in edit mode. */
  deleteSubtask(index: number): void {
    this.subtasks.update((list) => list.filter((_, i) => i !== index));
    if (this.editingIndex() === index) this.editingIndex.set(null);
    this.emitChange();
  }

  /** Notifies the parent (AddTask) whenever the subtasks list changes. */
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

  truncate(text: string, max = 30): string {
    return text.length > max ? text.slice(0, max) + '…' : text;
  }

}