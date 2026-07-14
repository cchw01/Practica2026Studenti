import { AuctionItem } from "../item-model";

export class Category {
  id!: number;
  name!: string;
  items!: Array<AuctionItem>;

  constructor(item?: Partial<Category>) {
    if (item) {
      Object.assign(this, item);
    }
  }
}
