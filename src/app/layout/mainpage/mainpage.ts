import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ContactService } from '../../services/contacts/contact.service';
import { TaskService } from '../../services/tasks/task.service';
import { Header } from '../header/header';
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-mainpage',
  imports: [Header, Navbar, RouterOutlet],
  templateUrl: './mainpage.html',
  styleUrl: './mainpage.scss',
})
export class MainPage implements OnInit {
  private contactService = inject(ContactService);
  private taskService = inject(TaskService);

  /**
   * Loads the initial application data required by the authenticated area.
   *
   * Fetches all contacts and tasks when the main layout is initialized,
   * ensuring that shared components such as the header, board, and summary
   * have access to the required data.
   */
  ngOnInit(): void {
    this.taskService.loadTasks();
    this.contactService.loadContacts();
  }
}
