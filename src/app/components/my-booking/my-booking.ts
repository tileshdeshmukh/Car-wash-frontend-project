import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { PackageService } from '../../services/package.service';
import { AuthService } from '../../services/auth.service';
import { Appointment } from '../../models/appointment.model';
import { Package } from '../../models/package.model';

interface BookingView {
  id: string;
  b_Id: number;
  date: string;
  vehicle: string;
  registration: string;
  service: string;
  cost: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  currentStep: number;
}

@Component({
  selector: 'app-my-booking',
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './my-booking.html',
  styleUrl: './my-booking.css',
})
export class Mybooking implements OnInit {

  private appointmentService = inject(AppointmentService);
  private packageService = inject(PackageService);
  private authService = inject(AuthService);
  private router = inject(Router);

  packageList: Package[] = [];
  isLoading = true;
  errorMessage = '';

  activeBooking = signal<BookingView | null>(null);
  pastBookings = signal<BookingView[]>([]);

  ngOnInit(): void {
    this.loadWashHistory();
  }

  loadWashHistory(): void {
    const userId = this.authService.getUserId();
    const email = this.authService.getEmail();
    console.log('email data :', email);

    if (!userId || !email) {
    return;
  }

    this.isLoading = true;
    this.errorMessage = '';

    // First load packages
    this.packageService.getAllPackages().subscribe({
      next: (packages) => {
        console.log('Packages:', packages);

        this.packageList = packages;
        // this.loadAppointments(userId);
        this.loadAppointments(email);
      },
      error: (error) => {
        console.error('Unable to load packages:', error);

        this.errorMessage = 'Unable to load package information.';
        this.isLoading = false;
      }
    });
  }

  // private loadAppointments(userId: number): void {

  //   this.appointmentService.getAppointmentsByUserId(userId).subscribe({
  //     next: (appointments) => {
  //       // console.log('Appointments:', appointments);

  //       const bookings = appointments 
  //         .map((item) =>
  //           this.toBookingView(item)
  //         )
  //         .sort((a, b) =>
  //           new Date(b.updatedAt).getTime() -
  //           new Date(a.updatedAt).getTime()
  //         );

  //       this.pastBookings.set(bookings);

  //       this.activeBooking.set(bookings[0] ?? null);
  //       this.isLoading = false;
  //     },

  //     error: (error: unknown) => {
  //       console.error('Unable to load booking history:', error);
  //       this.errorMessage = 'We could not load your bookings. Please try again.';
  //       this.isLoading = false;
  //     }
  //   });
  // }
  

  private loadAppointments(email: string): void {

    this.appointmentService.getAppointmentsByEmailId(email).subscribe({
      next: (appointments) => {
        // console.log('Appointments:', appointments);

        const bookings = appointments 
          .map((item) =>
            this.toBookingView(item)
          )
          .sort((a, b) =>
            new Date(b.updatedAt).getTime() -
            new Date(a.updatedAt).getTime()
          );

        this.pastBookings.set(bookings);

        this.activeBooking.set(bookings[0] ?? null);
        this.isLoading = false;
      },

      error: (error: unknown) => {
        console.error('Unable to load booking history:', error);
        this.errorMessage = 'We could not load your bookings. Please try again.';
        this.isLoading = false;
      }
    });
  }

  private toBookingView(item: Appointment): BookingView {
    return {
      id: `#CW-${item.id}`,
      b_Id: item.id,
      date: item.date,
      vehicle: `${item.vehicleBrand} ${item.vehicleModel} (${item.vehicleColor})`,
      registration: item.vehicleNumber,
      service: this.getPackageName(item.plan),
      cost: item.price,
      status: item.washStatus,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      currentStep: this.mapStatusToStep(item.washStatus),
    };
  }

  private getPackageName(packageId: number): string {

    const selectedPackage = this.packageList.find( pg => pg.id === packageId );
    const getPackageName = selectedPackage ? selectedPackage.name : 'Unknown Package';
    //const packageName = getPackageName.substring(0,15) + "...";
    return getPackageName;
  }

  selectBookingForDetails(booking: BookingView): void {
    this.activeBooking.set(booking);
  }

  cancelBooking(booking: BookingView): void {

    if (!confirm(`Cancel booking ${booking.id}?`)) {
      return;
    }

    this.appointmentService.cancelAppointment(booking.b_Id).subscribe({
      next: (UpdateAppointment) => {

        const remaining = this.pastBookings().filter(item => item.b_Id !== booking.b_Id);
        this.pastBookings.set(remaining);
        this.activeBooking.set(remaining[0] ?? null);

      },

      error: (error: unknown) => {
        console.error('Unable to cancel appointment:', error);
        this.errorMessage = 'The booking could not be cancelled. Please try again.';
      }
    });

    // this.appointmentService.deleteAppointment(booking.b_Id).subscribe({
    //   next: () => {
    //     const remaining = this.pastBookings()
    //       .filter(item => item.b_Id !== booking.b_Id);

    //     this.pastBookings.set(remaining);
    //     this.activeBooking.set(remaining[0] ?? null);
    //   },

    //   error: (error: unknown) => {
    //     console.error('Unable to cancel appointment:', error);

    //     this.errorMessage = 'The booking could not be cancelled. Please try again.';
    //   },
    // });




  }

// Confirmed = 1
// Washing   = 2
// Ready     = 3
// Cancelled = 4

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

  private mapStatusToStep(
    status: string
  ): number {

    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 1;

      case 'washing':
        return 2;

      case 'ready':
        return 3;

      case 'cancelled':
        return 4;

      default:
        return 0;
    }
  }
}