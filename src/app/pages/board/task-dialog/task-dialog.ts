import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';

import { DialogService, DialogType } from '../../../services/dialog/dialog.service';
import { AddTask } from '../../add-task/add-task';
import { TaskViewDialog } from '../task-view/task-view-dialog/task-view-dialog';
import { TaskService } from '../../../services/tasks/task.service';

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [
    AddTask, TaskViewDialog
  ],
  templateUrl: './task-dialog.html',
  styleUrl: './task-dialog.scss',
})
export class TaskDialog implements AfterViewInit {
  readonly dialogService = inject(DialogService);
  readonly DialogType = DialogType;
  readonly taskService = inject(TaskService);

  @ViewChild('dialog')
  dialog!: ElementRef<HTMLDialogElement>;

  private readonly overlayContainer = inject(OverlayContainer);

  private observer?: MutationObserver;
  private isClosing = false;

  /**
   * Lifecycle hook that is called after the component view has been initialized.
   * Opens the dialog and moves the overlay container inside the dialog.
   */
  ngAfterViewInit(): void {
    this.dialog.nativeElement.showModal();
    this.lockBodyScroll();

    requestAnimationFrame(() => {
      this.moveOverlayIntoDialog();
    });
  }

  /**
   * Start the dialog close animation if not already closing.
   */
  startCloseAnimation(): void {
    if (this.isClosing) {
      return;
    }

    this.isClosing = true;
    this.dialog.nativeElement.classList.add('closing');
    this.unlockBodyScroll();
  }

  /**
   * Cancel event handler for closing the dialog.
   *
   * @param event - The cancel event from the dialog.
   */
  onCancel(event: Event): void {
    event.preventDefault();
    this.startCloseAnimation();
  }

  /**
   * Handle dialog animation end events to finalize closing behavior.
   *
   * @param event - Animation event emitted by the dialog element.
   */
  animationFinished(event: AnimationEvent): void {
    if (event.target !== this.dialog.nativeElement) {
      return;
    }

    if (
      event.animationName !== 'dialogOut' &&
      event.animationName !== 'dialogOutMobile'
    ) {
      return;
    }

    this.moveOverlayBackToBody();
    this.observer?.disconnect();

    const dialog = this.dialog.nativeElement;
    dialog.classList.remove('closing');
    dialog.close();

    this.isClosing = false;
    this.taskService.clearSelectedTask();
    this.dialogService.clear();
  }

  /**
   * Move the overlay container element into the dialog for proper overlay rendering.
   */
  private moveOverlayIntoDialog(): void {
    const container = this.overlayContainer.getContainerElement();

    if (container.parentElement !== this.dialog.nativeElement) {
      this.dialog.nativeElement.appendChild(container);

      this.observer?.disconnect();
      this.observer = undefined;
    }
  }

  /**
   * Restore the overlay container to the document body after the dialog closes.
   */
  private moveOverlayBackToBody(): void {
    const container = this.overlayContainer.getContainerElement();

    if (container.parentElement !== document.body) {
      document.body.appendChild(container);
    }
  }

  /**
   * Prevent body scrolling while the dialog is open.
   */
  private lockBodyScroll(): void {
    document.body.classList.add('dialog-open');
  }

  /**
   * Restore body scrolling when the dialog is closing.
   */
  private unlockBodyScroll(): void {
    document.body.classList.remove('dialog-open');
  }
}