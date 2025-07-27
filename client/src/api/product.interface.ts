export interface IProduct {
    id: number;
    name: string;
    description: string;
    price: string;
    stock: number;
    imageUrl: string;
    category? : string
  }