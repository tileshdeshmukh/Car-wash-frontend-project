import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { Appointment } from '../../models/appointment.model';
import { User } from '../../models/user.model';
import { PackageService } from '../../services/package.service';
import { Package } from '../../models/package.model';
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
  private packageService = inject(PackageService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private UserService = inject(UserService);

  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  userId: number | null = null;

  userProfile: UserProfile = {
    name: '',
    email: '',
    mobile: '',
    avatar: '',
    membership: '',
    totalWashes: 0,
    totalBike: 0,
    totalCar: 0,
    activeBookings: 0,
  };

  pastBookingsList: Appointment[] = [];
  isEditMode = false;
  tempProfile: UserProfile = { ...this.userProfile };
  packageList: Package[] = [];

  ngOnInit(): void {

    const userId = this.authService.getUserId();
    const email = this.authService.getEmail();

    if (!userId || !email) {
      return;
    }

    this.userId = userId;

    this.loadUser(userId);

    this.packageService.getAllPackages().subscribe({
      next: (packages) => {
        console.log('Packages:', packages);

        this.packageList = packages;

        this.loadAppointments(email);
      },
      error: (error) => {
        console.error('Unable to load packages:', error);

        this.errorMessage.set('Unable to load package information.');
        this.isLoading.set(false);
      }
    });
  }

  private getPackageName(packageId: number): string {

    const selectedPackage = this.packageList.find( pg => pg.id === packageId );
    const getPackageName = selectedPackage ? selectedPackage.name : 'Unknown Package';
    //const packageName = getPackageName.substring(0,15) + "...";
    return getPackageName;
  }

  private loadUser(userId: number): void {
    this.UserService.getUserById(userId).subscribe({
      next: (user) => {
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

  // Confirmed = 1
  // Washing   = 2
  // Ready     = 3
  // Cancelled = 4

  // private loadAppointments(userId: number): void {
  //   this.isLoading.set(true);
  //   this.errorMessage.set('');
  //   this.appointmentService.getAppointmentsByUserId(userId).subscribe({
  //     next: (appointments) => {
  //       // console.log('User Appointments:', appointments);
  //       this.pastBookingsList = appointments; // Store all bookings
  //       // Completed/Delivered washes
  //       const deliveredBookings = appointments.filter(
  //         booking => booking.washStatus?.toLowerCase() === 'delivered'
  //       );

  //       // Total washes
  //       this.userProfile.totalWashes = deliveredBookings.length;

  //       // Total completed car washes
  //       this.userProfile.totalCar = deliveredBookings.filter(
  //         booking => booking.vehicleType?.toLowerCase() === 'car'
  //       ).length;

  //       // Total completed bike washes
  //       this.userProfile.totalBike = deliveredBookings.filter(
  //         booking => booking.vehicleType?.toLowerCase() === 'bike'
  //       ).length;

  //       // Active bookings
  //       this.userProfile.activeBookings = appointments.filter(
  //         booking => {
  //           const status = booking.washStatus?.toLowerCase();
  //           return status !== 'delivered' &&
  //             status !== 'cancelled';
  //         }
  //       ).length;
  //       this.persistProfile();
  //       this.isLoading.set(false);
  //     },
  //     error: (error: unknown) => {
  //       console.error('Unable to load profile bookings:', error);
  //       this.errorMessage.set('We could not load your booking statistics.');
  //       this.isLoading.set(false);
  //     }
  //   });
  // }

  private loadAppointments(email: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.appointmentService.getAppointmentsByEmailId(email).subscribe({
      next: (appointments) => {
        // console.log('User Appointments:', appointments);
        this.pastBookingsList = appointments; // Store all bookings
        // Completed/Delivered washes
        const deliveredBookings = appointments.filter(
          booking => booking.washStatus?.toLowerCase() === 'delivered'
        );

        // Total washes
        this.userProfile.totalWashes = deliveredBookings.length;

        // Total completed car washes
        this.userProfile.totalCar = deliveredBookings.filter(
          booking => booking.vehicleType?.toLowerCase() === 'car'
        ).length;

        // Total completed bike washes
        this.userProfile.totalBike = deliveredBookings.filter(
          booking => booking.vehicleType?.toLowerCase() === 'bike'
        ).length;

        // Active bookings
        this.userProfile.activeBookings = appointments.filter(
          booking => {
            const status = booking.washStatus?.toLowerCase();
            return status !== 'delivered' &&
              status !== 'cancelled';
          }
        ).length;
        this.persistProfile();
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        console.error('Unable to load profile bookings:', error);
        this.errorMessage.set('We could not load your booking statistics.');
        this.isLoading.set(false);
      }
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

  getStatusClass(status: string | undefined): string {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-primary text-white';

      case 'washing':
        return 'bg-warning text-dark';

      case 'ready':
        return 'bg-info text-dark';

      case 'cancelled':
        return 'bg-danger text-white';

      case 'delivered':
      case 'done':
        return 'bg-success text-white';

      default:
        return 'bg-secondary text-white';
    }
  }


}
