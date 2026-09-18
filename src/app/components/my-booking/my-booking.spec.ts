import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Mybooking } from './my-booking'; // Lowercase 'b'
import { AppointmentService } from '../../services/appointment.service';


describe('Mybooking', () => {
  let component: Mybooking;
  let fixture: ComponentFixture<Mybooking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mybooking],
      providers: [provideHttpClient(), provideRouter([]), AppointmentService]
    }).compileComponents();

    fixture = TestBed.createComponent(Mybooking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
