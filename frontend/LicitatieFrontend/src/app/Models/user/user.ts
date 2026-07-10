
export enum RoleEnum{
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST'
}

export class User {
  id!: string;
  userName!: string;
  name!: string;
  email!: string;
  role!: RoleEnum;
  addedItemsList!: string //List<Item>;
  biddedItemsList!: string; //List<Item>;
  whishList!: string; //List<Item>;
  rating?: number;
  reviewList!: string; //List<Review>;  
  
  constructor( user?: Partial<User>){
    Object.assign(this, user);
  }
}
