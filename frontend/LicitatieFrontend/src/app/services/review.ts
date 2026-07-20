import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review {
  id: number;
  reviewerId: number;
  reviewer?: { userName: string } | null;
  reviewedUserId: number;
  reviewedUser?: { userName: string } | null;
  rating: number;
  comment: string;
  reviewDate: string;
}

export type ReviewCreate = Omit<Review, 'id' | 'reviewDate' | 'reviewer' | 'reviewedUser'>;

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