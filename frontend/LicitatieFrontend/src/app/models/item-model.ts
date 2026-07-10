import { StatusEnum } from "./status-enum";

export interface AuctionItem {
  id: number;
  name: string;
  startPrice: number;
  currentPrice: number;
  category: string; //category
  description?: string;
  location: string;
  owner: string; //user
  winner?: string; //user
  status: StatusEnum;
  startDate: Date;
  endDate: Date;
  //photoList ???
}
