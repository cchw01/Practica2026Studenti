import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review, ReviewCreate } from '../Models/review/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly baseUrl = '/api/Review';

  constructor(private http: HttpClient) {}

  getReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(this.baseUrl);
  }

  getReviewById(id: number): Observable<Review> {
    return this.http.get<Review>(`${this.baseUrl}/${id}`);
  }

  getReviewsForUser(userId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/user/${userId}`);
  }

  addReview(review: ReviewCreate): Observable<Review> {
    return this.http.post<Review>(this.baseUrl, review);
  }

  updateReview(review: Review): Observable<Review> {
    return this.http.put<Review>(this.baseUrl, review);
  }

  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}