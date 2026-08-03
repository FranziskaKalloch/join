import { Component, computed, HostListener, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';
import { ContactService } from '../../services/contacts/contact.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private contactService = inject(ContactService);
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;
  isLoggedIn = this.authService.isLoggedIn;
  menuOpen = false;

  /**
   * Returns the contact that belongs to the currently authenticated user.
   *
   * The contact is determined by matching the authenticated user's ID
   * with the contact's authUserId. The computed signal updates
   * automatically whenever the current user or the contacts list changes.
   */
  currentUserContact = computed(() => {
    const user = this.currentUser();

    if (!user) {
      return null;
    }
    return this.contactService.contacts().find((contact) => contact.authUserId === user.id) ?? null;
  });

  /**
   * Toggles the visibility of the user menu.
   *
   * Stops the click event from propagating to prevent the menu
   * from being closed immediately by the document click listener.
   *
   * @param event The mouse event triggered by clicking the menu button.
   */
  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  /**
   * Closes the user menu.
   */
  closeMenu(): void {
    this.menuOpen = false;
  }

  /**
   * Signs the current user out, closes the user menu,
   * and redirects to the login page.
   *
   * @returns A promise that resolves when the logout process has completed.
   */
  async logout(): Promise<void> {
    const logoutSuccessful = await this.authService.signOut();

    if (logoutSuccessful) {
      this.closeMenu();
      await this.router.navigate(['/login']);
    }
  }

  /**
   * Closes the user menu when the user clicks anywhere
   * outside of the menu.
   */
  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeMenu();
  }
}
