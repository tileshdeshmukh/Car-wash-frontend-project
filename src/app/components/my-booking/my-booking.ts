import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { Appointment } from '../../models/appointment.model';

interface BookingView {
  id: string;
  rawId: number;
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
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = true;
  errorMessage = '';
  activeBooking = signal<BookingView | null>(null);
  pastBookings = signal<BookingView[]>([]);

  ngOnInit(): void {
    this.loadWashHistory();
  }

  loadWashHistory(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/mybooking' } });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.appointmentService.getAppointmentsByUserId(userId).subscribe({
      next: (appointments) => {
        const bookings = appointments.map((item) => this.toBookingView(item))
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        this.pastBookings.set(bookings);
        this.activeBooking.set(bookings[0] ?? null);
        this.isLoading = false;
      },
      error: (error: unknown) => {
        console.error('Unable to load booking history:', error);
        this.errorMessage = 'We could not load your bookings. Please try again.';
        this.isLoading = false;
      },
    });
  }

  selectBookingForDetails(booking: BookingView): void {
    this.activeBooking.set(booking);
  }

  cancelBooking(booking: BookingView): void {
    if (!confirm(`Cancel booking ${booking.id}?`)) return;

    this.appointmentService.deleteAppointment(booking.rawId).subscribe({
      next: () => {
        const remaining = this.pastBookings().filter((item) => item.rawId !== booking.rawId);
        this.pastBookings.set(remaining);
        this.activeBooking.set(remaining[0] ?? null);
      },
      error: (error: unknown) => {
        console.error('Unable to cancel appointment:', error);
        this.errorMessage = 'The booking could not be cancelled. Please try again.';
      },
    });
  }

  private toBookingView(item: Appointment): BookingView {
    return {
      id: `#CW-${item.id}`,
      rawId: item.id,
      date: item.date,
      vehicle: `${item.vehicleBrand} ${item.vehicleModel} (${item.vehicleColor})`,
      registration: item.vehicleNumber,
      service: item.plan,
      cost: item.price,
      status: item.washStatus,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      currentStep: this.mapStatusToStep(item.washStatus),
    };
  }

  private mapStatusToStep(status: string): number {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 1;
      case 'washing': return 2;
      case 'ready': return 3;
      default: return 0;
    }
  }
}
