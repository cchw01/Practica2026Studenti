import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review, ReviewCreate } from '../Models/review/review.model';
const environment = {
  apiUrl: 'https://localhost:7137/api',
};

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private baseUrl = `${environment.apiUrl}/Review`;

  constructor(private http: HttpClient) {}

  getReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(this.baseUrl);
  }

  getReviewById(id: number): Observable<Review> {
    return this.http.get<Review>(`${this.baseUrl}/${id}`);
  }

  addReview(review: ReviewCreate): Observable<Review> {
    return this.http.post<Review>(this.baseUrl, review);
  }

  updateReview(id: number, review: ReviewCreate): Observable<Review> {
    return this.http.put<Review>(`${this.baseUrl}/${id}`, review);
  }

  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
