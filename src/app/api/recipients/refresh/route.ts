
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("sandbox_recipients")
      .select(
        "account_id, payer_id, display_name, phone, country, account_type, status, email"
      )
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    const recipients = (data || []).map((row) => ({
      accountId: row.account_id,
      payerId: row.payer_id,
      displayName: row.display_name,
      phone: row.phone,
      country: row.country,
      accountType: row.account_type,
      status: row.status,
      email: row.email,
    }));

    return NextResponse.json(
      {
        success: true,
        source: "supabase-sandbox-data",
        refreshedAt: new Date().toISOString(),
        totalRecipients: recipients.length,
        recipients,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Recipient directory refresh failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to refresh the recipient directory.",
      },
      { status: 500 }
    );
  }
}
