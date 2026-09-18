import { inject, Injectable } from "@angular/core";
import { User } from "../models/user.model";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class UserService{
    private http = inject(HttpClient);
    private baseUrl = "http://localhost:8080/user"

    getUserById(userId: number): Observable<User>{
        return this.http.get<User>(`${this.baseUrl}/getUser/${userId}`);
    }
}