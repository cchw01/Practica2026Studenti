import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Review } from './review.model';
import { ReviewService } from '../../app-logic/review';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './review.html',
  styleUrl: './review.css'
})
export class ReviewComponent implements OnInit {
  reviews: Review[] = [];
  reviewForm: FormGroup;
  editingReviewId: number | null = null;
  errorMessage: string | null = null;

  constructor(
    private reviewService: ReviewService,
    private fb: FormBuilder
  ) {
    this.reviewForm = this.fb.group({
      reviewerId: [null, [Validators.required]],
      reviewer: ['', [Validators.required]],
      reviewedUserId: [null, [Validators.required]],
      reviewedUser: ['', [Validators.required]],
      rating: [0, [Validators.required, Validators.min(0), Validators.max(5)]],
      comment: ['', [Validators.maxLength(1000)]]
    });
  }

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.reviewService.getReviews().subscribe({
      next: (data) => (this.reviews = data),
      error: (err) => (this.errorMessage = 'Nu am putut încărca review-urile.')
    });
  }

  onSubmit(): void {
    if (this.reviewForm.invalid) {
      return;
    }

    const formValue = this.reviewForm.value;

    if (this.editingReviewId !== null) {
      const updatedReview: Review = {
        id: this.editingReviewId,
        reviewDate: new Date().toISOString(),
        ...formValue
      };

      this.reviewService.updateReview(updatedReview).subscribe({
        next: () => {
          this.resetForm();
          this.loadReviews();
        },
        error: () => (this.errorMessage = 'Eroare la actualizarea review-ului.')
      });
    } else {
      this.reviewService.addReview(formValue).subscribe({
        next: () => {
          this.resetForm();
          this.loadReviews();
        },
        error: () => (this.errorMessage = 'Eroare la adăugarea review-ului.')
      });
    }
  }

  editReview(review: Review): void {
    this.editingReviewId = review.id;
    this.reviewForm.patchValue({
      reviewerId: review.reviewerId,
      reviewer: review.reviewer,
      reviewedUserId: review.reviewedUserId,
      reviewedUser: review.reviewedUser,
      rating: review.rating,
      comment: review.comment
    });
  }

  deleteReview(id: number): void {
    this.reviewService.deleteReview(id).subscribe({
      next: () => this.loadReviews(),
      error: () => (this.errorMessage = 'Eroare la ștergerea review-ului.')
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.editingReviewId = null;
    this.reviewForm.reset({ rating: 0 });
  }
}