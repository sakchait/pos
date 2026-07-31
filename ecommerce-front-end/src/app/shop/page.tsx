import BreadcrumbShop from "@/components/shop-page/BreadcrumbShop";
import MobileFilters from "@/components/shop-page/filters/MobileFilters";
import Filters from "@/components/shop-page/filters";
import { FiSliders } from "react-icons/fi";
import ProductCard from "@/components/common/ProductCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { api } from "@/lib/api";
import { Product } from "@/types/product.types";
import ProductSortSelect from "@/components/shop-page/ProductSortSelect";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: {
    category?: string;
    style?: string;
    color?: string;
    size?: string;
    priceMin?: string;
    priceMax?: string;
    sortBy?: string;
    page?: string;
  };
}) {
  const pageNumber = searchParams.page ? parseInt(searchParams.page) : 1;
  const sortByMap = searchParams.sortBy || "most-popular";

  let products: Product[] = [];
  try {
    products = await api.getProducts({
      category: searchParams.category,
      dressStyle: searchParams.style,
      color: searchParams.color,
      size: searchParams.size,
      priceMin: searchParams.priceMin ? parseFloat(searchParams.priceMin) : undefined,
      priceMax: searchParams.priceMax ? parseFloat(searchParams.priceMax) : undefined,
      sortBy: sortByMap,
    });
  } catch (error) {
    console.error("Failed to load products from API:", error);
  }

  // Frontend Pagination
  const pageSize = 9;
  const totalCount = products.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const paginatedProducts = products.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

  const getQueryString = (overrides: Record<string, string | number | undefined>) => {
    const current = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        current.set(key, val);
      }
    });
    Object.entries(overrides).forEach(([key, val]) => {
      if (val === undefined) {
        current.delete(key);
      } else {
        current.set(key, val.toString());
      }
    });
    const str = current.toString();
    return str ? `?${str}` : "";
  };

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbShop />
        <div className="flex md:space-x-5 items-start">
          <div className="hidden md:block min-w-[295px] max-w-[295px] border border-black/10 rounded-[20px] px-5 md:px-6 py-5 space-y-5 md:space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-bold text-black text-xl">Filters</span>
              <FiSliders className="text-2xl text-black/40" />
            </div>
            <Filters />
          </div>
          <div className="flex flex-col w-full space-y-5">
            <div className="flex flex-col lg:flex-row lg:justify-between">
              <div className="flex items-center justify-between">
                <h1 className="font-bold text-2xl md:text-[32px]">
                  {searchParams.category
                    ? searchParams.category.charAt(0).toUpperCase() + searchParams.category.slice(1)
                    : "Catalog"}
                </h1>
                <MobileFilters />
              </div>
              <div className="flex flex-col sm:items-center sm:flex-row">
                <span className="text-sm md:text-base text-black/60 mr-3">
                  Showing {Math.min((pageNumber - 1) * pageSize + 1, totalCount)}-{Math.min(pageNumber * pageSize, totalCount)} of {totalCount} Products
                </span>
                <div className="flex items-center">
                  Sort by:{" "}
                  <ProductSortSelect defaultValue={sortByMap} />
                </div>
              </div>
            </div>
            <div className="w-full grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => (
                  <ProductCard key={product.id} data={product} />
                ))
              ) : (
                <div className="col-span-full text-center py-20 text-black/40 border border-dashed border-black/10 rounded-[20px]">
                  No products found matching your filters.
                </div>
              )}
            </div>
            <hr className="border-t-black/10" />
            <Pagination className="justify-between">
              <PaginationPrevious
                href={`/shop${getQueryString({ page: Math.max(1, pageNumber - 1) })}`}
                className="border border-black/10"
              />
              <PaginationContent>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <PaginationItem key={pNum}>
                      <PaginationLink
                        href={`/shop${getQueryString({ page: pNum })}`}
                        className="text-black/50 font-medium text-sm"
                        isActive={pageNumber === pNum}
                      >
                        {pNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
              </PaginationContent>
              <PaginationNext
                href={`/shop${getQueryString({ page: Math.min(totalPages, pageNumber + 1) })}`}
                className="border border-black/10"
              />
            </Pagination>
          </div>
        </div>
      </div>
    </main>
  );
}
