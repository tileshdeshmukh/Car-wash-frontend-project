import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe  } from '@angular/common';
import { AppointmentService } from '../../services/appointment.service'; // Ensure correct path
import { Appointment } from '../../models/appointment.model';     // Ensure correct path


@Component({
  selector: 'app-my-booking',
  standalone: true,
  imports: [CommonModule, DatePipe ],
  templateUrl: './my-booking.html',
  styleUrl: './my-booking.css'
})
export class Mybooking implements OnInit {
  private appointmentService = inject(AppointmentService);

  isLoading = true;
  // Turned activeBooking into a Signal so the UI updates instantly on click
  activeBooking = signal<any>(null);

  // Holds the dynamic server array
  pastBookings = signal<any[]>([]);

  ngOnInit(): void {
    this.loadWashHistory();
  }

  loadWashHistory(): void {
    this.isLoading = true;
    this.appointmentService.getAllAppointments().subscribe({
      next: (data: Appointment[]) => {
        // Map all incoming fields to match your UI's variable keys perfectly
        const mappedData = data.map(item => ({
          id: `#CW-${item.id}`,
          date: item.date,
          vehicle: `${item.vehicleBrand} ${item.vehicleModel} (${item.vehicleColor})`,
          registration: item.vehicleNumber,
          service: item.plan,
          cost: `₹${item.price}`, 
          status: item.washStatus,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          // Map backend status strings to UI step numbers (1, 2, or 3)
          currentStep: this.mapStatusToStep(item.washStatus)
        }));

        // SORT STRATEGY: Newest updated entry displayed on top (Descending Order)
        mappedData.sort((a, b) => {
          const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return timeB - timeA; // High timestamp values float to index 0
        });
        
        this.pastBookings.set(mappedData);

        // Fallback: Automatically load the first/newest booking into the live section on load
        if (mappedData.length > 0 && !this.activeBooking()) {
          this.activeBooking.set(mappedData[0]);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch past bookings from server:', err);
      }
    });
  }

  //  Click Handler: Triggered when user clicks an item in the Wash History block
  selectBookingForDetails(booking: any): void {
    this.activeBooking.set(booking);
  }

  // Helper method to convert your backend wash_status into wizard steps
  private mapStatusToStep(status: string): number {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 1;
      case 'washing': return 2;
      case 'ready': return 3;
      default: return 0; // 'Delivered' or others won't show active progress lines
    }
  }

   // REVISED FUNCTIONALITY FOR CANCELING APPOINTMENTS
  cancelBooking(displayId: string): void {
    const confirmCancel = confirm(`⚠️ Are you sure you want to cancel booking ${displayId}?`);
    if (!confirmCancel) return;

    // Extract the raw numerical id value from the UI display ID string (ex: "#CW-4" -> 4)
    const numericId = parseInt(displayId.replace('#CW-', ''), 10);

    if (isNaN(numericId)) {
      alert('❌ Error processing booking identification reference.');
      return;
    }

    // Fire the DELETE call downstream to Spring Boot
    this.appointmentService.deleteAppointment(numericId).subscribe({
      next: () => {
        alert(`Your appointment ${displayId} has been cancelled successfully.`);
        
        // Remove the deleted booking card item from the reactive tracking array list
        const updatedList = this.pastBookings().filter(booking => booking.id !== displayId);
        this.pastBookings.set(updatedList);

        // Reset or select the next remaining list row container inside the active viewer monitor block
        if (updatedList.length > 0) {
          this.activeBooking.set(updatedList[0]);
        } else {
          this.activeBooking.set(null);
        }
      },
      error: (err) => {
        console.error('API Error during appointment deletion:', err);
        alert('❌ Failed to cancel the appointment on the server. Please try again.');
      }
    });
  }
}



