import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { HttpClient } from '@angular/common/http';
import { Package } from '../../models/package.model';

@Component({
  selector: 'app-booknow',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './booknow.html',
  styleUrl: './booknow.css'
})
export class booknow implements OnInit {

  private http = inject(HttpClient);

  private fb = inject(FormBuilder);
  private appointmentService = inject(AppointmentService);
  private router = inject(Router);

  bookingForm!: FormGroup;
  isSubmitted = false;

  bikeBrands = ['Royal Enfield', 'KTM', 'Yamaha', 'Honda', 'Suzuki'];
  carBrands = ['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Toyota'];

  modelsData: { [key: string]: string[] } = {
    'Royal Enfield': ['Classic 350', 'Bullet 350', 'Himalayan 450', 'Hunter 350'],
    'KTM': ['Duke 200', 'Duke 250', 'Duke 390', 'RC 390'],
    'Yamaha': ['R15 V4', 'MT-15 V2', 'FZ-S V4', 'Aerox 155'],
    'Honda': ['Activa 6G', 'Shine 125', 'CB350', 'Unicorn'],
    'Suzuki': ['Access 125', 'Burgman Street', 'Gixxer SF 150', 'V-Strom SX'],
    'Maruti Suzuki': ['Swift', 'Baleno', 'Brezza', 'Ertiga', 'Grand Vitara'],
    'Hyundai': ['i20', 'Creta', 'Verna', 'Venue', 'Alcazar'],
    'Tata': ['Altroz', 'Nexon', 'Harrier', 'Safari', 'Punch'],
    'Mahindra': ['Thar', 'XUV700', 'Scorpio-N', 'Bolero', 'XUV3XO'],
    'Toyota': ['Glanza', 'Urban Cruiser Taisor', 'Innova Crysta', 'Fortuner']
  };

  availableBrands: string[] = [];
  availableModels: string[] = [];
  minDate: string | undefined;

  packageList: any[] = [];

  getAllPackages(){
    this.http.get("http://localhost:8080/packages/getAllPackages")
    .subscribe((resultData:any) => {
      this.packageList = resultData;
    });
    
  }

  ngOnInit(): void {
    
    this.getAllPackages();
    this.initForm();
    this.getTodayDateLimit(); // Fixed: Added execution call context loop on load

    this.bookingForm.get('vehicleType')?.valueChanges.subscribe((type) => {
      this.bookingForm.get('vehicleBrand')?.setValue('');
      this.bookingForm.get('vehicleModel')?.setValue('');
      this.availableModels = [];
      
      if (type === 'Bike') {
        this.availableBrands = this.bikeBrands;
      } else if (type === 'Car') {
        this.availableBrands = this.carBrands;
      } else {
        this.availableBrands = [];
      }
    });

    this.bookingForm.get('vehicleBrand')?.valueChanges.subscribe((brand) => {
      this.bookingForm.get('vehicleModel')?.setValue('');
      
      if (brand && this.modelsData[brand]) {
        this.availableModels = this.modelsData[brand];
      } else {
        this.availableModels = [];
      }
    });
  }

  getTodayDateLimit(): void {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.minDate = `${yyyy}-${mm}-${dd}`;
  }

  initForm(): void {
    this.bookingForm = this.fb.group({
      customerName: ['', [Validators.required, Validators.minLength(3)]],
      mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      bookingDate: ['', Validators.required],
      vehicleType: ['', Validators.required],
      vehicleBrand: ['', Validators.required], 
      vehicleModel: ['', Validators.required], 
      vehicleColor: ['', Validators.required],
      vehicleNumber: ['', [Validators.required, Validators.pattern('^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$')]],
      planPackage: ['Eco Washing Pack'] // Fallback default setup matching your view screen
    });
  }

  get f() { return this.bookingForm.controls; }

  onSubmit(): void {
    this.isSubmitted = true;

    if (this.bookingForm.invalid) {
      return;
    }

    const formValues = this.bookingForm.value;

    // Map your custom UI keys precisely to matching database entity columns
    const payload = {
      userid: 101, // Mock placeholder value context variable 
      vehicleType: formValues.vehicleType,
      vehicleBrand: formValues.vehicleBrand,
      vehicleModel: formValues.vehicleModel,
      vehicleColor: formValues.vehicleColor,
      vehicleNumber: formValues.vehicleNumber,
      plan: formValues.planPackage,
      date: formValues.bookingDate // 'yyyy-MM-dd' matches LocalDate type conversion perfectly
    };

    // Fire actual payload to server destination database address hooks
    this.appointmentService.createAppointment(payload).subscribe({
      next: (response) => {
        alert('🎉 Appointment Booked successfully!');
        
        // Reset local variables clean state management 
        this.bookingForm.reset();
        this.isSubmitted = false;
        this.availableBrands = [];
        this.availableModels = [];
        
        // Route customer to live status page screen panel tracker
        this.router.navigate(['/mybooking']);
      },
      error: (err) => {
        console.error('Server save error details processing logs:', err);
        alert('❌ Network database persistence transaction error occurred.');
      }
    });
  }

}
