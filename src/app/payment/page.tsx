
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import PayPalCheckout from "@/components/PayPalCheckout";

type SandboxRecipient = {
  accountId: string;
  displayName: string;
  phone: string;
  country: string;
  accountType: string;
  status: string;
  email: string;
  username?: string;
};

type RecipientDirectory = {
  success: boolean;
  source?: string;
  refreshedAt?: string;
  totalRecipients?: number;
  recipients?: SandboxRecipient[];
  error?: string;
};

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const type = searchParams.get("type") === "transfer"
    ? "transfer"
    : "purchase";

  const recipientInput = searchParams.get("recipient") || "";
  const amount = searchParams.get("amount") || "250.00";
  const note = searchParams.get("note") || "";

  const [recipients, setRecipients] = useState<SandboxRecipient[]>([]);
  const [directoryLoading, setDirectoryLoading] = useState(true);
  const [directoryError, setDirectoryError] = useState("");
  const [search, setSearch] = useState("");

useEffect(() => {
  setSearch(recipientInput);
}, [recipientInput]);
  const [proceed, setProceed] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentError, setPaymentError] = useState("");

  // Refresh the imported Sandbox recipient directory whenever
  // this shared payment page is opened.
  useEffect(() => {
    async function refreshDirectory() {
      try {
        setDirectoryLoading(true);
        setDirectoryError("");

        const response = await fetch("/api/recipients/refresh", {
          method: "GET",
          cache: "no-store",
        });

        const data: RecipientDirectory = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || "Unable to refresh recipient directory."
          );
        }

        setRecipients(data.recipients || []);
      } catch (error) {
        setDirectoryError(
          error instanceof Error
            ? error.message
            : "Unable to refresh recipient directory."
        );
      } finally {
        setDirectoryLoading(false);
      }
    }

    refreshDirectory();
  }, []);

  // Search the imported Sandbox directory.
  const matchingRecipients = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return [];

    return recipients.filter((recipient) => {
      return [
        recipient.displayName,
        recipient.phone,
        recipient.email,
        recipient.username || "",
        recipient.accountId,
      ].some((value) => value.toLowerCase().includes(term));
    });
  }, [recipients, search]);

  const selectedRecipient =
    matchingRecipients.length === 1 ? matchingRecipients[0] : null;

  function handleTransferConfirmation() {
    if (!selectedRecipient) {
      setPaymentError(
        "Please enter a recipient that matches a profile in the Sandbox directory."
      );
      return;
    }

    setPaymentError("");
    setPaymentStatus("SIMULATED");
  }

  function handlePaymentSuccess(payment: {
    id: string;
    status: string;
  }) {
    setPaymentStatus(payment.status);
  }

  function handlePaymentCancel() {
    setPaymentError("PayPal checkout was cancelled.");
  }

  function handlePaymentError(message: string) {
    setPaymentError(message);
  }

  const isPurchase = type === "purchase";

  return (
    <main className="min-h-screen bg-[#f5f7fa] px-4 py-8 text-gray-900">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href={isPurchase ? "/online-checkout" : "/send-money"}
            className="text-sm font-medium text-blue-700 hover:underline"
          >
            ← Back
          </Link>

          <div className="text-right">
            <p className="text-xl font-bold text-[#003087]">
              PayPal
            </p>
            <p className="text-xs text-gray-500">
              SafePay AI demonstration
            </p>
          </div>
        </div>

        {/* Prototype notice */}
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-900">
            Sandbox demonstration
          </p>
          <p className="mt-1 text-sm text-blue-800">
            This is a PayPal-inspired prototype with SafePay AI.
            It is not an official PayPal payment page or integration.
          </p>
        </div>

        {/* Main payment card */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-200 px-6 py-6">
            <h1 className="text-2xl font-bold">
              {isPurchase ? "Review your purchase" : "Review your payment"}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Check the details below before continuing.
            </p>
          </div>

          <div className="space-y-6 p-6">

            {/* Transaction details */}
            <div>
              <h2 className="mb-4 text-lg font-semibold">
                Transaction details
              </h2>

              {isPurchase ? (
                <div className="rounded-xl bg-gray-50 p-5">
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="font-semibold">ShopNow</p>
                      <p className="mt-1 text-sm text-gray-500">
                        Wireless Headphones
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        Online shopping demonstration
                      </p>
                    </div>

                    <p className="font-semibold">$250.00 USD</p>
                  </div>

                  <div className="mt-5 border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>$250.00</span>
                    </div>

                    <div className="mt-2 flex justify-between text-sm text-gray-600">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>

                    <div className="mt-4 flex justify-between border-t border-gray-200 pt-4 font-bold">
                      <span>Total</span>
                      <span>$250.00 USD</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-gray-50 p-5">
                  <p className="text-sm text-gray-500">
                    Sending money to
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {selectedRecipient?.displayName || recipientInput || "Recipient not entered"}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {selectedRecipient
                      ? selectedRecipient.phone
                      : recipientInput}
                  </p>

                  {note && (
                    <p className="mt-3 text-sm text-gray-600">
                      Note: {note}
                    </p>
                  )}

                  <div className="mt-5 border-t border-gray-200 pt-4">
                    <div className="flex justify-between font-bold">
                      <span>Amount</span>
                      <span>${amount} USD</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recipient directory */}
            <div className="rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold">
                  SafePay recipient directory
                </h2>

                {directoryLoading ? (
                  <span className="text-xs text-gray-500">
                    Refreshing...
                  </span>
                ) : directoryError ? (
                  <span className="text-xs text-red-600">
                    Refresh failed
                  </span>
                ) : (
                  <span className="text-xs font-medium text-green-700">
                    Updated
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm text-gray-500">
                SafePay refreshes its imported Sandbox test profiles
                whenever this payment page is opened. This is not a
                direct search of PayPal accounts.
              </p>

              {directoryLoading ? (
                <p className="mt-4 text-sm text-gray-500">
                  Loading recipient profiles...
                </p>
              ) : directoryError ? (
                <p className="mt-4 text-sm text-red-600">
                  {directoryError}
                </p>
              ) : (
                <p className="mt-4 text-sm text-gray-600">
                  {recipients.length} imported test profile
                  {recipients.length === 1 ? "" : "s"} available.
                </p>
              )}

              {type === "transfer" && (
                <div className="mt-5">
                  <label className="mb-2 block text-sm font-medium">
                    Find recipient
                  </label>

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPaymentError("");
                      setPaymentStatus("");
                    }}
                    placeholder="Search name, phone, email or username"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  {search.trim() && !directoryLoading && (
                    <div className="mt-3 space-y-2">
                      {matchingRecipients.length === 0 ? (
                        <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
                          No matching profile found in the imported
                          Sandbox directory.
                        </p>
                      ) : (
                        matchingRecipients.map((recipient) => (
                          <div
                            key={recipient.accountId}
                            className="rounded-lg border border-gray-200 p-3"
                          >
                            <p className="font-semibold">
                              {recipient.displayName}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                              {recipient.phone}
                              {recipient.email
                                ? ` · ${recipient.email}`
                                : ""}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              {recipient.accountType} account · {recipient.status}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SafePay analysis placeholder */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛡️</span>
                <h2 className="font-bold text-blue-950">
                  SafePay AI Transaction Analysis
                </h2>
              </div>

              <p className="mt-2 text-sm text-blue-900">
                SafePay will analyse the transaction details and
                present its risk assessment here before you continue
                to payment approval.
              </p>

              <p className="mt-3 text-xs text-blue-700">
                Analysis panel integration is the next development step.
              </p>
            </div>

            {/* Payment result */}
            {paymentStatus === "SIMULATED" ? (
              <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                <h2 className="font-bold text-green-900">
                  Transfer simulation completed
                </h2>
                <p className="mt-2 text-sm text-green-800">
                  This is a demonstration only. No real money was transferred.
                </p>
              </div>
            ) : paymentStatus === "COMPLETED" ? (
              <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                <h2 className="font-bold text-green-900">
                  PayPal Sandbox payment completed
                </h2>
                <p className="mt-2 text-sm text-green-800">
                  PayPal Sandbox confirmed the payment capture.
                </p>
              </div>
            ) : (
              <>
                {paymentError && (
                  <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {paymentError}
                  </p>
                )}

                {!proceed ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setPaymentError("");
                        setProceed(true);
                      }}
                      className="w-full rounded-full bg-[#0070e0] px-5 py-3 font-semibold text-white hover:bg-[#005eb8]"
                    >
                      Continue to SafePay review
                    </button>

                    <button
                      onClick={() => router.back()}
                      className="w-full rounded-full border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="font-semibold">
                        {isPurchase
                          ? "Continue with PayPal Sandbox"
                          : "Confirm transfer simulation"}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {isPurchase
                          ? "You will continue to PayPal Sandbox to approve and complete the payment."
                          : "This will simulate a transfer using the selected imported test recipient. No real money will be sent."}
                      </p>
                    </div>

                    {isPurchase ? (
                      <PayPalCheckout
                        amount={amount}
                        onSuccess={handlePaymentSuccess}
                        onCancel={handlePaymentCancel}
                        onError={handlePaymentError}
                      />
                    ) : (
                      <button
                        onClick={handleTransferConfirmation}
                        disabled={!selectedRecipient}
                        className="w-full rounded-full bg-[#0070e0] px-5 py-3 font-semibold text-white hover:bg-[#005eb8] disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        Confirm simulated transfer
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setProceed(false);
                        setPaymentError("");
                      }}
                      className="w-full rounded-full border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Go back
                    </button>
                  </div>
                )}
              </>
            )}

          </div>
        </section>

        <p className="mt-6 text-center text-xs text-gray-400">
          SafePay AI · Hackathon prototype · PayPal Sandbox
        </p>
      </div>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-50">
          <p className="text-sm text-gray-500">
            Loading payment page...
          </p>
        </main>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
