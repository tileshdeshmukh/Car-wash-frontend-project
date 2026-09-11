// src/app/services/auth.service.ts
import { isPlatformBrowser } from '@angular/common';
import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID); // Moved to the top for clean loading
  
  // 1. Initialize the signal as false by default so the server doesn't crash
  isLoggedIn = signal<boolean>(false);

  constructor() {
    // 2. Set the reactive signal value only once we confirm we are securely in the browser
    if (isPlatformBrowser(this.platformId)) {
      this.isLoggedIn.set(this.hasToken());
    }
  }

  private hasToken(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      // Checked both keys since you are using 'userId' for session tracking
      return !!localStorage.getItem('userId') || !!localStorage.getItem('token');
    }
    return false; // Safe fallback for Node.js server environment
  }

  login(userId: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('userId', userId);
      // Optional: If your backend returns an explicit token string, save it here too:
      // localStorage.setItem('token', 'your_jwt_token');
      
      this.isLoggedIn.set(true);
      this.router.navigate(['/']); // Redirect to home page on success
    }
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('userId');
      localStorage.removeItem('token');
      this.isLoggedIn.set(false);
      this.router.navigate(['/login']);
    }
  }

  getUserId(): number | null {
    if (isPlatformBrowser(this.platformId)) {
      const id = localStorage.getItem('userId');
      return id ? parseInt(id, 10) : null;
    }
    return null; // Safe fallback for Node.js server environment
  }
}
