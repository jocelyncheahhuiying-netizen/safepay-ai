
import { NextResponse } from "next/server";
import { getPayPalAccessToken } from "@/lib/paypal";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const amount = Number(body.amount);

    // Validate the checkout amount
    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !/^\d+(\.\d{1,2})?$/.test(String(body.amount))
    ) {
      return NextResponse.json(
        { error: "Invalid payment amount." },
        { status: 400 }
      );
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Create PayPal order
    const response = await fetch(
      "https://api-m.sandbox.paypal.com/v2/checkout/orders",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: amount.toFixed(2),
              },
            },
          ],
        }),
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("PayPal order creation failed:", data);

      return NextResponse.json(
        { error: "Unable to create PayPal order." },
        { status: response.status }
      );
    }

    return NextResponse.json({
      id: data.id,
    });
  } catch (error) {
    console.error("Create PayPal order error:", error);

    return NextResponse.json(
      { error: "An error occurred while creating the payment." },
      { status: 500 }
    );
  }
}
