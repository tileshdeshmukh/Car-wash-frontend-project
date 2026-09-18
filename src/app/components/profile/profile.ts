import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { Appointment } from '../../models/appointment.model';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

interface UserProfile {
  name: string;
  email: string;
  mobile: string;
  avatar: string;
  membership: string;
  totalWashes: number;
  totalBike: number;
  totalCar: number;
  activeBookings: number;
}

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private UserService = inject(UserService);

  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  userId: number | null = null;

  userProfile: UserProfile = {
    name: 'Customer',
    email: '',
    mobile: '',
    avatar: 'img/man-avatar-icon.png',
    membership: 'Member',
    totalWashes: 0,
    totalBike: 0,
    totalCar: 0,
    activeBookings: 0,
  };

  pastBookingsList: Appointment[] = [];
  isEditMode = false;
  tempProfile: UserProfile = { ...this.userProfile };

  ngOnInit(): void {

    this.userId = this.authService.getUserId();

    if (!this.userId) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/profile' } });
      return;
    }

    this.loadUser(this.userId);
    this.loadAppointments(this.userId);

  }
  
  private loadUser(userId: number): void {
    this.UserService.getUserById(userId).subscribe({
      next : (user) => {
        this.userProfile = {
           ...this.userProfile,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          avatar: user.avatar || 'img/man-avatar-icon.png',
          membership: user.membership || 'Gold Member'

        }
        this.tempProfile = { ...this.userProfile };
      },
      error: (error) => {
        console.error('Unable to load user profile:', error);
      },
    });
  }

  private loadAppointments(userId: number): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.appointmentService.getAppointmentsByUserId(userId).subscribe({
      next: (appointments) => {
        this.pastBookingsList = appointments;
        const delivered = appointments.filter((booking) => booking.washStatus === 'Delivered' || booking.washStatus === 'Done');
        this.userProfile.totalWashes = delivered.length;
        this.userProfile.totalCar = delivered.filter((booking) => booking.vehicleType === 'Car').length;
        this.userProfile.totalBike = delivered.filter((booking) => booking.vehicleType === 'Bike').length;
        this.userProfile.activeBookings = appointments.filter((booking) => !['Delivered', 'Done', 'Cancelled'].includes(booking.washStatus)).length;
        this.persistProfile();
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        console.error('Unable to load profile bookings:', error);
        this.errorMessage.set('We could not load your booking statistics.');
        this.isLoading.set(false);
      },
    });
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) this.tempProfile = { ...this.userProfile };
  }

  saveProfileChanges(): void {
    this.userProfile = { ...this.tempProfile };
    this.persistProfile();
    this.isEditMode = false;
  }

  logout(): void {
    if (confirm('Are you sure you want to log out?')) this.authService.logout();
  }

  private persistProfile(): void {
    if (this.userId) this.authService.saveLocalProfile(this.userId, this.userProfile);
  }
}
