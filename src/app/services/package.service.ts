import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Package } from '../models/package.model';

@Injectable({
  providedIn: 'root'
})
export class PackageService {

  private http = inject(HttpClient);

  private baseUrl = 'http://localhost:8080/packages';

  getAllPackages(): Observable<Package[]> {
    return this.http.get<Package[]>(
      `${this.baseUrl}/getAllPackages`
    );
  }
}