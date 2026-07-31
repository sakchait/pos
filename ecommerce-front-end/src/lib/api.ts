import { Product } from "@/types/product.types";
import { Review } from "@/types/review.types";

if (typeof window === "undefined") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://localhost:62491";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BACKEND_URL}/api${path}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "x-functions-key": API_KEY,
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export type ProductFilters = {
  category?: string;
  dressStyle?: string;
  color?: string;
  size?: string;
  priceMin?: number;
  priceMax?: number;
  sortBy?: string;
  page?: number;
  pageSize?: number;
};

export const api = {
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          params.append(key, val.toString());
        }
      });
    }
    const queryString = params.toString();
    return apiFetch<Product[]>(`/products${queryString ? `?${queryString}` : ""}`, {
      cache: "no-store",
    });
  },

  async getProductById(id: string): Promise<Product> {
    return apiFetch<Product>(`/products/${id}`, {
      cache: "no-store",
    });
  },

  async getReviews(productId: string): Promise<{ averageRating: number; totalReviewsCount: number; reviews: Review[] }> {
    return apiFetch<any>(`/products/${productId}/reviews`, {
      cache: "no-store",
    });
  },

  async submitReview(productId: string, review: { customerName: string; rating: number; content: string }): Promise<any> {
    return apiFetch<any>(`/products/${productId}/reviews`, {
      method: "POST",
      body: JSON.stringify(review),
    });
  },

  async validateCoupon(code: string, cartSubtotal: number): Promise<{ isValid: boolean; discountAmount: number; message: string }> {
    return apiFetch<any>("/coupons/validate", {
      method: "POST",
      body: JSON.stringify({ code, cartSubtotal }),
    });
  },

  async submitCheckout(order: {
    customerName: string;
    shippingAddress: string;
    phoneNumber: string;
    items: { productId: string; quantity: number; selectedColor?: string; selectedSize?: string }[];
    promoCode?: string;
    paymentMethod: string;
    paymentReference?: string;
  }): Promise<{ message: string; orderId: string; orderNo: string; total: number }> {
    return apiFetch<any>("/ecommerce/orders", {
      method: "POST",
      body: JSON.stringify(order),
    });
  },
};
