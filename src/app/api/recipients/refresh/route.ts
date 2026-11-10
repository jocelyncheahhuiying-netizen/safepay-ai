
import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

type SandboxRecipient = {
  accountId: string;
  displayName: string;
  phone: string;
  country: string;
  accountType: string;
  status: string;
  email: string;
};

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      "src",
      "data",
      "sandbox-recipients.json"
    );

    // Read the latest imported recipient data.
    const fileContents = await readFile(filePath, "utf8");

    const recipients = JSON.parse(
      fileContents
    ) as SandboxRecipient[];

    return NextResponse.json(
      {
        success: true,
        source: "imported-sandbox-data",
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
        error: "Unable to refresh the recipient directory.",
      },
      { status: 500 }
    );
  }
}
