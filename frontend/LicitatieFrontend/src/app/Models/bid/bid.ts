import { AuctionItem } from '../item/item-model';
import { User } from '../user/user';

export interface Bid {
  id: number;
  Bidder: User;
  BidderId: number;
  BidderItem: AuctionItem;
  BidderItemId: number;
  price: number;
  date: Date;
}
