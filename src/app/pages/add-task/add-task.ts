import { OverlayModule } from '@angular/cdk/overlay';
import {
  Component,
  computed,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  Output,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';

import { Contact } from '../../interfaces/contacts/contact';
import { Subtask } from '../../interfaces/task/subtask';
import { Task } from '../../interfaces/task/task';
import { TaskCategory, TaskPriority, TaskStatus } from '../../interfaces/task/task.types';
import { AuthService } from '../../services/auth/auth.service';
import { DialogService, DialogType } from '../../services/dialog/dialog.service';
import { TaskService } from '../../services/tasks/task.service';
import { ToastService } from '../../services/toast/toast-service';
import { formatDate, getTodayDateString, noPastDateValidator, parseLocalDate } from '../../utils/date.util/date.util';
import { AssignedTo } from './assigned-to/assigned-to';
import { Subtasks } from './subtasks/subtasks/subtasks';

@Component({
  selector: 'app-add-task',
  imports: [
    ReactiveFormsModule,
    AssignedTo,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    Subtasks,
    OverlayModule,
  ],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
})

export class AddTask {
  minDate = getTodayDateString();
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);
  private toastService = inject(ToastService);
  isSaving = false;
  initialSubtasks: Subtask[] = [];
  subtasksComponent = viewChild(Subtasks);
  assignedToComponent = viewChild(AssignedTo);
  today = new Date();
  readonly dialogService = inject(DialogService);
  readonly DialogType = DialogType;
  type = signal<DialogType | null>(null);

  addTaskForm = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl(''),
    dueDate: new FormControl<Date | null>(
      null,
      [Validators.required, noPastDateValidator()]
    ),
    priority: new FormControl('medium', Validators.required),
    category: new FormControl('', Validators.required),
    assignedContactIds: new FormControl<number[]>([]),
  });

  /**
  * Returns the date form control.
  */
  get dueDateControl() {
    return this.addTaskForm.get('dueDate');
  }

  selectedContacts: Contact[] = [];

  /**
   * Callback when assigned contacts change in the child component.
   *
   * @param contacts - Selected contacts.
   */
  onAssignedContactsChange(contacts: Contact[]): void {
    this.selectedContacts = contacts;
  }

  subtasks = signal<Subtask[]>([]);

  /**
   * Callback when subtasks change in the child component.
   *
   * @param subtasks - Updated subtask list.
   */
  onSubtasksChange(subtasks: Subtask[]): void {
    this.subtasks.set(subtasks);
  }

  /**
   * Create or update a task when the form is submitted.
   */
  async onSubmit(): Promise<void> {
    this.addTaskForm.markAllAsTouched();

    if (this.addTaskForm.invalid) return;

    this.isSaving = true;

    try {
      await this.saveTask();
    } finally {
      this.isSaving = false;
    }
  }

  private async saveTask(): Promise<void> {
    if (this.isEditMode) {
      await this.updateTask();
      return;
    }

    await this.createTask();
    await this.finishCreateTask();
  }

  private async updateTask(): Promise<void> {
    await this.taskService.updateTask(this.buildUpdateTask());
    this.dialogService.open(DialogType.TaskDetails);
  }

  private async createTask(): Promise<void> {
    await this.taskService.createTask(this.buildCreateTask());
    this.toastService.success('Task added to board.');
  }

  private async finishCreateTask(): Promise<void> {
    if (this.isDialog) {
      this.close.emit();
      return;
    }

    await this.router.navigate(['/board']);
  }

  /**
   * Returns the title form control.
   */
  get title() {
    return this.addTaskForm.controls.title;
  }

  /**
   * Returns the due date form control.
   */
  get dueDate() {
    return this.addTaskForm.controls.dueDate;
  }

  /**
   * Returns the category form control.
   */
  get category() {
    return this.addTaskForm.controls.category;
  }

  /**
   * Reset the form and clear child component state.
   */
  onClear(): void {
    this.addTaskForm.reset();
    this.addTaskForm.get('priority')?.setValue('medium');
    this.subtasksComponent()?.clear();
    this.assignedToComponent()?.clear();
  }

  /**
   * Build a new task payload from the form values.
   *
   * @returns Task payload without id and createdAt.
   */
  private buildCreateTask(): Omit<Task, 'id' | 'createdAt'> {
    const { title, description, dueDate, priority, category } =
      this.addTaskForm.getRawValue();

    return {
      title: title!,
      description: description ?? '',
      dueDate: formatDate(dueDate as Date),
      priority: priority as TaskPriority,
      category: category as TaskCategory,
      status: this.selectedStatus,
      assignedContactIds: this.selectedContacts.map((c) => c.id!),
      subtasks: this.subtasks(),
      authUserId: this.authService.currentUser()?.id,
    };
  }
  /**
   * Build an updated task payload based on the existing selected task and form values.
   *
   * @returns Updated task object.
   */
  private buildUpdateTask(): Task {
    const task = this.selectedTask();

    if (!task) {
      throw new Error('No task selected.');
    }

    const { title, description, dueDate, priority, category } =
      this.addTaskForm.getRawValue();

    return {
      ...task,
      title: title!,
      description: description ?? '',
      dueDate: formatDate(dueDate as Date),
      priority: priority as TaskPriority,
      category: category as TaskCategory,
      assignedContactIds: this.selectedContacts.map((c) => c.id!),
      subtasks: this.subtasks(),
    };
  }

  /**
   * Available task categories for the category dropdown.
   */
  categories = [
    { label: 'Technical Task', value: 'technical-task' },
    { label: 'User Story', value: 'user-story' },
  ];

  /**
   * Set the selected task priority.
   *
   * @param value - Priority value.
   */
  setPriority(value: string): void {
    this.addTaskForm.get('priority')?.setValue(value);
  }

  /**
   * Determine whether the specified priority is currently selected.
   *
   * @param value - Priority value to check.
   * @returns True when the priority is selected.
   */
  isPrioritySelected(value: string): boolean {
    return this.addTaskForm.get('priority')?.value === value;
  }

  /**
   * Set the selected category and close the category dropdown.
   *
   * @param value - Category value.
   */
  setCategory(value: string): void {
    this.addTaskForm.get('category')?.setValue(value);
    this.isCategoryDropdownOpen = false;
  }

  /**
   * Whether the category dropdown is currently open.
   */
  isCategoryDropdownOpen = false;

  /**
   * Toggle the category dropdown visibility.
   */
  toggleCategoryDropdown(): void {
    this.addTaskForm.controls.category.markAsTouched();
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

  /**
   * Get the label for the currently selected category.
   *
   * @returns Category display label.
   */
  getCategoryLabel(): string {
    const value = this.addTaskForm.get('category')?.value;
    return this.categories.find((c) => c.value === value)?.label ?? '';
  }

  /**
   * Close the category dropdown when clicking outside the component.
   *
   * @param event - Document click event.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside && this.isCategoryDropdownOpen) {
      this.isCategoryDropdownOpen = false;
    }
  }

  /**
   * Update the assigned contact IDs in the form.
   *
   * @param ids - Selected contact IDs.
   */
  setAssignedContactIds(ids: number[]): void {
    this.addTaskForm.get('assignedContactIds')?.setValue(ids);
  }

  isTaskDialog = computed(() => this.dialogService.current().type === DialogType.AddTask);

  @Input() isEditMode = false;

  readonly selectedTask = this.taskService.selectedTask;

  @Input() isDialog = false;
  @Output() close = new EventEmitter<void>();

  /**
   * Close the dialog or navigate back to the board.
   */
  closeDialog() {
    if (this.isDialog) {
      this.close.emit();
    } else {
      this.router.navigate(['/board']);
    }
  }

  /**
   * Initial task status provided by the dialog data.
   */
  get initialStatus(): TaskStatus | undefined {
    return (this.dialogService.current().data as { status: TaskStatus } | undefined)?.status;
  }

  /**
   * Get the priority icon path for the given priority value.
   *
   * @param priority - Task priority.
   * @returns Image path for the priority icon.
   */
  getPriorityIcon(priority: 'urgent' | 'medium' | 'low'): string {
    const suffix = this.isPrioritySelected(priority) ? '-white' : '';
    return `/assets/img/components/task/priority-symbol-${priority}${suffix}.svg`;
  }

  /**
   * Initialize the component state after bindings are set.
   */
  ngOnInit(): void {
    this.selectedStatus = this.initialStatus ?? 'todo';

    if (this.isEditMode) {
      this.loadTaskIntoForm();
    } else {
      this.initialSubtasks = [];
    }
  }

  /**
   * Load the selected task details into the form for edit mode.
   */

  private loadTaskIntoForm(): void {
    const task = this.selectedTask();

    if (!task) {
      return;
    }

    const dueDate = parseLocalDate(task.dueDate);

    this.patchTaskForm(task, dueDate);
    this.updateDueDateValidator(dueDate);
    this.loadSubtasks(task.subtasks);
  }

  private patchTaskForm(task: Task, dueDate: Date): void {
    this.addTaskForm.patchValue({
      title: task.title,
      description: task.description,
      dueDate,
      priority: task.priority,
      category: task.category,
      assignedContactIds: task.assignedContactIds,
    });
  }

  private updateDueDateValidator(dueDate: Date): void {
    this.addTaskForm.controls.dueDate.setValidators([
      Validators.required,
      noPastDateValidator(dueDate),
    ]);
    this.addTaskForm.controls.dueDate.updateValueAndValidity();
    const control = this.addTaskForm.controls.dueDate;
  }

  private loadSubtasks(subtasks: Subtask[]): void {
    this.initialSubtasks = [...subtasks];
    this.subtasks.set([...subtasks]);
  }

  selectedStatus: TaskStatus = 'todo';
}
