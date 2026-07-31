import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';

import { Contact } from '../../interfaces/contacts/contact';
import { ContactDialog } from '../../pages/contacts/contact-dialog/contact-dialog/contact-dialog';
import { ContactService } from '../../services/contacts/contact.service';
import { DialogService, DialogType } from '../../services/dialog/dialog.service';
import { TaskService } from '../../services/tasks/task.service';
import { ContactDetails } from './contact-details/contact-details';
import { ContactList } from './contact-list/contact-list';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, ContactList, ContactDetails, ContactDialog],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss',
})
export class Contacts implements OnInit {
  private contactService = inject(ContactService);
  private taskService = inject(TaskService);
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

  readonly dialogService = inject(DialogService);
  readonly DialogType = DialogType;
}