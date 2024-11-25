"use client";

import React, { Suspense } from "react";
import CheckOut from "@/client/components/common/checkOut";
import { useSearchParams } from "next/navigation";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const products = searchParams.get("products");

  return (
    <div>
      {products ? <CheckOut encryptedProducts={products} /> : <p>Loading...</p>}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<p>Loading checkout...</p>}>
      <CheckoutContent />
    </Suspense>
  );
}
