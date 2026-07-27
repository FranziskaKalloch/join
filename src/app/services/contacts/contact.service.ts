import { inject, Injectable, signal } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';

import { Contact as ContactInterface } from '../../interfaces/contacts/contact';
import { splitFullName } from '../../utils/name.util/name.util';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private supabaseService = inject(SupabaseService);
  contacts = signal<ContactInterface[]>([]);
  selectedContact = signal<ContactInterface | null>(null);
  channels: RealtimeChannel | undefined;

  private bubbleColors = [
    '#FF7A00',
    '#FF5EB3',
    '#6E52FF',
    '#9327FF',
    '#00BEE8',
    '#1FD7C1',
    '#FF745E',
    '#FFA35E',
    '#FC71FF',
    '#FFC702',
    '#0038FF',
    '#C3FF2B',
    '#FFE62B',
    '#FF4646',
    '#FFBB2B',
  ];

  /**
   * Loads all contacts from the Supabase database.
   * Maps the database fields to the contact interface and updates
   * the contacts signal.
   *
   * If a contact is currently selected, the selected contact is updated
   * with the latest database values.
   *
   * @returns A promise containing the loaded contacts or an empty array
   * if the request was unsuccessful.
   */
  async loadContacts(): Promise<ContactInterface[]> {
    const { data, error } = await this.supabaseService.supabase
      .from('user_join')
      .select('*')
      .order('user_firstname', { ascending: true });

    if (!error && data) {
      const mappedContacts: ContactInterface[] = data.map((contact: any) => ({
        id: contact.id,
        firstname: contact.user_firstname,
        lastname: contact.user_lastname,
        email: contact.user_mail,
        phone: contact.user_phone,
        initials: this.getInitials(contact.user_firstname, contact.user_lastname),
        colors: this.getBubbleColors(contact.id || 0),
      }));
      this.contacts.set(mappedContacts);
      const selectedContact = this.selectedContact();
      if (selectedContact) {
        const updatedSelectedContact = mappedContacts.find(
          (contact) => contact.id === selectedContact.id,
        );

        if (updatedSelectedContact) {
          this.selectedContact.set(updatedSelectedContact);
        }
      }
      return mappedContacts;
    }
    return [];
  }

  /**
   * Retrieves all contacts by loading them from the database.
   *
   * @returns A promise containing an array of contacts.
   */
  async getContacts(): Promise<ContactInterface[]> {
    return this.loadContacts();
  }

  /**
   * Creates the initials of a contact using the first letter
   * of the first name and last name.
   *
   * @param firstName The contact's first name.
   * @param lastName The contact's last name.
   * @returns The uppercase initials of the contact.
   */
  getInitials(firstName?: string, lastName?: string): string {
    const firstLetter = firstName && firstName[0] ? firstName[0].toUpperCase() : '';
    const secondLetter = lastName && lastName[0] ? lastName[0].toUpperCase() : '';
    return firstLetter + secondLetter;
  }

  /**
   * Returns a bubble color based on the contact's ID.
   * The modulo operator ensures that the color index always remains
   * within the available color array.
   *
   * @param id The ID of the contact.
   * @returns The assigned hexadecimal color value.
   */
  getBubbleColors(id: number): string {
    const index = id % this.bubbleColors.length;
    return this.bubbleColors[index];
  }

  /**
   * Checks whether a contact with the given full name already exists
   * in the database.
   *
   * When editing a contact, an optional contact ID can be excluded
   * from the duplicate check.
   *
   * @param fullName The complete name of the contact.
   * @param excludeId Optional ID of a contact that should be excluded.
   * @returns A promise resolving to true if the contact exists,
   * otherwise false.
   */
  async contactExists(fullName: string, excludeId?: number): Promise<boolean> {
    const { firstname, lastname } = splitFullName(fullName);

    let query = this.supabaseService.supabase
      .from('user_join')
      .select('id')
      .eq('user_firstname', firstname)
      .eq('user_lastname', lastname);

    if (excludeId !== undefined) {
      query = query.not('id', 'eq', excludeId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      return false;
    }

    return !!data;
  }

  /**
   * Adds a new contact to the Supabase database.
   * Reloads the contact list and selects the newly created contact
   * after a successful insertion.
   *
   * @param contact The contact that should be added.
   * @returns A promise resolving to true if the contact was added
   * successfully, otherwise false.
   */
  async addContact(contact: ContactInterface): Promise<boolean> {
    const { data, error } = await this.supabaseService.supabase
      .from('user_join')
      .insert({
        user_firstname: contact.firstname,
        user_lastname: contact.lastname,
        user_mail: contact.email,
        user_phone: contact.phone,
        auth_user_id: contact.authUserId,
      })
      .select()
      .single();

    if (error) {
      return false;
    }

    const contacts = await this.loadContacts();
    const newContact = contacts.find((c) => c.id === data.id);

    if (newContact) {
      this.selectedContact.set(newContact);
    }

    return true;
  }

  /**
   * Updates an existing contact in the Supabase database.
   * Reloads the contact list after a successful update.
   *
   * @param contact The contact containing the updated values.
   * @returns A promise resolving to true if the contact was updated
   * successfully, otherwise false.
   */
  async updateContact(contact: ContactInterface): Promise<boolean> {
    const { error } = await this.supabaseService.supabase
      .from('user_join')
      .update({
        user_firstname: contact.firstname,
        user_lastname: contact.lastname,
        user_mail: contact.email,
        user_phone: contact.phone,
      })
      .eq('id', contact.id);

    if (error) {
      return false;
    }

    await this.loadContacts();
    return true;
  }

  /**
   * Removes the currently selected contact from the local contacts signal.
   * Clears the selected contact afterward.
   *
   * This method only updates the local state and does not delete
   * the contact from the database.
   *
   * @returns Nothing.
   */
  deleteSelectedContact(): void {
    const contact = this.selectedContact();
    if (!contact) return;
    this.contacts.update((contacts) => contacts.filter((c) => c.id !== contact.id));
    this.selectedContact.set(null);
  }

  /**
   * Subscribes to real-time changes in the user_join database table.
   * Reloads all contacts whenever a contact is inserted, updated or deleted.
   *
   * @returns Nothing.
   */
  subscribeToContactChanges() {
    this.channels = this.supabaseService.supabase
      .channel('custom-all-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_join' }, (payload) => {
        console.log('Change received!', payload);
        this.loadContacts();
      })
      .subscribe();
  }

  /**
   * Removes the active real-time subscription for contact changes.
   * Clears the stored channel after it has been removed.
   *
   * @returns Nothing.
   */
  unsubscribeFromContactChanges() {
    if (this.channels) {
      this.supabaseService.supabase.removeChannel(this.channels);
      this.channels = undefined;
    }
  }
}
