import { Injectable, signal } from '@angular/core';

export enum DialogType {
  Contact = 'contact',
  AddTask = 'add-task',
  TaskDetails = 'task-details',
  EditTask = 'edit-task'
}

/**
 * Represents the state of the dialog system.
 *
 * @template T - Type of optional payload data attached to the dialog.
 */
export interface DialogState<T = unknown> {
  type: DialogType | null;
  data?: T;
}

@Injectable({
  providedIn: 'root'
})

export class DialogService {

  /**
   * Signal that holds the current dialog state. Subscribe to this signal to
   * react to dialog open/close events.
   */
  readonly current = signal<DialogState>({
    type: null
  });

  /**
   * Open a dialog of the given type and optionally attach data.
   *
   * @template T
   * @param type - The DialogType to open.
   * @param data - Optional data payload passed to the dialog.
   */
  open<T>(type: DialogType, data?: T): void {
    this.current.set({
      type,
      data
    });
  }

  /**
   * Close any open dialog by resetting the current state to no dialog.
   */
  clear(): void {
    this.current.set({
      type: null
    });
  }
}