import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  styleUrl: './review.scss'
})
export class ReviewComponent implements OnInit {
  reviews: Review[] = [];
  reviewForm: FormGroup;
  editingReviewId: number | null = null;
  errorMessage: string | null = null;

  constructor(
    private reviewService: ReviewService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
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
    next: (data) => {
      this.reviews = data.sort((a, b) => 
        new Date(b.ReviewDate).getTime() - new Date(a.ReviewDate).getTime()
      );
    },
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
      next: (updated) => {
        const index = this.reviews.findIndex(r => r.Id === this.editingReviewId);
        if (index !== -1) {
          this.reviews[index] = updated;
        }
        this.cdr.detectChanges();
        this.resetForm();
      },
      error: () => (this.errorMessage = 'Eroare la actualizarea review-ului.')
    });
  } else {
    this.reviewService.addReview(formValue).subscribe({
      next: (created) => {
        this.reviews.unshift(created);
        this.cdr.detectChanges();
        this.resetForm();
      },
      error: (err) => {
        this.errorMessage = err.error ?? 'Eroare la adăugarea review-ului.';
        console.error(err);
      }
    });
  }
}

  editReview(review: Review): void {
  this.editingReviewId = review.Id;
  this.reviewForm.patchValue({
    reviewerId: review.ReviewerId,
    reviewedUserId: review.ReviewedUserId,
    rating: review.Rating,
    comment: review.Comment
  });
}

 deleteReview(id: number): void {
  this.reviewService.deleteReview(id).subscribe({
    next: () => {
      this.reviews = this.reviews.filter(r => r.Id !== id);
      this.cdr.detectChanges();
    },
    error: () => (this.errorMessage = 'Eroare la ștergerea review-ului.')
  });
}

trackByReviewId(index: number, review: Review): number {
  return review.Id;
}
  cancelEdit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.editingReviewId = null;
    this.reviewForm.reset({ rating: 0 });
  }
}