import { inject, Injectable, signal } from '@angular/core';
import { User } from '@supabase/supabase-js';

import { Contact } from '../../interfaces/contacts/contact';
import { splitFullName } from '../../utils/name.util/name.util';
import { ContactService } from '../contacts/contact.service';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabaseService = inject(SupabaseService);
  private contactService = inject(ContactService);
  isLoggedIn = signal<boolean>(false);
  currentUser = signal<User | null>(null);

  /**
   * Registers a new user with Supabase and creates a corresponding contact.
   *
   * The method first checks whether a contact with the given name already
   * exists. If the registration succeeds, a new contact is created and
   * linked to the authenticated user.
   *
   * @param fullName The full name of the user.
   * @param email The email address used for registration.
   * @param password The password for the new user account.
   * @returns A promise that resolves with `true` if the user and contact
   * were created successfully, otherwise `false`.
   */
  async signUpNewUser(fullName: string, email: string, password: string): Promise<boolean> {
    const { firstname, lastname } = splitFullName(fullName);

    const { data, error } = await this.supabaseService.supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: 'http://localhost:4200/login',
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return false;
    }

    const contactAdded = await this.contactService.addContact({
      firstname: firstname,
      lastname: lastname,
      email: email,
      authUserId: data.user?.id,
    });
    if (!contactAdded) {
      return false;
    }
    return true;
  }

  /**
   * Signs in a user with email and password via Supabase.
   * Sets the `isLoggedIn` signal to true on successful login.
   *
   * @param email - The user's email address
   * @param password - The user's password
   * @returns true if login was successful, false if credentials were invalid
   */
  async signIn(email: string, password: string): Promise<boolean> {
    const { data, error } = await this.supabaseService.supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error || !data.user) {
      return false;
    }

    this.isLoggedIn.set(true);
    this.currentUser.set(data.user);

    return true;
  }

  /**
   * Signs out the current user and clears the local authentication state.
   *
   * @returns A promise that resolves with true when the logout was successful.
   */
  async signOut(): Promise<boolean> {
    console.log('AuthService signOut started');
    const { error } = await this.supabaseService.supabase.auth.signOut();

    if (error) {
      return false;
    }

    this.currentUser.set(null);
    this.isLoggedIn.set(false);

    return true;
  }

  /**
   * Retrieves the currently authenticated user from Supabase and updates
   * the local authentication state.
   *
   * If no authenticated user exists or an error occurs, the current user
   * is cleared and the logged-in state is set to false.
   *
   * @returns A promise that resolves when the authentication state has been updated.
   */
  async getUser(): Promise<void> {
    const {
      data: { user },
      error,
    } = await this.supabaseService.supabase.auth.getUser();

    if (error || !user) {
      this.currentUser.set(null);
      this.isLoggedIn.set(false);
      return;
    }
    this.currentUser.set(user);
    this.isLoggedIn.set(true);
  }

  /**
   * Signs in a user anonymously via Supabase (guest access without an account).
   * Sets the `isLoggedIn` and `currentUser` signals on successful sign-in.
   *
   * @returns true if sign-in was successful, false otherwise
   */
  async signInAnonymously(): Promise<boolean> {
    const {
      data: { user },
      error,
    } = await this.supabaseService.supabase.auth.signInAnonymously({});

    if (error) {
      return false;
    }
    this.isLoggedIn.set(true);
    this.currentUser.set(user);
    return true;
  }

  showSummaryGreeting = signal(true);

  resetSummaryGreeting(): void {
    this.showSummaryGreeting.set(true);
  }

  hideSummaryGreeting(): void {
    this.showSummaryGreeting.set(false);
  }
}