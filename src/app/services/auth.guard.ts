import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // During server-side rendering,
  // don't redirect the user to login.
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // Check the actual token stored in localStorage.
  const token = authService.getToken();

  console.log('Auth Guard - Token:', token ? 'EXISTS' : 'NOT FOUND');

  if (token) {
    return true;
  }

  console.log('Auth Guard - Redirecting to login');

  return router.createUrlTree(
    ['/login'],
    {
      queryParams: {
        returnUrl: state.url
      }
    }
  );
};