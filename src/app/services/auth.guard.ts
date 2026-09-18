import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Server-side rendering cannot access browser localStorage. Let the browser
  // perform the authentication check after hydration instead of redirecting
  // a valid session to login during a page refresh.
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  return authService.isLoggedIn()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
