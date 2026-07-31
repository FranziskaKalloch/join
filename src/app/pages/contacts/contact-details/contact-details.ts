import { Component, input, output, inject } from '@angular/core';

import { Contact as ContactInterface } from '../../../interfaces/contacts/contact';

import { DialogService, DialogType } from '../../../services/dialog/dialog.service';
import { ContactService } from '../../../services/contacts/contact.service';

@Component({
  selector: 'app-contact-details',
  imports: [],
  templateUrl: './contact-details.html',
  styleUrl: './contact-details.scss',
})
export class ContactDetails {
  contact = input<ContactInterface | null>(null);
  removeSelectedContact = output<void>();
  readonly dialogService = inject(DialogService);
  readonly contactService = inject(ContactService);
  readonly DialogType = DialogType;

  isContactOptionsOpen = false;

  /**
   * Toggle the contact options dropdown open or closed.
   */
  toggleContactOptions(): void {
    this.isContactOptionsOpen = !this.isContactOptionsOpen;
  }

  /**
   * Close the contact options dropdown.
   */
  closeContactOptions(): void {
    this.isContactOptionsOpen = false;
  }

  /**
   * Emit an event to remove the currently selected contact.
   */
  onRemoveSelectedContact(): void {
    this.closeContactOptions();
    this.removeSelectedContact.emit();
  }

  /**
   * Open the contact edit dialog for the currently selected contact.
   */
  editContact(): void {
    const contact = this.contact();

    if (!contact) {
      return;
    }

    this.closeContactOptions();
    this.contactService.selectedContact.set(contact);
    this.dialogService.open(DialogType.Contact);
  }
}
