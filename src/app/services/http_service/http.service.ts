import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private baseUrl = 'https://fundoonotes.incubation.bridgelabz.com/api';

  constructor(private http: HttpClient) {}

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token,
    });
  }
  //Basic CRUD operations
  getApi(endpoint: string): Observable<any> {
    return this.http.get(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(),
    });
  }

  postApi(endpoint: string, payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}${endpoint}`, payload, {
      headers: this.getHeaders(),
    });
  }

  putApi(endpoint: string, payload: any): Observable<any> {
    return this.http.put(`${this.baseUrl}${endpoint}`, payload, {
      headers: this.getHeaders(),
    });
  }

  deleteApi(endpoint: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(),
    });
  }

  postFormData(endpoint: string, formData: FormData): Observable<any> {
    const token = localStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      Authorization: token,
    });
    return this.http.post(`${this.baseUrl}${endpoint}`, formData, { headers });
  }
}
