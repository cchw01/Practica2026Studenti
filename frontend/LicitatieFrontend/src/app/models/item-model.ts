import { StatusEnum } from "./status-enum";

export class ItemModel {
  id!: number;
  name!: string;
  StartPrice!: number;
  CurrentPrice!: number;
  Category!: string; //category
  Description!: string;
  Location!: string;
  Owner!: string; //user
  Winner!: string; //user
  Status!: StatusEnum;
  StartDate!: Date;
  EndDate!: Date;
  //PhotoList ???
}
