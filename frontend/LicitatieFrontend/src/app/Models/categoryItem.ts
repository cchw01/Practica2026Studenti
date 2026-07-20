import { AuctionItem } from './item-model';

export class Category {
  Id!: number;
  name!: string;

  constructor(item?: Partial<Category>) {
    if (item) {
      Object.assign(this, item);
    }
  }
}

export interface CategoryCreate {
  Name: string;
}
