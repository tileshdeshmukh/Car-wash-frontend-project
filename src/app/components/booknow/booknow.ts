import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { Package } from '../../models/package.model';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-booknow',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './booknow.html',
  styleUrl: './booknow.css',
})
export class Booknow implements OnInit {
  private fb = inject(FormBuilder);
  private appointmentService = inject(AppointmentService);
  private userService = inject(UserService);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly defaultPlan = 'Eco Washing Pack';
  bookingForm!: FormGroup;
  isSubmitted = false;
  isSaving = false;
  packageError = '';
  
  userData: User | null = null;

  bikeBrands = ['Royal Enfield', 'KTM', 'Yamaha', 'Honda', 'Suzuki'];

  carBrands = ['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Toyota'];

  modelsData: Record<string, string[]> = {
    'Royal Enfield': ['Classic 350', 'Bullet 350', 'Himalayan 450', 'Hunter 350'],
    KTM: ['Duke 200', 'Duke 250', 'Duke 390', 'RC 390'],
    Yamaha: ['R15 V4', 'MT-15 V2', 'FZ-S V4', 'Aerox 155'],
    Honda: ['Activa 6G', 'Shine 125', 'CB350', 'Unicorn'],
    Suzuki: ['Access 125', 'Burgman Street', 'Gixxer SF 150', 'V-Strom SX'],
    'Maruti Suzuki': ['Swift', 'Baleno', 'Brezza', 'Ertiga', 'Grand Vitara'],
    Hyundai: ['i20', 'Creta', 'Verna', 'Venue', 'Alcazar'],
    Tata: ['Altroz', 'Nexon', 'Harrier', 'Safari', 'Punch'],
    Mahindra: ['Thar', 'XUV700', 'Scorpio-N', 'Bolero', 'XUV3XO'],
    Toyota: ['Glanza', 'Urban Cruiser Taisor', 'Innova Crysta', 'Fortuner'],
  };
  availableBrands: string[] = [];
  availableModels: string[] = [];
  minDate = '';
  packageList: Package[] = [];

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    this.initForm();
    this.setTodayDateLimit();
    this.loadPackages();

    if (!userId) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/booknow' }
      });
    return;
    }
    
    this.loadUser(userId);

    this.bookingForm.controls['vehicleType'].valueChanges.subscribe((type: string) => {
      this.bookingForm.patchValue({ vehicleBrand: '', vehicleModel: '' });
      this.availableModels = [];
      this.availableBrands = type === 'Bike' ? this.bikeBrands : type === 'Car' ? this.carBrands : [];
    });

    this.bookingForm.controls['vehicleBrand'].valueChanges.subscribe((brand: string) => {
      this.bookingForm.controls['vehicleModel'].setValue('');
      this.availableModels = this.modelsData[brand] ?? [];
    });
  }

  private loadPackages(): void {
    this.http.get<Package[]>('http://localhost:8080/packages/getAllPackages').subscribe({
      next: (packages) => this.packageList = packages,
      error: (error: unknown) => {
        console.error('Unable to load packages:', error);
        this.packageError = 'Packages could not be loaded. The default package will be used.';
      },
    });
  }

private loadUser(userId: number): void {

  this.userService.getUserById(userId).subscribe({
    next: (data: User) => { 
       this.userData = data; 
       console.log('User data loaded successfully:', this.userData);
       
       this.bookingForm.patchValue({
          customerName: data.name, 
          mobileNumber: data.mobile,
       });
    },
    error: (error: unknown) => {
      console.error('Unable to load User:', error);
      this.packageError = 'User could not be loaded.';
    }
  });
}


  private setTodayDateLimit(): void {
    this.minDate = new Date().toISOString().slice(0, 10);
  }

  private initForm(): void {
    this.bookingForm = this.fb.group({
      customerName: ['', [Validators.required, Validators.minLength(3)]],
      mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      bookingDate: ['', Validators.required],
      vehicleType: ['', Validators.required],
      vehicleBrand: ['', Validators.required],
      vehicleModel: ['', Validators.required],
      vehicleColor: ['', Validators.required],
      vehicleNumber: ['', [Validators.required, Validators.pattern('^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$')]],
      planPackage: [this.defaultPlan, Validators.required],
    });
  }

  get f() {
    return this.bookingForm.controls;
  }

  onSubmit(): void {
    this.isSubmitted = true;
    if (this.bookingForm.invalid || this.isSaving) return;

    const userId = this.authService.getUserId();
    if (!userId) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/booknow' } });
      return;
    }

    this.isSaving = true;
    const value = this.bookingForm.getRawValue();

    this.appointmentService.createAppointment({
      userid: userId,
      customerName: value.customerName.trim(),
      mobileNumber: value.mobileNumber,
      vehicleType: value.vehicleType,
      vehicleBrand: value.vehicleBrand,
      vehicleModel: value.vehicleModel,
      vehicleColor: value.vehicleColor.trim(),
      vehicleNumber: value.vehicleNumber.trim().toUpperCase(),
      plan: value.planPackage,
      date: value.bookingDate,
    }).subscribe({
      next: () => {
        this.bookingForm.reset({ planPackage: this.defaultPlan });
        this.isSubmitted = false;
        this.isSaving = false;
        this.availableBrands = [];
        this.availableModels = [];
        this.router.navigate(['/mybooking']);
      },
      error: (error: unknown) => {
        console.error('Unable to save appointment:', error);
        this.isSaving = false;
      },
    });
  }
}
