import { Injectable } from '@angular/core';
import { HttpService } from '../http_service/http.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private httpService: HttpService) { }

  // Register user
  signup(payload: any): Observable<any> {
    return this.httpService.postApi('/user/userSignup', payload);
  }

  // Login user  
  signIn(payload: any): Observable<any> {
    return this.httpService.postApi('/user/login', payload);
  }

  // Logout user
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }

  // Get user data
  getUserData(): any {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }
}