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

  async signUpNewUser(fullName: string, email: string, password: string): Promise<boolean> {
    const { firstname, lastname } = splitFullName(fullName);
    const exists = await this.contactService.contactExists(fullName);

    if (exists) {
      console.log('Kontakt existiert bereits');
      return false;
    }
    const { data, error } = await this.supabaseService.supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: 'http://localhost:4200/login',
      },
    });

    if (error) {
      console.log(error); // ERROR MESSAGE
      return false;
    }

    const contactAdded = await this.contactService.addContact({
      firstname: firstname,
      lastname: lastname,
      email: email,
      authUserId: data.user?.id,
    });
    if (!contactAdded) {
      console.log('Kontakt konnte nicht angelegt werden');
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
    const { error } = await this.supabaseService.supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.log(error.message);
      return false;
    }

    this.isLoggedIn.set(true);
    return true;
  }

  /**
   * Signs out the current user and clears the local authentication state.
   *
   * @returns A promise that resolves with true when the logout was successful.
   */
  async signOut(): Promise<boolean> {
    const { error } = await this.supabaseService.supabase.auth.signOut();

    if (error) {
      console.error('Logout failed:', error);
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
}
