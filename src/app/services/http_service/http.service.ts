import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  baseUrl = "https://fundoonotes.incubation.bridgelabz.com/api";
  
  constructor(private http: HttpClient) { }

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
  }

  // CRUD operations
  getApi(endpoint: string, headers: HttpHeaders = this.getHeaders()): Observable<any> {
    return this.http.get(this.baseUrl + endpoint, { headers });
  }

  postApi(endpoint: string, payload: any, headers: HttpHeaders = this.getHeaders()): Observable<any> {
    return this.http.post(this.baseUrl + endpoint, payload, { headers });
  }

  putApi(endpoint: string, payload: any, headers: HttpHeaders = this.getHeaders()): Observable<any> {
    return this.http.put(this.baseUrl + endpoint, payload, { headers });
  }

  deleteApi(endpoint: string, headers: HttpHeaders = this.getHeaders()): Observable<any> {
    return this.http.delete(this.baseUrl + endpoint, { headers });
  }
}
