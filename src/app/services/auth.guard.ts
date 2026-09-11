// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';


export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true; // Allow access if logged in
  }

  // If not logged in, redirect to login page and save the attempted URL path
  alert('🔒 Authentication Required. Please login to continue.');
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
