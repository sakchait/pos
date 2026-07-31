"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const SizeSection = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const selectedSize = searchParams.get("size");

  const handleSizeClick = (size: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (selectedSize === size) {
      current.delete("size");
    } else {
      current.set("size", size);
    }
    current.set("page", "1"); // Reset page
    router.push(`${pathname}?${current.toString()}`);
  };

  return (
    <Accordion type="single" collapsible defaultValue="filter-size">
      <AccordionItem value="filter-size" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          Size
        </AccordionTrigger>
        <AccordionContent className="pt-4 pb-0">
          <div className="flex items-center flex-wrap">
            {[
              "XX-Small",
              "X-Small",
              "Small",
              "Medium",
              "Large",
              "X-Large",
              "XX-Large",
              "3X-Large",
              "4X-Large",
            ].map((size, index) => (
              <button
                key={index}
                type="button"
                className={cn([
                  "bg-[#F0F0F0] m-1 flex items-center justify-center px-5 py-2.5 text-sm rounded-full max-h-[39px] text-black/60",
                  selectedSize === size && "bg-orange-600 font-medium text-white shadow-md shadow-orange-600/10",
                ])}
                onClick={() => handleSizeClick(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default SizeSection;
