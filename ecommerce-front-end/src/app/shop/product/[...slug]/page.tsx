import ProductListSec from "@/components/common/ProductListSec";
import BreadcrumbProduct from "@/components/product-page/BreadcrumbProduct";
import Header from "@/components/product-page/Header";
import Tabs from "@/components/product-page/Tabs";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { Product } from "@/types/product.types";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: { slug: string[] };
}) {
  const productId = params.slug[0];
  let productData: Product | null = null;

  try {
    productData = await api.getProductById(productId);
  } catch (error) {
    console.error("Failed to load product details:", error);
    notFound();
  }

  if (!productData) {
    notFound();
  }

  // Load related products dynamically
  let relatedProducts: Product[] = [];
  try {
    const all = await api.getProducts({ category: "Apparel" });
    relatedProducts = all.filter((p) => p.id !== productId).slice(0, 4);
  } catch (error) {
    console.error("Failed to load related products:", error);
  }

  return (
    <main>
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbProduct title={productData.title} />
        <section className="mb-11">
          <Header data={productData} />
        </section>
        <Tabs productId={productId} />
      </div>
      {relatedProducts.length > 0 && (
        <div className="mb-[50px] sm:mb-20">
          <ProductListSec title="You might also like" data={relatedProducts} />
        </div>
      )}
    </main>
  );
}
