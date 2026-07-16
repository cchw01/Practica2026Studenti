import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Review, ReviewCreate } from './review.model';
import { ReviewService } from '../../services/review-service'; // <-- ajusteaza dupa calea reala la tine

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
      reviewedUserId: [null, [Validators.required]],
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
      error: () => (this.errorMessage = 'Nu am putut încărca review-urile.')
    });
  }

  onSubmit(): void {
    if (this.reviewForm.invalid) {
      return;
    }

    const formValue: ReviewCreate = this.reviewForm.value;

    if (this.editingReviewId !== null) {
      this.reviewService.updateReview(this.editingReviewId, formValue).subscribe({
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
        error: (err) => {
          this.errorMessage = err.error ?? 'Eroare la adăugarea review-ului.';
          console.error(err);
        }
      });
    }
  }

  editReview(review: Review): void {
    this.editingReviewId = review.id;
    this.reviewForm.patchValue({
      reviewerId: review.reviewerId,
      reviewedUserId: review.reviewedUserId,
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