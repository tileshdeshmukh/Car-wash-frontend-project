// appointment.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment } from '../models/appointment.model'; 

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/appointment';

  // Existing GET method...
  getAllAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/getAllAppointment`);
  }

  getAppointmentsByUserId(userId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/getAllAppointmentByUserId/${userId}`);
  }

  getAppointmentsByEmailId(email: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/getAllAppointmentByEmail/${email}`);
  }

  // NEW: POST method to add appointment
  createAppointment(appointmentData: Partial<Appointment>): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.baseUrl}/addAppointment`, appointmentData);
  }

   deleteAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/deleteAppointment/${id}`);
  }

  cancelAppointment(id: number): Observable<Appointment> {
    console.log("Appointment Service runn :");
  return this.http.put<Appointment>( `${this.baseUrl}/cancelAppointment/${id}`,
    {

    });
}

}
