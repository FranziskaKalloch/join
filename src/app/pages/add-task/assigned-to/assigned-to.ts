import {
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
  output,
  computed,
  OnInit,
  input,
  effect,
  ViewChild
} from '@angular/core';
import { Contact } from '../../../interfaces/contacts/contact';
import { ContactService } from '../../../services/contacts/contact.service';
import { UserBubble } from '../../../components/user-bubble/user-bubble';
import { OverlayModule } from '@angular/cdk/overlay';

@Component({
  selector: 'app-assigned-to',
  imports: [UserBubble, OverlayModule],
  templateUrl: './assigned-to.html',
  styleUrl: './assigned-to.scss',
})
export class AssignedTo implements OnInit {
  private contactService = inject(ContactService);
  private elementRef = inject(ElementRef);
  preselectedIds = input<number[]>([]);

  contacts = this.contactService.contacts;
  private initialized = false;

  constructor() {
    effect(() => {
      if (this.initialized) {
        return;
      }

      const ids = this.preselectedIds();
      const contacts = this.contacts();

      if (!contacts.length) {
        return;
      }

      const selected = contacts.filter(contact =>
        ids.includes(contact.id!)
      );

      this.selectedContacts.set(selected);
      this.selectedContactsChange.emit(selected);
      this.initialized = true;
    });
  }

  /**
   * Lifecycle hook to load contacts after component initialization.
   */
  ngOnInit(): void {
    this.contactService.loadContacts();
  }

  selectedContacts = signal<Contact[]>([]);
  isDropdownOpen = false;
  selectedContactsChange = output<Contact[]>();
  searchTerm = signal<string>('');

  filteredContacts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.contacts().filter(
      (contact) =>
        contact.firstname.toLowerCase().includes(term) ||
        contact.lastname.toLowerCase().includes(term),
    );
  });

  /**
   * Update the search term based on user input.
   *
   * @param event - Input event from the search field.
   */
  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  /**
   * Toggle the visibility of the contact selection dropdown.
   */
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  /**
   * Open the contact selection dropdown if it is not already open.
   */
  openDropdown(): void {
    if (this.isDropdownOpen) return;

    setTimeout(() => {
      this.isDropdownOpen = true;
    });
  }

  /**
   * Check whether a contact is currently selected.
   *
   * @param contact - Contact to test.
   * @returns True when the contact is selected.
   */
  isSelected(contact: Contact): boolean {
    return this.selectedContacts().some((c) => c.id === contact.id);
  }

  /**
   * Toggle the selected state of a contact.
   *
   * @param contact - Contact to add or remove from the selected list.
   */
  toggleContact(contact: Contact): void {
    if (this.isSelected(contact)) {
      this.selectedContacts.update((contacts) => contacts.filter((c) => c.id !== contact.id));
    } else {
      this.selectedContacts.update((contacts) => [...contacts, contact]);
    }
    this.selectedContactsChange.emit(this.selectedContacts());
  }

  /**
   * Close the dropdown when clicking outside of the component.
   *
   * @param event - Click event from the document.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  visibleBubbles = computed(() => this.selectedContacts().slice(0, 3));

  remainingCount = computed(() => {
    const total = this.selectedContacts().length;
    return total > 3 ? total - 3 : 0;
  });

  /**
   * Clear all selected contacts, reset the search term, and close the dropdown.
   */
  clear(): void {
    this.selectedContacts.set([]);
    this.searchTerm.set('');
    this.isDropdownOpen = false;

    this.selectedContactsChange.emit([]);
      this.initialized = false;
  }
}
