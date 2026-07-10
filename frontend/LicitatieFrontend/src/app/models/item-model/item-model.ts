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
  Status!: string; //statusEnum
  StartDate!: Date;
  EndDate!: Date;
  //PhotoList ???
}
