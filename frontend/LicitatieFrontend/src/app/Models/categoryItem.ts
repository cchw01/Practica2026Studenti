
export class Category {
  Id!: number;
  name!: string;
  description: string = '';

  constructor(category?: Partial<Category>) {
    if (category) {
      Object.assign(this, category);
    }
  }
}

export interface CategoryCreate {
  Name: string;
  Description: string;
}
