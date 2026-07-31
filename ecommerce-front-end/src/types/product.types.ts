export type Discount = {
  amount: number;
  percentage: number;
};

export type Product = {
  id: string | number;
  title: string;
  srcUrl: string;
  gallery?: string[];
  price: number;
  discount: Discount;
  rating: number;
  category?: string;
  sku?: string;
};
