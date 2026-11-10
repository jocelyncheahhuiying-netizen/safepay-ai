
"use client";

import { useState } from "react";
import PayPalCheckout from "@/components/PayPalCheckout";
import {
  analyseMerchant,
  type RiskAssessment,
} from "@/lib/riskEngine";

export default function Home() {
  const [merchant, setMerchant] = useState("Example Electronics Store");
  const [website, setWebsite] = useState("");
  const [amount, setAmount] = useState("250.00");
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [decision, setDecision] = useState("");
  const [aiExplanation, setAiExplanation] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [paymentId, setPaymentId] = useState("");

  const riskStyles = {
    Low: "border-green-200 bg-green-50 text-green-800",
    Medium: "border-amber-200 bg-amber-50 text-amber-800",
    High: "border-red-200 bg-red-50 text-red-800",
  };

  async function handleAnalyse() {
  const result = analyseMerchant(merchant, website);

  setAssessment(result);
  setDecision("");
  setAiExplanation("");
  setAiError("");
  setAiLoading(true);

  try {
    const response = await fetch("/api/explain", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        merchantName: merchant,
        risk: result.risk,
        message: result.message,
        explanation: result.explanation,
        matchedRecord: result.matchedRecord
          ? {
              name: result.matchedRecord.name,
              source: result.matchedRecord.source,
              category: result.matchedRecord.category,
            }
          : null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to generate AI explanation.");
    }

    setAiExplanation(data.explanation);
  } catch (error) {
    console.error("AI explanation error:", error);

    setAiError(
      error instanceof Error
        ? error.message
        : "Unable to generate AI explanation."
    );
  } finally {
    setAiLoading(false);
  }
}

  function resetCheckout() {
  setAssessment(null);
  setDecision("");
  setAiExplanation("");
  setAiError("");
  setAiLoading(false);
  setPaymentError("");
  setPaymentId("");
}
  const validAmount =
  amount.trim() !== "" &&
  Number.isFinite(Number(amount)) &&
  Number(amount) > 0 &&
  /^\d+(\.\d{1,2})?$/.test(amount);

    return (
    <main className="min-h-screen bg-[#F5F7FA] text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="brand-mark relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-emerald-800">
              <svg
                viewBox="0 0 48 48"
                className="relative z-10 h-7 w-7"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M24 3L41 9V22C41 33 34 41 24 46C14 41 7 33 7 22V9L24 3Z"
                  fill="white"
                />
                <path
                  d="M15 24L21 30L33 17"
                  stroke="#087F5B"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="brand-mark-shine" />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">
                SafePay AI
              </h1>
              <p className="text-xs text-slate-500">
                Smarter payment security
              </p>
            </div>
          </div>

          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            PAYPAL SANDBOX
          </span>
        </div>
      </header>

      {/* Main transaction page */}
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Transaction heading */}
          <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Transaction review
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              Review your payment
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Check the transaction details and review the SafePay AI
              security assessment before continuing.
            </p>
          </div>

          {/* Transaction details */}
          <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Transaction details</h3>
              <span className="text-xs text-slate-400">
                Demo transaction
              </span>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-3xl">
                🎧
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold">Wireless Headphones</p>
                <p className="mt-1 text-sm text-slate-500">
                  Quantity: 1
                </p>
              </div>

              <p className="font-semibold">
                ${Number(amount || 0).toFixed(2)}
              </p>
            </div>

            <div className="mt-6 space-y-4 border-t border-slate-100 pt-5">
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Merchant name
                </label>
                <input
                  value={merchant}
                  onChange={(e) => {
                    setMerchant(e.target.value);
                    setAssessment(null);
                    setDecision("");
                    setAiExplanation("");
                    setAiError("");
                  }}
                  placeholder="Enter merchant name"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  Merchant website
                  <span className="ml-1 font-normal text-slate-400">
                    (optional)
                  </span>
                </label>
                <input
                  value={website}
                  onChange={(e) => {
                    setWebsite(e.target.value);
                    setAssessment(null);
                    setDecision("");
                    setAiExplanation("");
                    setAiError("");
                  }}
                  placeholder="e.g. example.com"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  Transaction amount (USD)
                </label>
                <div className="mt-2 flex items-center rounded-lg border border-slate-200 px-4 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                  <span className="text-sm text-slate-400">$</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setAssessment(null);
                      setDecision("");
                      setAiExplanation("");
                      setAiError("");
                    }}
                    className="w-full bg-transparent py-3 pl-2 text-sm outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
              <span className="text-sm font-medium text-slate-500">
                Total payment
              </span>
              <span className="text-2xl font-bold">
                ${Number(amount || 0).toFixed(2)} USD
              </span>
            </div>
          </div>

          {/* SafePay AI section */}
          <div className="px-6 py-7 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="brand-mark relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-emerald-800">
                <svg
                  viewBox="0 0 48 48"
                  className="relative z-10 h-8 w-8"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M24 3L41 9V22C41 33 34 41 24 46C14 41 7 33 7 22V9L24 3Z"
                    fill="white"
                  />
                  <path
                    d="M15 24L21 30L33 17"
                    stroke="#087F5B"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="brand-mark-shine" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold">
                    SafePay AI
                  </h3>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                    Security check
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  AI-powered merchant risk awareness
                </p>
              </div>
            </div>

            {!assessment ? (
              <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-7 text-center">
                <div className="mb-4 text-4xl">
                  <span className="search-icon inline-block">🔍</span>
                </div>

                <h4 className="font-semibold">
                  Check this merchant before paying
                </h4>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  SafePay AI will screen the merchant against the
                  available demonstration financial alert records.
                </p>

                <button
                  onClick={handleAnalyse}
                  disabled={!merchant.trim() || !validAmount}
                  className="mt-6 rounded-lg bg-[#0070E0] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#005EA6] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Analyse Transaction
                </button>
              </div>
            ) : (
              <div className="mt-7 space-y-6">

                {/* Risk result */}
                <div
                  className={`result-reveal rounded-xl border p-5 ${riskStyles[assessment.risk]}`}
                >
                  <p className="text-xs font-bold uppercase tracking-wider">
                    Risk assessment
                  </p>

                  <h4 className="risk-badge-pop mt-2 text-3xl font-bold">
                    {assessment.risk} Risk
                  </h4>

                  <p className="mt-2 text-sm font-medium leading-6">
                    {assessment.message}
                  </p>
                </div>

                {/* AI explanation */}
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">
                      AI Assessment Explanation
                    </h4>
                    <span className="text-xs font-medium text-emerald-700">
                      ✦ Gemini AI
                    </span>
                  </div>

                  {aiLoading ? (
                    <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-blue-100 bg-blue-50/50 p-6 text-center">
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                        <span className="shield-pulse text-4xl">
                          🛡️
                        </span>
                        <div className="scan-line absolute left-4 right-4 h-0.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3B82F6]" />
                      </div>

                      <h4 className="mt-6 font-semibold text-slate-800">
                        Analysing Merchant
                      </h4>

                      <p className="mt-2 text-sm text-slate-500">
                        Checking available financial alert records...
                      </p>

                      <div className="mt-4 flex gap-1.5">
                        <span className="scanning-dot h-2 w-2 rounded-full bg-blue-500" />
                        <span className="scanning-dot h-2 w-2 rounded-full bg-blue-500" />
                        <span className="scanning-dot h-2 w-2 rounded-full bg-blue-500" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="explanation-reveal space-y-2">
                        <h3
                          className={`text-2xl font-extrabold leading-tight ${
                            assessment.risk === "High"
                              ? "text-red-600"
                              : assessment.risk === "Medium"
                              ? "text-amber-600"
                              : "text-emerald-700"
                          }`}
                        >
                          {aiExplanation.match(/KEY FINDING:\s*([\s\S]*?)(?=WHAT WE FOUND:|$)/i)?.[1]?.trim() || "Assessment completed"}
                        </h3>
                      </div>

                      <div className="explanation-reveal space-y-2">
                        <h4 className="text-sm font-bold text-slate-800">
                          What we found
                        </h4>
                        <p className="text-sm leading-6 text-slate-600">
                          {aiExplanation.match(/WHAT WE FOUND:\s*([\s\S]*?)(?=WHAT THIS MEANS:|$)/i)?.[1]?.trim() || "No additional information available."}
                        </p>
                      </div>

                      <div className="explanation-reveal space-y-2">
                        <h4 className="text-sm font-bold text-slate-800">
                          What this means
                        </h4>
                        <p className="text-sm leading-6 text-slate-600">
                          {aiExplanation.match(/WHAT THIS MEANS:\s*([\s\S]*?)(?=RECOMMENDATION:|$)/i)?.[1]?.trim() || assessment.explanation}
                        </p>
                      </div>

                      <div className="explanation-reveal rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <p className="mb-1 text-xs font-bold tracking-wide text-amber-700">
                          RECOMMENDATION
                        </p>
                        <p className="text-sm font-semibold leading-6 text-amber-900">
                          {aiExplanation.match(/RECOMMENDATION:\s*([\s\S]*)/i)?.[1]?.trim() || "Review the available information before proceeding."}
                        </p>
                      </div>
                    </>
                  )}

                  {aiError && (
                    <p className="text-xs text-amber-700">
                      {aiError}
                    </p>
                  )}

                  {aiExplanation && (
                    <p className="text-xs text-slate-400">
                      AI-generated explanation based on the rule-based assessment.
                    </p>
                  )}
                </div>

                {/* Matching evidence */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Matching evidence
                  </p>

                  {assessment.matchedRecord ? (
                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                      <p>
                        <span className="font-medium">Listed entity: </span>
                        {assessment.matchedRecord.name}
                      </p>
                      <p>
                        <span className="font-medium">Match type: </span>
                        {assessment.matchType}
                      </p>
                      <p>
                        <span className="font-medium">Source: </span>
                        {assessment.matchedRecord.source}
                      </p>
                      <p>
                        <span className="font-medium">Alert category: </span>
                        {assessment.matchedRecord.category}
                      </p>
                      <p>
                        <span className="font-medium">Date added: </span>
                        {assessment.matchedRecord.dateAdded}
                      </p>

                      <a
                        href={assessment.matchedRecord.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block pt-2 font-semibold text-blue-700 underline"
                      >
                        View official alert source ↗
                      </a>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      No matching entity was found in the current
                      demonstration database.
                    </p>
                  )}
                </div>

                <p className="text-xs leading-5 text-slate-400">
                  SafePay AI is an initial rule-based demonstration,
                  not a complete fraud detection system. No match
                  does not guarantee that a merchant is safe.
                </p>

                <button
                  onClick={handleAnalyse}
                  className="w-full rounded-lg border border-slate-300 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Analyse Again
                </button>

                {/* Customer decision */}
                {!decision && (
                  <div className="border-t border-slate-200 pt-6">
                    <h4 className="font-semibold">
                      Your payment decision
                    </h4>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Review the information above before deciding
                      whether to continue with your payment.
                    </p>

                    <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
                      <button
                        onClick={() => setDecision("cancel")}
                        className="flex-1 rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Cancel Payment
                      </button>

                      <button
                        onClick={() => {
                          setPaymentError("");
                          setDecision("proceed");
                        }}
                        className="flex-1 rounded-lg bg-[#0070E0] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#005EA6]"
                      >
                        Continue to PayPal
                      </button>
                    </div>

                    <p className="mt-3 text-center text-xs text-slate-400">
                      SafePay AI provides information to support your
                      decision. You remain in control of your payment.
                    </p>
                  </div>
                )}

                {/* Cancelled */}
                {decision === "cancel" && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
                    <div className="cancel-icon text-3xl text-red-600">
                      ✕
                    </div>

                    <h4 className="mt-3 text-lg font-bold text-red-700">
                      Payment Cancelled
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-red-700">
                      You cancelled this transaction. No payment has
                      been made.
                    </p>

                    <button
                      onClick={resetCheckout}
                      className="mt-5 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-100"
                    >
                      Return to Transaction
                    </button>
                  </div>
                )}

                {/* PayPal payment */}
                {decision === "proceed" && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5">
                    <h4 className="font-semibold text-slate-900">
                      Continue with PayPal
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      You chose to proceed. Complete your{" "}
                      <span className="font-semibold">
                        ${Number(amount).toFixed(2)} USD
                      </span>{" "}
                      payment through PayPal Sandbox.
                    </p>

                    {paymentError && (
                      <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                        {paymentError}
                      </p>
                    )}

                    <div className="mt-5">
                      <PayPalCheckout
                        amount={amount}
                        onSuccess={(payment) => {
                          setPaymentId(payment.id);
                          setPaymentError("");
                          setDecision("success");
                        }}
                        onCancel={() => {
                          setDecision("");
                        }}
                        onError={(message) => {
                          setPaymentError(message);
                        }}
                      />
                    </div>

                    <button
                      onClick={() => {
                        setDecision("");
                        setPaymentError("");
                      }}
                      className="mt-4 w-full text-sm font-medium text-slate-500 underline hover:text-slate-800"
                    >
                      Back to transaction review
                    </button>
                  </div>
                )}

                {/* Successful payment */}
                {decision === "success" && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-700">
                      ✓
                    </div>

                    <h4 className="mt-4 text-xl font-bold text-emerald-700">
                      Payment Successful!
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Your PayPal Sandbox payment has been completed
                      successfully.
                    </p>

                    <div className="mt-5 rounded-lg bg-white p-4 text-left">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Payment reference
                      </p>
                      <p className="mt-2 break-all text-sm font-semibold text-slate-800">
                        {paymentId}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-emerald-700">
                        Completed
                      </p>
                    </div>

                    <button
                      onClick={resetCheckout}
                      className="mt-5 w-full rounded-lg bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900"
                    >
                      Return to Transaction
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            SafePay AI — An AI-powered payment risk awareness prototype.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            PayPal Sandbox demonstration. Not an official PayPal page.
          </p>
        </div>
      </section>
    </main>
  );
}
