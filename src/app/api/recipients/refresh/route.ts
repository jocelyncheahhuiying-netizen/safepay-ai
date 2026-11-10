
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
  const filePath = path.join(
    process.cwd(),
    "src",
    "data",
    "sandbox-recipients.json"
  );

  try {
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
    // A missing file is expected on a fresh deployment.
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return NextResponse.json(
        {
          success: true,
          source: "empty-directory",
          refreshedAt: new Date().toISOString(),
          totalRecipients: 0,
          recipients: [],
        },
        {
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }

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
