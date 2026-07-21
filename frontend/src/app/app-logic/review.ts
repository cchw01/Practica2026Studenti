import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review, ReviewCreate } from '../Models/review/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly baseUrl = 'https://localhost:7137/api/Review';

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

  updateReview(review: Review): Observable<Review> {
    // Controllerul așteaptă [HttpPut] fără id în rută, review-ul complet vine în body
    return this.http.put<Review>(this.baseUrl, review);
  }

  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}