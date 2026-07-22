export interface Review {
  Id: number;
  ReviewerId: number;
  ReviewerUserName: string;
  ReviewedUserId: number;
  ReviewedUserUserName: string;
  Rating: number;
  Comment: string;
  ReviewDate: string;
}

export interface ReviewCreate {
  ReviewerId: number;
  ReviewedUserId: number;
  Rating: number;
  Comment: string;
}