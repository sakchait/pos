import ProductListSec from "@/components/common/ProductListSec";
import Brands from "@/components/homepage/Brands";
import DressStyle from "@/components/homepage/DressStyle";
import Header from "@/components/homepage/Header";
import Reviews from "@/components/homepage/Reviews";
import { Product } from "@/types/product.types";
import { Review } from "@/types/review.types";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function Home() {
  let newArrivals: Product[] = [];
  let topSelling: Product[] = [];
  let reviews: Review[] = [];

  try {
    const allProducts = await api.getProducts();
    const apparelProducts = allProducts.filter(
      (p) => p.category === "Apparel" || p.sku?.startsWith("C")
    );

    if (apparelProducts.length > 0) {
      const na = apparelProducts.filter((p) =>
        ["C001", "C002", "C003", "C004"].includes(p.sku || "")
      );
      newArrivals = na.length > 0 ? na : apparelProducts.slice(0, 4);

      const ts = apparelProducts.filter((p) =>
        ["C005", "C006", "C007", "C008"].includes(p.sku || "")
      );
      topSelling = ts.length > 0 ? ts : apparelProducts.slice(4, 8);

      const targetProduct = newArrivals[0] || apparelProducts[0];
      if (targetProduct) {
        try {
          const reviewResult = await api.getReviews(targetProduct.id.toString());
          if (reviewResult && reviewResult.reviews.length > 0) {
            reviews = reviewResult.reviews;
          }
        } catch (reviewError) {
          console.error("Failed to fetch reviews from backend:", reviewError);
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch products from backend:", error);
  }

  return (
    <>
      <Header />
      <Brands />
      <main className="my-[50px] sm:my-[72px]">
        <ProductListSec
          title="NEW ARRIVALS"
          data={newArrivals}
          viewAllLink="/shop#new-arrivals"
        />
        <div className="max-w-frame mx-auto px-4 xl:px-0">
          <hr className="h-[1px] border-t-black/10 my-10 sm:my-16" />
        </div>
        <div className="mb-[50px] sm:mb-20">
          <ProductListSec
            title="top selling"
            data={topSelling}
            viewAllLink="/shop#top-selling"
          />
        </div>
        <div className="mb-[50px] sm:mb-20">
          <DressStyle />
        </div>
        <Reviews data={reviews} />
      </main>
    </>
  );
}
