import { StatusEnum } from "./status-enum";

export interface AuctionItem {
  id: number;
  name: string;
  startPrice: number;
  currentPrice: number;
  category?: string; //TODO category
  description?: string;
  location: string;
  owner: string; //TODO user
  winner: string; //TODO user
  status: StatusEnum;
  startDate: Date;
  endDate: Date;
  //photoList ???
}
