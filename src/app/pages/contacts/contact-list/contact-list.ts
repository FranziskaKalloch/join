import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact as ContactInterface } from '../../../interfaces/contacts/contact';
import { DialogService, DialogType } from '../../../services/dialog/dialog.service';
import { ContactService } from '../../../services/contacts/contact.service';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss',
})
export class ContactList {
  contacts = input<ContactInterface[]>([]);
  contactSelected = output<ContactInterface>();

  readonly contactService = inject(ContactService);
  readonly dialogService = inject(DialogService);
  selectedContact = this.contactService.selectedContact;
  readonly DialogType = DialogType;

  /**
   * Sorts the contact list alphabetically and groups them by the first letter of their first name.
   */
  get groupedContacts(): { letter: string; contacts: ContactInterface[] }[] {
    const sorted = [...this.contacts()].sort((a, b) => {
      const nameA = `${a.firstname || ''} ${a.lastname || ''}`.trim();
      const nameB = `${b.firstname || ''} ${b.lastname || ''}`.trim();
      return nameA.localeCompare(nameB);
    });

    const groups: { [key: string]: ContactInterface[] } = {};
    for (const contact of sorted) {
      if (!contact.firstname) continue;
      const firstLetter = contact.firstname.charAt(0).toUpperCase();
      if (!groups[firstLetter]) groups[firstLetter] = [];
      groups[firstLetter].push(contact);
    }

    return Object.keys(groups).sort().map((letter) => ({
      letter,
      contacts: groups[letter],
    }));
  }

  /**
   * Selects the given contact and emits the selection event.
   * 
   * @param contact The contact to select.
   */
  onSelectContact(contact: ContactInterface): void {
    this.contactService.selectedContact.set(contact);
    this.contactSelected.emit(contact);
  }

  /**
   * Resets the selected contact and opens the contact dialog for creation or editing.
   */
  openDialog(): void {
    this.contactService.selectedContact.set(null);
    this.dialogService.open(DialogType.Contact);
  }

}