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
  // selectedContact = signal<Contact | null>(null);
  selectedContact = this.contactService.selectedContact;

  ngOnInit() {
    this.contactService.loadContacts();
    this.contactService.subscribeToContactChanges();
  }

  ngOnDestroy(): void {
    this.contactService.unsubscribeFromContactChanges();
  }

  // selectContact(contact: Contact): void {
  //   this.selectedContact.set(contact);
  // }

  selectContact(contact: Contact): void {
    this.contactService.selectedContact.set(contact);
  }

  clearSelectedContact(): void {
    this.contactService.deleteSelectedContact();
  }

  readonly dialogService = inject(DialogService);
  readonly DialogType = DialogType;
}
