"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductPage from "@/client/components/ProductPage";
import ProductsLayout from "@/client/components/common/ProductsLayout";

function ProductsContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [selectedProductCategory, setSelectedProductCategory] = useState(null);

  return (
    <ProductsLayout
      setSelectedPriceRange={setSelectedPriceRange}
      setSelectedCategory={setSelectedProductCategory}
    >
      <ProductPage
        selectedCategory={category}
        selectedPriceRange={selectedPriceRange}
        selectedProductCategory={selectedProductCategory}
      />
    </ProductsLayout>
  );
}

export default function Products() {
  return (
    <Suspense fallback={<p>Loading ...</p>}>
      <ProductsContent />
    </Suspense>
  );
}
