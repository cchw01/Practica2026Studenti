import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SupportMessageService {
  private apiUrl = 'https://localhost:7137/api/SupportMessage';

  constructor(private http: HttpClient) {}

  submit(
    source: 'Contact' | 'Help',
    name: string,
    email: string,
    message: string,
    issueType?: string,
  ): Observable<any> {
    return this.http.post(this.apiUrl, { source, name, email, message, issueType });
  }

  getContactMessages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/contact`);
  }

  getHelpMessages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/help`);
  }

  resolve(id: number, replyMessage?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/resolve`, { replyMessage });
  }
}
