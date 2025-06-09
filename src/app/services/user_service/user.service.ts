import { Injectable } from '@angular/core';
import { HttpService } from '../http_service/http.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private httpService: HttpService, private router: Router) {}

  signup(payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    service: string;
  }): Observable<any> {
    return this.httpService.postApi('/user/userSignup', payload);
  }

  signIn(payload: {
    email: string;
    password: string;
    service: string;
  }): Observable<any> {
    return this.httpService.postApi('/user/login', payload);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }

  getUserData(): any {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  setAuthData(token: string, userData: any): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
  }
}
