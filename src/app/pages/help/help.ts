import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-help',
  imports: [],
  templateUrl: './help.html',
  styleUrl: './help.scss',
})
export class Help {
  private location = inject(Location);

  /**
   * Navigate back to the previous location.
   */
  goBack(): void {
    this.location.back();
  }
}
