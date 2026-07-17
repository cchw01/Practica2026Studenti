export interface ReviewDto {
  id: string;
  reviewerId: string;
  reviewerName: string;
  revieweeId: string;
  score: number;
  comment: string;
  createdAt: Date;
}

export interface AuctionItemSummaryDto {
  id: number;
  name: string;
  startPrice: number;
  currentPrice: number;
  category: string;
  status: string;
  startDate: Date;
  endDate: Date;
  ownerName: string;
}

export interface ProfileDto {
  id: string;
  userName: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  averageRating: number | null;
  totalReviewsReceived: number;
  reviewsReceived: ReviewDto[];
  addedItems: AuctionItemSummaryDto[];
  biddedItems: AuctionItemSummaryDto[];
  wishList: AuctionItemSummaryDto[];
}

export interface UpdateProfileDto {
  name: string;
  email: string;
  phoneNumber: string;
}
