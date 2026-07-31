"use client";

import React from "react";
import CategoriesSection from "@/components/shop-page/filters/CategoriesSection";
import ColorsSection from "@/components/shop-page/filters/ColorsSection";
import DressStyleSection from "@/components/shop-page/filters/DressStyleSection";
import PriceSection from "@/components/shop-page/filters/PriceSection";
import SizeSection from "@/components/shop-page/filters/SizeSection";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

const Filters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasFilters = Array.from(searchParams.keys()).length > 0;

  const handleClearFilters = () => {
    router.push("/shop");
  };

  return (
    <>
      <hr className="border-t-black/10" />
      <CategoriesSection />
      <hr className="border-t-black/10" />
      <PriceSection />
      <hr className="border-t-black/10" />
      <ColorsSection />
      <hr className="border-t-black/10" />
      <SizeSection />
      <hr className="border-t-black/10" />
      <DressStyleSection />
      {hasFilters && (
        <Button
          type="button"
          onClick={handleClearFilters}
          className="bg-red-600 hover:bg-red-700 w-full rounded-full text-sm font-medium py-4 h-12 transition-colors mt-4 text-white"
        >
          Clear All Filters
        </Button>
      )}
    </>
  );
};

export default Filters;
