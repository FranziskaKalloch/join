import { from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AfterViewInit, Component, computed, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ContactService } from '../../../../services/contacts/contact.service';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { ToastService } from '../../../../services/toast/toast-service';
import { fullNameValidator, splitFullName } from '../../../../utils/name.util/name.util';
import { emailValidator, emailExistsValidator } from '../../../../utils/email.util/email.util';

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

  ngAfterViewInit(): void {
    this.dialog.nativeElement.showModal();
  }

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

  closeDialog(): void {
    this.startCloseAnimation();
  }

  //protected
  private startCloseAnimation(): void {
    if (this.isClosing) {
      return;
    }

    this.isClosing = true;
    this.dialog.nativeElement.classList.add('closing');
  }

  onCancel(event: Event): void {
    event.preventDefault();
    this.startCloseAnimation();
  }

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
      validators: [Validators.required, Validators.pattern(/^[0-9+\s()-]+$/)],
      updateOn: 'blur',
    }),
  });

  get name() {
    return this.newUserForm.controls.name;
  }

  get email() {
    return this.newUserForm.controls.email;
  }

  get phone() {
    return this.newUserForm.controls.phone;
  }

  formMessage = '';
  messageType: 'success' | 'error' | '' = '';

  async onSubmit(): Promise<void> {
    if (this.newUserForm.invalid) {
      this.newUserForm.markAllAsTouched();
      return;
    }

    const { firstname, lastname } = splitFullName(this.name.value!);
    const editMode = this.isEditMode();

    let success = false;

    if (this.isEditMode()) {
      success = await this.contactService.updateContact({
        id: this.selectedContact()!.id,
        firstname,
        lastname,
        email: this.email.value!,
        phone: this.phone.value!,
      });
    } else {
      success = await this.contactService.addContact({
        firstname,
        lastname,
        email: this.email.value!,
        phone: this.phone.value!,
      });
    }

    if (success) {
      this.newUserForm.reset();
      this.closeDialog();

      if (!editMode) {
        this.toastService.success('Contact successfully created.');
      }
    }
  }

  onRemoveSelectedContact() {
    this.contactService.deleteSelectedContact();
    this.closeDialog();
  }
}
