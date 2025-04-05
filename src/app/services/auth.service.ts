import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface AuthResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  user?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl;
  private _isLoggedIn = new BehaviorSubject<boolean>(this.hasValidToken());
  public isLoggedIn = this._isLoggedIn.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, userData);
  }

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response && response.tokens) {
            this.setTokens(response.tokens);
            this._isLoggedIn.next(true);
          }
        })
      );
  }

  verifyOtp(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/verify-otp`, data)
      .pipe(
        tap(response => {
          if (response && response.tokens) {
            this.setTokens(response.tokens);
            this._isLoggedIn.next(true);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this._isLoggedIn.next(false);
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/refresh-token`, { refreshToken })
      .pipe(
        tap(response => {
          if (response && response.tokens) {
            this.setTokens(response.tokens);
          }
        })
      );
  }

  private setTokens(tokens: { accessToken: string, refreshToken: string }): void {
    localStorage.setItem('access_token', tokens.accessToken);
    localStorage.setItem('refresh_token', tokens.refreshToken);
  }

  private hasValidToken(): boolean {
    return !!localStorage.getItem('access_token');
  }
}