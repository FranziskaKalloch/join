import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  message = signal('');
  visible = signal(false);

  private hideTimer?: ReturnType<typeof setTimeout>;

  /**
   * Displays a success toast message for a short period of time.
   *
   * If another toast is already scheduled to disappear, the existing
   * timer is cleared before starting a new one.
   *
   * @param message The message to display in the toast.
   */
  success(message: string): void {
    this.message.set(message);
    this.visible.set(true);

    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }

    this.hideTimer = setTimeout(() => {
      this.visible.set(false);
    }, 800);
  }
}
