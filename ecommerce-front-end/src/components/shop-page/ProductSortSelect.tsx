"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProductSortSelect({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleValueChange = (value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set("sortBy", value);
    current.set("page", "1"); // Reset to page 1 on sort change
    router.push(`${pathname}?${current.toString()}`);
  };

  return (
    <Select defaultValue={defaultValue} onValueChange={handleValueChange}>
      <SelectTrigger className="font-medium text-sm px-1.5 sm:text-base w-fit text-black bg-transparent shadow-none border-none">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="most-popular">Most Popular</SelectItem>
        <SelectItem value="low-price">Low Price</SelectItem>
        <SelectItem value="high-price">High Price</SelectItem>
        <SelectItem value="new-arrivals">New Arrivals</SelectItem>
      </SelectContent>
    </Select>
  );
}
