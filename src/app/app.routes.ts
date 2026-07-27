import { Routes } from '@angular/router';

import { authGuard } from './guards/auth/auth.guard';
import { MainPage } from './layout/mainpage/mainpage';
import { AddTask } from './pages/add-task/add-task';
import { BoardComponent } from './pages/board/board';
import { Contacts } from './pages/contacts/contacts';
import { Help } from './pages/help/help';
import { Home } from './pages/home/home';
import { LegalNotice } from './pages/legal-notice/legal-notice';
import { LogIn } from './pages/log-in/log-in';
import { PrivacyPolicy } from './pages/privacy-policy/privacy-policy';
import { SignUp } from './pages/sign-up/sign-up';
import { Summary } from './pages/summary/summary';

export const routes: Routes = [
  {
    path: '',
    component: LogIn,
    title: 'Log-In',
  },
  {
    path: 'login',
    component: LogIn,
    title: 'Log-In',
  },
  {
    path: 'sign-up',
    component: SignUp,
    title: 'Sign-Up',
  },
  {
    path: '',
    component: MainPage,
    children: [
      {
        path: 'summary',
        component: Summary,
        title: 'Summary',
        canActivate: [authGuard],
      },
      {
        path: 'add-task',
        component: AddTask,
        title: 'Add-Task',
        canActivate: [authGuard],
      },
      {
        path: 'board',
        component: BoardComponent,
        title: 'Board',
        canActivate: [authGuard],
      },
      {
        path: 'contacts',
        component: Contacts,
        title: 'Contacts',
        canActivate: [authGuard],
      },
      {
        path: 'privacy-policy',
        component: PrivacyPolicy,
        title: 'Privacy Policy',
      },
      {
        path: 'legal-notice',
        component: LegalNotice,
        title: 'Legal Notice',
      },
      {
        path: 'help',
        component: Help,
        title: 'Help',
      },
      // ,
      // {
      //     path: '',
      //     redirectTo: 'contacts',
      //     pathMatch: 'full'
      // }
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
