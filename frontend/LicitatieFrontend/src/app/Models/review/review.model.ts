import { User } from "../user/user";

export interface Review {
  Id: number;
  ReviewerId: number;
  Reviewer: User;
  ReviewedUserId: number;
  ReviewedUser: User;
  Rating: number;
  Comment: string;
  ReviewDate: Date; // ISO date string primit de la backend
}

// Folosit la creare, unde id și reviewDate sunt setate de backend
export type ReviewCreate = Omit<Review, 'id' | 'ReviewDate'>;