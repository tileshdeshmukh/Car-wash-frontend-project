import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Added ChangeDetectorRef import
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
 
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef); // 2. Injected Change Detector Reference service
  private authService = inject(AuthService);

  isLoading = true; 

  userProfile = {
    name: 'Tilesh Deshmukh',
    email: 'tilesh.deshmukh@email.com',
    mobile: '9876543210',
    avatar: 'img/man-avatar-icon.png',
    membership: 'Gold Member',
    totalWashes: 0,
    totalBike: 0,
    totalCar: 0
  };

  pastBookingsList: any[] = [];

  isEditMode = false;
  tempProfile: any;
  user_id: number = 102;

  ngOnInit(): void {
    this.getAllAppointmentsByUserId(this.user_id);
    this.tempProfile = { ...this.userProfile };
  }

  getAllAppointmentsByUserId(id: number): void {
    this.isLoading = true; 

    this.http.get(`http://localhost:8080/appointment/getAllAppointmentByUserId/${id}`)
    .subscribe({
      next: (responseData: any) => {
        this.pastBookingsList = responseData;  

        const completedWashes = responseData.filter((book: { washStatus: string; }) => book.washStatus === 'Delivered');
        this.userProfile.totalWashes = completedWashes.length;
        
        const cars = responseData.filter((b: { washStatus: string; vehicleType: string; }) => b.vehicleType === 'Sedan' && b.washStatus === 'Delivered');
        this.userProfile.totalCar = cars.length;

        const bikes = responseData.filter((book: { washStatus: string; vehicleType: string; }) => book.vehicleType === 'Bike' && book.washStatus === 'Delivered');
        this.userProfile.totalBike = bikes.length;

        this.isLoading = false; 
        
        // FORCE ANGULAR TO UPDATE THE UI INSTANTLY
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Failed to resolve data from API:', err);
        this.isLoading = false; 
        
        // Force update UI on failure as well to clear out the spinner
        this.cdr.detectChanges(); 
      }
    });
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      this.tempProfile = { ...this.userProfile };
    }
  }

  saveProfileChanges(): void {
    this.userProfile = { ...this.tempProfile };
    this.isEditMode = false;
    alert('🌟 Profile Account Updated Successfully!');
  }

  logout(): void{
    const check = confirm("Are you sure, You want to logout?");
    if(check){
      this.authService.logout();
    }
  }
}
