
import { NextResponse } from "next/server";
import { getPayPalAccessToken } from "@/lib/paypal";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderID = body.orderID;

    // Validate the PayPal order ID
    if (
      typeof orderID !== "string" ||
      !/^[A-Za-z0-9-]+$/.test(orderID)
    ) {
      return NextResponse.json(
        { error: "Invalid PayPal order ID." },
        { status: 400 }
      );
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Capture the approved PayPal order
    const response = await fetch(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("PayPal capture failed:", data);

      return NextResponse.json(
        { error: "Unable to capture PayPal payment." },
        { status: response.status }
      );
    }

    return NextResponse.json({
      id: data.id,
      status: data.status,
      details: data.purchase_units?.[0]?.payments?.captures?.[0],
    });
  } catch (error) {
    console.error("Capture PayPal order error:", error);

    return NextResponse.json(
      { error: "An error occurred while capturing the payment." },
      { status: 500 }
    );
  }
}
