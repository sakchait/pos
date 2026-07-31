"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";

const PriceSection = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const minVal = searchParams.get("priceMin") ? parseInt(searchParams.get("priceMin")!) : 0;
  const maxVal = searchParams.get("priceMax") ? parseInt(searchParams.get("priceMax")!) : 250;

  const handlePriceCommit = (values: number[]) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set("priceMin", values[0].toString());
    current.set("priceMax", values[1].toString());
    current.set("page", "1"); // Reset page
    router.push(`${pathname}?${current.toString()}`);
  };

  return (
    <Accordion type="single" collapsible defaultValue="filter-price">
      <AccordionItem value="filter-price" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          Price
        </AccordionTrigger>
        <AccordionContent className="pt-4" contentClassName="overflow-visible">
          <Slider
            defaultValue={[minVal, maxVal]}
            min={0}
            max={250}
            step={1}
            label="$"
            onValueCommit={handlePriceCommit}
          />
          <div className="mb-3" />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default PriceSection;
