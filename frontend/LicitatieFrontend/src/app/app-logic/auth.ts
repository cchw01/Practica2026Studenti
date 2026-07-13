import { Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Pune aici portul real pe care ruleaza API-ul tau .NET cand ii dai run in VS
  private apiUrl = 'https://localhost:7123/api/auth';

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<any> {
    // Face un POST request catre backend cu datele din formular
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

}
