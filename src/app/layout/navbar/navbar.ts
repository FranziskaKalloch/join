import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { environment } from '../../../environments/environment';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  activeIcon: string;
}
interface FooterLink {
  label: string;
  route: string;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private authService = inject(AuthService);
  protected readonly isLoggedIn = computed(
    () => environment.forceLoggedInNav || this.authService.isLoggedIn()
  );

  protected readonly navItems: NavItem[] = [
    {
      label: 'Summary',
      route: '/summary',
      icon: 'assets/img/navigation/summary.svg',
      activeIcon: 'assets/img/navigation/summary-hover.svg',
    },
    {
      label: 'Add Task',
      route: '/add-task',
      icon: 'assets/img/navigation/add-task.svg',
      activeIcon: 'assets/img/navigation/add-task-hover.svg',
    },
    {
      label: 'Board',
      route: '/board',
      icon: 'assets/img/navigation/board.svg',
      activeIcon: 'assets/img/navigation/board-hover.svg',
    },
    {
      label: 'Contacts',
      route: '/contacts',
      icon: 'assets/img/navigation/contacts.svg',
      activeIcon: 'assets/img/navigation/contacts-hover.svg',
    },
  ];

  protected readonly footerLinks: FooterLink[] = [
    {
      label: 'Privacy Policy',
      route: '/privacy-policy',
    },
    {
      label: 'Legal Notice',
      route: '/legal-notice',
    },
  ];
}
