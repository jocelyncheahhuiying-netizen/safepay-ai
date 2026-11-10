
import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

export async function GET() {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const redirectUri = process.env.PAYPAL_REDIRECT_URI;

    if (!clientId || !redirectUri) {
  return NextResponse.json(
    {
      error: "Missing PayPal environment variables.",
      diagnostics: {
        PAYPAL_CLIENT_ID: Boolean(clientId),
        PAYPAL_REDIRECT_URI: Boolean(redirectUri),
      },
    },
    { status: 500 }
  );
}

    // Generate a secure state value to protect the login flow.
    const state = randomBytes(32).toString("hex");

    // Request the customer information approved in PayPal.
    const scopes = [
      "openid",
      "profile",
      "email",
      "https://uri.paypal.com/services/paypalattributes",
    ].join(" ");

    // Build the PayPal Sandbox authorization URL.
    const paypalUrl = new URL(
      "https://www.sandbox.paypal.com/connect"
    );

    paypalUrl.searchParams.set("flowEntry", "static");
    paypalUrl.searchParams.set("client_id", clientId);
    paypalUrl.searchParams.set("response_type", "code");
    paypalUrl.searchParams.set("scope", scopes);
    paypalUrl.searchParams.set("redirect_uri", redirectUri);
    paypalUrl.searchParams.set("state", state);
    paypalUrl.searchParams.set("fullPage", "true");

    const response = NextResponse.redirect(paypalUrl);

    // Store the state securely for callback verification.
    response.cookies.set("paypal_auth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/paypal/auth/callback",
      maxAge: 600,
    });

    return response;
  } catch (error) {
    console.error("PayPal login initialization failed:", error);

    return NextResponse.json(
      { error: "Unable to start PayPal sign-in." },
      { status: 500 }
    );
  }
}
