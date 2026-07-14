import { StatusEnum } from './status-enum';
import { Category } from './user/categoryItem';
import { User } from './user/user';
import { Bid } from './bid/bid';

export interface AuctionItem {
  ID: number;
  Name: string;
  StartPrice: number;
  CurrentPrice: number;
  Category: Category;
  CategoryId: number;
  WishingUsers: Array<User>;
  Description?: string;
  Location: string;
  Owner: User;
  OwnerId: number;
  Winner?: User;
  WinnerId?: number;
  Status: StatusEnum;
  StartDate: Date;
  EndDate: Date;
  BidList: Array<Bid>;
  //photoList ???
}
