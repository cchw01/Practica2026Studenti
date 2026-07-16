import { AuctionItem } from '../item-model';
import { Review } from '../review/review.model';
import { Bid } from '../bid/bid';

export enum RoleEnum {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST',
}

export class User {
  ID!: string;
  UserName!: string;
  Name!: string;
  Email!: string;
  Role!: RoleEnum;
  AddedItemsList!: Array<AuctionItem>;
  BidList!: Array<Bid>;
  WonItemsList!: Array<AuctionItem>;
  WhishList!: Array<AuctionItem>;
  Rating?: number;
  ReviewList!: Array<Review>;

  constructor(user?: Partial<User>) {
    Object.assign(this, user);
  }
}
