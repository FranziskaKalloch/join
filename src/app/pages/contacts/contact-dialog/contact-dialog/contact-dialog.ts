import { AfterViewInit, Component, computed, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ContactService } from '../../../../services/contacts/contact.service';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { ToastService } from '../../../../services/toast/toast-service';
import { fullNameValidator, splitFullName } from '../../../../utils/name.util/name.util';
import { emailValidator, emailExistsValidator } from '../../../../utils/email.util/email.util';
import { phoneValidator } from '../../../../utils/phone.util/phone.util/phone.util';

@Component({
  selector: 'app-contact-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './contact-dialog.html',
  styleUrl: './contact-dialog.scss',
})

export class ContactDialog implements AfterViewInit, OnInit {
  private readonly dialogService = inject(DialogService);
  private readonly contactService = inject(ContactService);
  private toastService = inject(ToastService);

  selectedContact = this.contactService.selectedContact;

  isEditMode = computed(() => this.selectedContact() !== null);

  @ViewChild('dialog')
  dialog!: ElementRef<HTMLDialogElement>;

  private isClosing = false;

  /**
   * Shows the dialog modal after the view is initialized.
   *
   * @returns void
   */
  ngAfterViewInit(): void {
    this.dialog.nativeElement.showModal();
  }

  /**
   * Initializes the form with the selected contact if edit mode is active.
   *
   * @returns void
   */
  ngOnInit(): void {
    const contact = this.selectedContact();

    if (!contact) {
      return;
    }

    this.newUserForm.patchValue({
      name: `${contact.firstname} ${contact.lastname}`,
      email: contact.email,
      phone: contact.phone?.toString() ?? '',
    });
  }

  /**
   * Starts the dialog close animation.
   *
   * @returns void
   */
  closeDialog(): void {
    this.startCloseAnimation();
  }

  /**
   * Adds the closing class to begin the dialog close animation.
   *
   * @returns void
   */
  private startCloseAnimation(): void {
    if (this.isClosing) {
      return;
    }

    this.isClosing = true;
    this.dialog.nativeElement.classList.add('closing');
  }

  /**
   * Cancels the dialog when the user dismisses it.
   *
   * @param event - The cancel event triggered by the dialog.
   * @returns void
   */
  onCancel(event: Event): void {
    event.preventDefault();
    this.startCloseAnimation();
  }

  /**
   * Closes the dialog when the user clicks outside its bounds.
   *
   * @param event - Mouse event from the dialog backdrop click.
   * @returns void
   */
  onDialogClick(event: MouseEvent): void {
    const dialog = this.dialog.nativeElement;
    const rect = dialog.getBoundingClientRect();

    const clickedInside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!clickedInside) {
      this.startCloseAnimation();
    }
  }

  /**
   * Finishes closing the dialog after the exit animation ends.
   *
   * @param event - Animation event emitted by the dialog.
   * @returns void
   */
  animationFinished(event: AnimationEvent): void {
    if (event.target !== this.dialog.nativeElement) {
      return;
    }

    if (event.animationName !== 'dialogOut' && event.animationName !== 'dialogOutMobile') {
      return;
    }

    const dialog = this.dialog.nativeElement;
    dialog.classList.remove('closing');
    dialog.close();
    this.isClosing = false;
    this.dialogService.clear();
  }

  /**
   * Reactive form group for contact data entry.
   */
  newUserForm = new FormGroup({
    name: new FormControl('', {
      validators: [
        Validators.required,
        Validators.pattern(/^[A-Za-zÄÖÜäöüß\s'-]+$/),
        fullNameValidator(),
      ],
      updateOn: 'blur',
    }),
    email: new FormControl('', {
      validators: [Validators.required, emailValidator()],
      asyncValidators: [
        emailExistsValidator(
          this.contactService,
          () => this.selectedContact()?.id,
        ),
      ],
      updateOn: 'blur',
    }),
    phone: new FormControl('', {
      validators: [Validators.required, phoneValidator()],
      updateOn: 'blur',
    }),
  });

  /**
   * Getter for the name control.
   */
  get name() {
    return this.newUserForm.controls.name;
  }

  /**
   * Getter for the email control.
   */
  get email() {
    return this.newUserForm.controls.email;
  }

  /**
   * Getter for the phone control.
   */
  get phone() {
    return this.newUserForm.controls.phone;
  }

  formMessage = '';
  messageType: 'success' | 'error' | '' = '';

  /**
   * Submits the form and saves a new or updated contact.
   *
   * @returns A promise that resolves after submit completes.
   */
  async onSubmit(): Promise<void> {
    if (this.newUserForm.invalid) {
      this.newUserForm.markAllAsTouched();
      return;
    }

    const editMode = this.isEditMode();
    const success = await this.saveContact();

    if (success) {
      this.handleSuccess(editMode);
    }
  }

  /**
   * Saves contact data via the contact service.
   *
   * @returns True when the save succeeded.
   */
  private async saveContact(): Promise<boolean> {
    const contact = this.buildContactData();

    return this.isEditMode()
      ? this.contactService.updateContact(contact)
      : this.contactService.addContact(contact);
  }

  /**
   * Build contact payload from form values.
   *
   * @returns Contact object ready for persistence.
   */
  private buildContactData() {
    const { firstname, lastname } = splitFullName(this.name.value!);

    return {
      id: this.selectedContact()?.id,
      firstname,
      lastname,
      email: this.email.value!,
      phone: this.phone.value!,
    };
  }

  /**
   * Handles successful contact save actions.
   *
   * @param editMode - Whether the contact was updated rather than created.
   */
  private handleSuccess(editMode: boolean): void {
    this.newUserForm.reset();
    this.closeDialog();

    if (!editMode) {
      this.toastService.success('Contact successfully created.');
    }
  }

  /**
   * Removes the selected contact and closes the dialog.
   *
   * @returns void
   */
  onRemoveSelectedContact() {
    this.contactService.deleteSelectedContact();
    this.closeDialog();
  }
}
