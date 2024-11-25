import { NextResponse } from "next/server";
import {
  // paymentOrder,
  // orderValidate,
  // GetAllPaymentRecords,
  genOrder,
  verifyPayment,
} from "@/server/controllers/paymentController";

export async function GET(request) {
  const url = new URL(request.url);
  const action = url.searchParams.get("controllerName");

  switch (action) {
    case "GetAllPaymentRecords":
      return await GetAllPaymentRecords(request);

    default:
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  }
}

export async function POST(request) {
  const url = new URL(request.url);
  const action = url.searchParams.get("controllerName");

  switch (action) {
    case "genOrder":
      return await genOrder(request);
    case "verifyPayment":
      return await verifyPayment(request);
    case "paymentOrder":
      return await paymentOrder(request);
    case "orderValidate":
      return await orderValidate(request);

    default:
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  }
}
