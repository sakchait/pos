"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { IoMdCheckmark } from "react-icons/io";
import { cn } from "@/lib/utils";

const colorList = [
  { name: "Green", class: "bg-green-600" },
  { name: "Red", class: "bg-red-600" },
  { name: "Yellow", class: "bg-yellow-300" },
  { name: "Orange", class: "bg-orange-600" },
  { name: "Blue", class: "bg-blue-600" },
  { name: "Purple", class: "bg-purple-600" },
  { name: "Pink", class: "bg-pink-600" },
  { name: "White", class: "bg-white" },
  { name: "Black", class: "bg-black" },
];

const ColorsSection = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const selectedColor = searchParams.get("color");

  const handleColorClick = (colorName: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (selectedColor?.toLowerCase() === colorName.toLowerCase()) {
      current.delete("color");
    } else {
      current.set("color", colorName);
    }
    current.set("page", "1"); // Reset page
    router.push(`${pathname}?${current.toString()}`);
  };

  return (
    <Accordion type="single" collapsible defaultValue="filter-colors">
      <AccordionItem value="filter-colors" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          Colors
        </AccordionTrigger>
        <AccordionContent className="pt-4 pb-0">
          <div className="flex space-2.5 flex-wrap md:grid grid-cols-5 gap-2.5">
            {colorList.map((color, index) => {
              const isActive = selectedColor?.toLowerCase() === color.name.toLowerCase();
              return (
                <button
                  key={index}
                  type="button"
                  className={cn([
                    color.class,
                    "rounded-full w-9 sm:w-10 h-9 sm:h-10 flex items-center justify-center border border-black/20",
                  ])}
                  onClick={() => handleColorClick(color.name)}
                >
                  {isActive && (
                    <IoMdCheckmark className={cn([
                      "text-base",
                      color.name === "White" ? "text-black" : "text-white"
                    ])} />
                  )}
                </button>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ColorsSection;
