import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map, tap, catchError } from 'rxjs/operators';

export interface UserProfile {
  uid?: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  photoURL?: string;
  companyName?: string;
  corporateEmail?: string;
  shortBio?: string;
  hobbies?: string;
  vehicleType?: string;
  vehicleName?: string;
  vehicleRegNumber?: string;
  facilities?: string;
  instructions?: string;
  profileCompleted?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('auth_token');

    if (userId && token) {
      this.fetchUserProfile(userId).subscribe(
        user => {
          console.log('User loaded from storage:', user);
        },
        error => {
          console.error('Error loading user from storage:', error);
        }
      );
    }
  }

  public fetchUserProfile(uid: string): Observable<UserProfile> {
    // First check if we have a cached user with the same ID
    const currentUser = this.currentUserSubject.value;
    if (currentUser && currentUser.uid === uid) {
      console.log('Using cached user data');
      // Return the cached user but still fetch from server to update
      this.http.get<any>(`${environment.apiUrl}/api/user/profile/${uid}`).pipe(
        map(response => response.data?.user || {}),
        tap(user => {
          // Merge with existing data to ensure we don't lose local changes
          this.currentUserSubject.next({...currentUser, ...user});
        }),
        catchError(error => {
          console.error('Error refreshing user data:', error);
          return of(currentUser); // Keep using cached data on error
        })
      ).subscribe();

      return of(currentUser);
    }

    // If no cached user or different user, fetch from server
    return this.http.get<any>(`${environment.apiUrl}/api/user/profile/${uid}`).pipe(
      map(response => response.data?.user || {}),
      tap(user => {
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        console.error('Error fetching user profile:', error);
        return of({} as UserProfile);
      })
    );
  }

  public updateUserProfile(uid: string, userData: Partial<UserProfile>): Observable<UserProfile> {
    // First update the local data immediately to make UI feel responsive
    const currentUser = this.currentUserSubject.value || {};
    const updatedLocalUser = {...currentUser, ...userData, uid};
    this.currentUserSubject.next(updatedLocalUser);

    // Then send to the server
    return this.http.put<any>(`${environment.apiUrl}/api/user/profile/${uid}`, userData).pipe(
      map(response => response.data?.user || {}),
      tap(updatedUser => {
        // Merge the server response with our local data
        const mergedUser = {...updatedLocalUser, ...updatedUser};
        this.currentUserSubject.next(mergedUser);

        // Store the updated user ID in localStorage if not already there
        if (updatedUser.uid && !localStorage.getItem('user_id')) {
          localStorage.setItem('user_id', updatedUser.uid);
        }

        return mergedUser;
      }),
      catchError(error => {
        console.error('Error updating user profile:', error);
        // Revert to the previous state on error
        this.currentUserSubject.next(currentUser);
        throw error;
      })
    );
  }

  public getCurrentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  public logout() {
    // Clear user data and tokens
    localStorage.removeItem('user_id');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('phoneNumber');
    localStorage.removeItem('countryCode');

    // Reset the current user subject
    this.currentUserSubject.next(null);
  }
}
