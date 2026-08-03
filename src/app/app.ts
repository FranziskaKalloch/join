import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from './layout/toast/toast/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('join');
  protected readonly showSplash = signal(true);

  /**
   * Handle the splash screen animation end event and hide the splash screen.
   *
   * @param event - Animation event emitted at the end of the splash sequence.
   */
  onSplashAnimationEnd(event: AnimationEvent): void {
    this.showSplash.set(false);
  }
}
