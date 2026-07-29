import { Component, inject, ElementRef, HostListener, signal, computed, Output, EventEmitter, Input, viewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../../services/tasks/task.service';
import { noPastDateValidator, getTodayDateString } from '../../utils/date.util/date.util';
import { AssignedTo } from './assigned-to/assigned-to';
import { Contact } from '../../interfaces/contacts/contact';
import { TaskPriority, TaskCategory, TaskStatus } from '../../interfaces/task/task.types';
import { Subtasks } from './subtasks/subtasks/subtasks';
import { Subtask } from '../../interfaces/task/subtask';
import { DialogService, DialogType } from '../../services/dialog/dialog.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OverlayModule } from '@angular/cdk/overlay';
import { Task } from '../../interfaces/task/task';
import { ToastService } from '../../services/toast/toast-service';


@Component({
  selector: 'app-add-task',
  imports: [ReactiveFormsModule,
    AssignedTo,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    Subtasks,
    OverlayModule
  ],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
})
export class AddTask {
  private taskService = inject(TaskService);
  private router = inject(Router);
  minDate = getTodayDateString();
  private elementRef = inject(ElementRef);
  isSaving = false;
  initialSubtasks: Subtask[] = [];
  subtasksComponent = viewChild(Subtasks);
  assignedToComponent = viewChild(AssignedTo);
  private toastService = inject(ToastService);
  today = new Date();


  addTaskForm = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl(''),
    dueDate: new FormControl('', [Validators.required, noPastDateValidator()]),
    priority: new FormControl('medium', Validators.required),
    category: new FormControl('', Validators.required),
    assignedContactIds: new FormControl<number[]>([]),
  });

  get dueDateControl() {
    return this.addTaskForm.get('dueDate');
  }

  // Method to set the priority value in the form
  setPriority(value: string): void {
    this.addTaskForm.get('priority')?.setValue(value);
  }
  // Method to check if a specific priority is selected
  isPrioritySelected(value: string): boolean {
    return this.addTaskForm.get('priority')?.value === value;
  }

  selectedContacts: Contact[] = [];

  // Method to store the contacts selected in the AssignedTo dropdown
  onAssignedContactsChange(contacts: Contact[]): void {
    this.selectedContacts = contacts;
  }

  subtasks = signal<Subtask[]>([]);

  onSubtasksChange(subtasks: Subtask[]): void {
    this.subtasks.set(subtasks);
  }

  async onSubmit(): Promise<void> {
    this.addTaskForm.markAllAsTouched();

    if (this.addTaskForm.invalid) return;

    this.isSaving = true;

    try {
      if (this.isEditMode) {
        await this.taskService.updateTask(this.buildUpdateTask());
        this.dialogService.open(DialogType.TaskDetails);
        return;
      } else {
        await this.taskService.createTask(this.buildCreateTask());
        this.toastService.success('Task added to board.');
      }

      if (this.isDialog) {
        this.close.emit();
      } else {
        this.router.navigate(['/board']);
      }

    } finally {
      this.isSaving = false;
    }
  }

  get title() {
    return this.addTaskForm.controls.title;
  }

  get dueDate() {
    return this.addTaskForm.controls.dueDate;
  }

  get category() {
    return this.addTaskForm.controls.category;
  }

  // Resets the form to its default state (priority back to medium)
  onClear(): void {
    this.addTaskForm.reset();
    this.addTaskForm.get('priority')?.setValue('medium');
    this.subtasksComponent()?.clear();
    this.assignedToComponent()?.clear();
  }

  selectedStatus: TaskStatus = 'todo';

  private buildCreateTask(): Omit<Task, 'id' | 'createdAt'> {
    const { title, description, dueDate, priority, category } =
      this.addTaskForm.getRawValue();

    return {
      title: title!,
      description: description ?? '',
      dueDate: dueDate!,
      priority: priority as TaskPriority,
      category: category as TaskCategory,
      status: this.selectedStatus,
      assignedContactIds: this.selectedContacts.map(c => c.id!),
      subtasks: this.subtasks(),
    };
  }
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
      dueDate: dueDate!,
      priority: priority as TaskPriority,
      category: category as TaskCategory,
      assignedContactIds: this.selectedContacts.map(c => c.id!),
      subtasks: this.subtasks(),
    };
  }

  categories = [
    { label: 'Technical Task', value: 'technical-task' },
    { label: 'User Story', value: 'user-story' },
  ];

  setCategory(value: string): void {
    this.addTaskForm.get('category')?.setValue(value);
    this.isCategoryDropdownOpen = false;
  }
  // Property to track the state of the category dropdown (open or closed)
  isCategoryDropdownOpen = false;
  toggleCategoryDropdown(): void {
    this.addTaskForm.controls.category.markAsTouched();
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

  getCategoryLabel(): string {
    const value = this.addTaskForm.get('category')?.value;
    return this.categories.find((c) => c.value === value)?.label ?? '';
  }
  // Closes the category dropdown when clicking outside of it
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside && this.isCategoryDropdownOpen) {
      this.isCategoryDropdownOpen = false;
    }
  }

  setAssignedContactIds(ids: number[]): void {
    this.addTaskForm.get('assignedContactIds')?.setValue(ids);
  }

  // ab hier Marc

  readonly dialogService = inject(DialogService);
  readonly DialogType = DialogType;
  type = signal<DialogType | null>(null);


  isTaskDialog = computed(() =>
    this.dialogService.current().type === DialogType.AddTask
  );

  @Input() isEditMode = false;

  readonly selectedTask = this.taskService.selectedTask;
  @Input() isDialog = false;
  @Output() close = new EventEmitter<void>();

  closeDialog() {
    if (this.isDialog) {
      this.close.emit();
    } else {
      this.router.navigate(['/board']);
    }
  }

  get initialStatus(): TaskStatus | undefined {
    return (this.dialogService.current().data as { status: TaskStatus } | undefined)?.status;
  }


  getPriorityIcon(priority: 'urgent' | 'medium' | 'low'): string {
    const suffix = this.isPrioritySelected(priority) ? '-white' : '';
    return `/assets/img/components/task/priority-symbol-${priority}${suffix}.svg`;
  }

  ngOnInit(): void {
    this.selectedStatus = this.initialStatus ?? 'todo';

    if (this.isEditMode) {
      this.loadTaskIntoForm();
    } else {
      this.initialSubtasks = [];
    }
  }

  private loadTaskIntoForm(): void {
    const task = this.selectedTask();
    if (!task) {
      return;
    }
    this.addTaskForm.patchValue({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      category: task.category,
      assignedContactIds: task.assignedContactIds,
    });

    const dueDateControl = this.addTaskForm.controls.dueDate;

    dueDateControl.setValidators([
      Validators.required,
      noPastDateValidator(new Date(task.dueDate))
    ]);

    dueDateControl.updateValueAndValidity();

    this.initialSubtasks = [...task.subtasks];
    this.subtasks.set([...task.subtasks]);
  }
}
