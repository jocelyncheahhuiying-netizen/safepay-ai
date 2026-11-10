import { promises as fs } from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

async function readResponse(response: Response, stage: string) {
  const raw = await response.text();

  let data: Record<string, unknown>;

  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(
      `${stage}: Invalid response. HTTP ${response.status}. ${raw.slice(0, 200) || "Empty response"}`
    );
  }

  if (!response.ok) {
    throw new Error(
      `${stage}: HTTP ${response.status}. ${
        data.error_description || data.message || "PayPal request failed."
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

    // Use the access token returned from the user's authorization.
const accessToken = initialData.access_token;

if (
  typeof accessToken !== "string" ||
  !accessToken
) {
  throw new Error("PayPal did not provide an access token.");
}

// Record granted permissions for debugging.
// Never expose the access token itself.
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
// Step 4: Save the linked PayPal account.
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

const recipientsPath = path.join(
  process.cwd(),
  "src",
  "data",
  "sandbox-recipients.json"
);

let recipients: Record<string, unknown>[] = [];

try {
  const fileContent = await fs.readFile(recipientsPath, "utf-8");
  recipients = JSON.parse(fileContent);
} catch {
  recipients = [];
}

const linkedAccount = {
  accountId: payerId,
  payerId,
  displayName: profile.name || "PayPal User",
  phone: "",
  country: "",
  accountType: "Unknown",
  status:
    profile.verified_account === true ||
    profile.verified_account === "true"
      ? "Verified"
      : "Unverified",
  email,
};

const existingIndex = recipients.findIndex(
  (recipient) => recipient.accountId === payerId
);

if (existingIndex >= 0) {
  recipients[existingIndex] = {
    ...recipients[existingIndex],
    ...linkedAccount,
  };
} else {
  recipients.push(linkedAccount);
}

await fs.writeFile(
  recipientsPath,
  JSON.stringify(recipients, null, 2),
  "utf-8"
);
    // Step 5: Return available profile information.
const response = NextResponse.json({
  success: true,
  message: "PayPal account successfully connected to SafePay.",
  grantedScopes,
    account: {
  userId: profile.user_id || profile.sub || null,
  payerId: profile.payer_id || null,
  name: profile.name || null,
  email: Array.isArray(profile.emails)
    ? (
        profile.emails.find(
          (entry: Record<string, unknown>) => entry.primary === true
        ) as Record<string, unknown> | undefined
      )?.value || null
    : null,
  verifiedAccount: profile.verified_account ?? null,
  accountType: profile.account_type || null,
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
