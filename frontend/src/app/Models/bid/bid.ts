import { AuctionItem } from "../item-model";
import { User } from '../user/user';

export interface BidDto {
  id: number;
  userName: string;
  userId: number;
  itemName: string;
  auctionItemId: number;
  price: number;
  date: Date;
}

export interface CreateBidDto {
  auctionItemId: number;
  price : number;
}