
export type RiskLevel = "Low" | "Medium" | "High";

export type AlertRecord = {
  id: string;
  name: string;
  source: string;
  sourceUrl: string;
  dateAdded: string;
  category: string;
};

export type RiskAssessment = {
  risk: RiskLevel;
  message: string;
  explanation: string;
  matchedRecord: AlertRecord | null;
  matchType: "Exact match" | "Potential name match" | "No match";
};

// Sample records manually captured from BNM's published
// Financial Consumer Alert List.
// This is not a live or complete database.

const BNM_SOURCE =
  "https://www.bnm.gov.my/financial-consumer-alert-list";

const BNM_CATEGORY =
  "Potential clone entity - Financial Consumer Alert List";

export const alertRecords: AlertRecord[] = [
  "T Rowe Price United Ventures",
  "T Rowe Price Asset Resources",
  "T Rowe Price Asset Ventures",
  "T Rowe Price Group Sdn.Bhd",
  "T Rowe Price World Ventures",
  "T Rowe Price Global Ventures",
  "T Rowe Price Enterprise",
  "T Rowe Price Solutions",
  "T Rowe Price Empire",
  "T Rowe Price Resources",
  "T Rowe Price Ventures",
].map((name, index) => ({
  id: `BNM-${String(index + 1).padStart(3, "0")}`,
  name,
  source: "Bank Negara Malaysia",
  sourceUrl: BNM_SOURCE,
  dateAdded: "3 August 2026",
  category: BNM_CATEGORY,
}));

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function analyseMerchant(
  merchantName: string,
  merchantWebsite: string
): RiskAssessment {
  const normalizedMerchant = normalizeName(merchantName);

  if (!normalizedMerchant) {
    return {
      risk: "Low",
      message: "Merchant information is missing.",
      explanation:
        "Please provide a merchant name before running the assessment.",
      matchedRecord: null,
      matchType: "No match",
    };
  }

  const exactMatch = alertRecords.find(
    (record) =>
      normalizedMerchant === normalizeName(record.name)
  );

  if (exactMatch) {
    return {
      risk: "High",
      message: "An exact match was found in an alert list.",
      explanation:
        `The merchant name exactly matches "${exactMatch.name}", which appears in the BNM Financial Consumer Alert List. Review the official warning before deciding whether to proceed.`,
      matchedRecord: exactMatch,
      matchType: "Exact match",
    };
  }

  const potentialMatch = alertRecords.find((record) => {
    const alertName = normalizeName(record.name);

    return (
      normalizedMerchant.length >= 6 &&
      alertName.length >= 6 &&
      (
        alertName.includes(normalizedMerchant) ||
        normalizedMerchant.includes(alertName)
      )
    );
  });

  if (potentialMatch) {
    return {
      risk: "Medium",
      message: "A potential merchant name match was found.",
      explanation:
        `The merchant name resembles "${potentialMatch.name}" in the BNM Financial Consumer Alert List, but it is not an exact match. This could be a different business or a potential impersonation. Verify the merchant carefully.`,
      matchedRecord: potentialMatch,
      matchType: "Potential name match",
    };
  }

  return {
    risk: "Low",
    message: "No matching record was found.",
    explanation:
      "The merchant name did not match any entry in the current demonstration database. This does not guarantee that the merchant is legitimate or safe.",
    matchedRecord: null,
    matchType: "No match",
  };
}
