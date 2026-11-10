
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function readResponse(response: Response, stage: string) {
  const raw = await response.text();

  let data: Record<string, unknown>;

  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(
      `${stage}: Invalid response. HTTP ${response.status}. ${
        raw.slice(0, 200) || "Empty response"
      }`
    );
  }

  if (!response.ok) {
    throw new Error(
      `${stage}: HTTP ${response.status}. ${
        data.error_description ||
        data.message ||
        "PayPal request failed."
      }`
    );
  }

  return data;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");
  const paypalError = searchParams.get("error");

  const savedState = request.cookies.get("paypal_auth_state")?.value;

  if (paypalError) {
    return NextResponse.json(
      { success: false, error: paypalError },
      { status: 400 }
    );
  }

  if (!returnedState || !savedState || returnedState !== savedState) {
    return NextResponse.json(
      { success: false, error: "Invalid PayPal authorization state." },
      { status: 400 }
    );
  }

  if (!code) {
    return NextResponse.json(
      { success: false, error: "Authorization code is missing." },
      { status: 400 }
    );
  }

  try {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("PayPal credentials are missing.");
    }

    const credentials = Buffer.from(
      `${clientId}:${clientSecret}`
    ).toString("base64");

    const headers = {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    };

    // Step 1: Exchange authorization code for tokens.
    const initialResponse = await fetch(
      "https://api-m.sandbox.paypal.com/v1/oauth2/token",
      {
        method: "POST",
        headers,
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
        }).toString(),
        cache: "no-store",
      }
    );

    const initialData = await readResponse(
      initialResponse,
      "Authorization code exchange"
    );

    // Step 2: Validate the access token.
    const accessToken = initialData.access_token;

    if (typeof accessToken !== "string" || !accessToken) {
      throw new Error("PayPal did not provide an access token.");
    }

    const grantedScopes =
      typeof initialData.scope === "string"
        ? initialData.scope
        : "Not provided";

    // Step 3: Retrieve the authorised PayPal profile.
    const profileResponse = await fetch(
      "https://api-m.sandbox.paypal.com/v1/identity/oauth2/userinfo?schema=paypalv1.1",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const profile = await readResponse(
      profileResponse,
      "PayPal profile retrieval"
    );

    // Step 4: Extract the PayPal account information.
    const primaryEmail = Array.isArray(profile.emails)
      ? profile.emails.find(
          (entry: Record<string, unknown>) => entry.primary === true
        )
      : null;

    const email =
      primaryEmail && typeof primaryEmail.value === "string"
        ? primaryEmail.value
        : "";

    const payerId =
      typeof profile.payer_id === "string"
        ? profile.payer_id
        : "";

    if (!payerId) {
      throw new Error("PayPal did not return a valid payer ID.");
    }

    const displayName =
      typeof profile.name === "string"
        ? profile.name
        : "PayPal User";

    const accountType =
      typeof profile.account_type === "string"
        ? profile.account_type
        : "Unknown";

    const status =
      profile.verified_account === true ||
      profile.verified_account === "true"
        ? "Verified"
        : "Unverified";

    // Step 5: Save the recipient profile in Supabase.
    const { error: saveError } = await supabaseAdmin
      .from("sandbox_recipients")
      .upsert(
        {
          account_id: payerId,
          payer_id: payerId,
          display_name: displayName,
          phone: "",
          country: "",
          account_type: accountType,
          status,
          email,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "account_id",
        }
      );

    if (saveError) {
      throw new Error(
        `Failed to save recipient profile: ${saveError.message}`
      );
    }

    // Step 6: Return available profile information.
    const response = NextResponse.json({
      success: true,
      message: "PayPal account successfully connected to SafePay.",
      grantedScopes,
      account: {
        userId: profile.user_id || profile.sub || null,
        payerId,
        name: displayName,
        email: email || null,
        verifiedAccount: profile.verified_account ?? null,
        accountType,
        address: profile.address || null,
      },
    });

    response.cookies.delete("paypal_auth_state");

    return response;
  } catch (error) {
    console.error("PayPal account linking failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "PayPal account linking failed.",
      },
      { status: 500 }
    );
  }
}
