import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {

  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  // Core state signals
  isLoginTab = signal<boolean>(true);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  // Form bindings
  loginData = { email: '', password: '' };
  registerData = { name: '', email: '', mobile: '', password: '' };

  switchTab(loginMode: boolean): void {
    if (this.isLoading()) return;
    this.isLoginTab.set(loginMode);
    this.errorMessage.set('');
  }

  onLogin(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.http.post<any>('http://localhost:8080/api/auth/login', this.loginData)
      .subscribe({
        next: (res) => {

          // console.log('JWT received:', res.token);
          // console.log('userID received:', res.userId);
          this.authService.login(res.token, res.userId);
          this.isLoading.set(false);
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigateByUrl(returnUrl);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Invalid username or password credentials.');
        }
      });
  }

  onRegister(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.http.post<any>('http://localhost:8080/api/auth/register', this.registerData)
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          alert('🎉 Registration successful! Shifting to login.');
          this.isLoginTab.set(true);
          this.registerData = { name: '', email: '', mobile: '', password: '' };
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Registration failed. Try again.');
        }
      });
  }
}
