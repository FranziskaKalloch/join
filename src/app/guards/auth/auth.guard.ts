import { inject, Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';
import { environment } from '../../../environments/environment';

/**
 * Protects routes by allowing access only to authenticated users.
 * Redirects unauthenticated users to the login page.
 *
 * @returns `true` for authenticated users, otherwise a redirect to `/login`.
 */
export const authGuard: CanActivateFn = async (route, state) => {
  if (environment.forceLoggedInNav) {
    return true;
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.getUser();

  if (authService.currentUser()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
