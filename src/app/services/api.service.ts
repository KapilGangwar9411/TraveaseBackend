import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Authentication endpoints
  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, credentials);
  }

  verifyOtp(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/verify-otp`, data);
  }

  // User profile endpoints
  getUserProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/profile`);
  }

  updateUserProfile(profileData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/profile`, profileData);
  }

  uploadProfileImage(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/profile/image`, formData);
  }

  // Health check
  checkApiStatus(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health`);
  }
}