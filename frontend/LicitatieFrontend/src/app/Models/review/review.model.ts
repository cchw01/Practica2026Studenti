export interface Review {
  id: number;
  reviewerId: number;
  reviewer: string;
  reviewedUserId: number;
  reviewedUser: string;
  rating: number;
  comment: string;
  reviewDate: string; // ISO date string primit de la backend
}

// Folosit la creare, unde id și reviewDate sunt setate de backend
export type ReviewCreate = Omit<Review, 'id' | 'reviewDate'>;