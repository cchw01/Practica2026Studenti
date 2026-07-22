export interface Review {
  id: number;
  reviewerId: number;
  reviewerUserName: string;
  reviewedUserId: number;
  reviewedUserUserName: string;
  rating: number;
  comment: string;
  reviewDate: string;
}

export interface ReviewCreate {
  reviewerId: number;
  reviewedUserId: number;
  rating: number;
  comment: string;
}