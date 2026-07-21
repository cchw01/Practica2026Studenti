import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { AuctionItem } from '../Models/item-model';
import { Review, ReviewCreate } from '../Models/review/review.model';
import { ReportResponseDto, CreateReportDto, UpdateReportStatusDto } from '../Models/report/report-dto';

const environment = {
  apiUrl: 'https://localhost:7137/api',
};

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private baseUrl = `${environment.apiUrl}/Report`;

  constructor(private http: HttpClient) {}

  getReports(): Observable<ReportResponseDto[]> {
    return this.http.get<ReportResponseDto[]>(this.baseUrl);
  }

  getReportById(id: number): Observable<ReportResponseDto> {
    return this.http.get<ReportResponseDto>(`${this.baseUrl}/${id}`);
  }

  addReport(report: CreateReportDto): Observable<ReportResponseDto> {
    return this.http.post<ReportResponseDto>(this.baseUrl, report);
  }

  updateReportStatus(id: number, report: UpdateReportStatusDto): Observable<ReportResponseDto> {
    return this.http.put<ReportResponseDto>(`${this.baseUrl}/${id}`, report);
  }

  deleteReport(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getReportsByStatus(status: string): Observable<ReportResponseDto[]> {
    return this.http.get<ReportResponseDto[]>(`${this.baseUrl}/status/${status}`);
  }
}
