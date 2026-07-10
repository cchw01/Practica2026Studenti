export class Category {
  id!: number;
  name!: string;
  items!: string; // to be modified later (with ArrayList - Item) when Item class is written

  constructor(item?: Partial<Category>) {
    if (item) {
      Object.assign(this, item);
    }
  }
}
