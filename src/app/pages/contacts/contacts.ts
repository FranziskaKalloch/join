import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';

import { Contact } from '../../interfaces/contacts/contact';
import { ContactDialog } from '../../pages/contacts/contact-dialog/contact-dialog/contact-dialog';
import { ContactService } from '../../services/contacts/contact.service';
import { DialogService, DialogType } from '../../services/dialog/dialog.service';
import { TaskService } from '../../services/tasks/task.service';
import { ContactDetails } from './contact-details/contact-details';
import { ContactList } from './contact-list/contact-list';

/**
 * Displays and manages the contacts view.
 *
 * Loads all contacts on initialization, keeps them in sync via a
 * subscription to contact changes, and allows the user to select or
 * clear a contact. Also provides access to the dialog service for
 * opening contact-related dialogs (e.g. add/edit contact).
 */
@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, ContactList, ContactDetails, ContactDialog],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss',
})
export class Contacts implements OnInit {
  /** Service for managing and retrieving contact data. */
  private contactService = inject(ContactService);

  /** Service for managing and retrieving task data. */
  private taskService = inject(TaskService);

  /** Signal holding the list of all contacts. */
  contacts = this.contactService.contacts;
  selectedContact = this.contactService.selectedContact;

  /**
   * Lifecycle hook that initializes the component by loading contacts 
   * and subscribing to real-time contact changes.
   */
  ngOnInit() {
    this.contactService.loadContacts();
    this.contactService.subscribeToContactChanges();
  }

  /**
   * Lifecycle hook that cleans up subscriptions when the component is destroyed.
   */
  ngOnDestroy(): void {
    this.contactService.unsubscribeFromContactChanges();
  }

  /**
   * Selects a contact and updates the selected contact state.
   * 
   * @param contact The contact to select.
   */
  selectContact(contact: Contact): void {
    this.contactService.selectedContact.set(contact);
  }

  /**
   * Deletes or clears the currently selected contact.
   */
  clearSelectedContact(): void {
    this.contactService.deleteSelectedContact();
  }

  /** Service for opening and managing dialogs (e.g. add/edit contact). */
  readonly dialogService = inject(DialogService);

  /** Enum of available dialog types, exposed for use in the template. */
  readonly DialogType = DialogType;
}