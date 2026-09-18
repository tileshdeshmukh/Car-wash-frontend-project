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

  login(userId: string | number, token?: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('userId', String(userId));
      if (token) {
        localStorage.setItem('token', token);
      }
      this.isLoggedIn.set(true);
    }
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('userId');
      localStorage.removeItem('token');
      this.isLoggedIn.set(false);
    }
    this.router.navigate(['/home']);
  }

  getUserId(): number | null {
    if (isPlatformBrowser(this.platformId)) {
      const id = localStorage.getItem('userId');
      const parsedId = id ? Number(id) : NaN;
      return Number.isSafeInteger(parsedId) && parsedId > 0 ? parsedId : null;
    }
    return null; // Safe fallback for Node.js server environment
  }

  getLocalProfile<T>(userId: number): T | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const value = localStorage.getItem(`profile:${userId}`);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      localStorage.removeItem(`profile:${userId}`);
      return null;
    }
  }

  saveLocalProfile<T>(userId: number, profile: T): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(`profile:${userId}`, JSON.stringify(profile));
    }
  }
}
