
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SendMoney() {
  const router = useRouter();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("100.00");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const validAmount =
    amount.trim() !== "" &&
    Number.isFinite(Number(amount)) &&
    Number(amount) > 0 &&
    /^\d+(\.\d{1,2})?$/.test(amount);

  function handleContinue() {
    if (!recipient.trim()) {
      setError("Please enter the recipient's name or email.");
      return;
    }

    if (!validAmount) {
      setError("Please enter a valid transfer amount.");
      return;
    }

    const params = new URLSearchParams({
      type: "transfer",
      recipient: recipient.trim(),
      amount,
      note: note.trim(),
    });

    router.push(`/payment?${params.toString()}`);
  }

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-xl font-bold text-[#0070E0]">
              PayPal
            </h1>
            <p className="text-xs text-slate-500">
              Send and receive money
            </p>
          </div>

          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            SANDBOX DEMO
          </span>
        </div>
      </header>

      {/* Main content */}
      <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Heading */}
          <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Money transfer
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              Send Money
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Send money to friends, family or other people.
              Review your transfer details before continuing.
            </p>
          </div>

          {/* Transfer form */}
          <div className="space-y-6 px-6 py-7 sm:px-8">

            {/* Recipient */}
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Recipient
              </label>

              <p className="mt-1 text-xs text-slate-400">
                Enter the recipient's name, PayPal username, email address or mobile phone number.
              </p>

              <input
                type="text"
                value={recipient}
                onChange={(e) => {
                  setRecipient(e.target.value);
                  setError("");
                }}
                placeholder="e.g. Alex Tan, @alextan, alex@example.com or 1234567890"
                className="mt-3 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Transfer amount
              </label>

              <div className="mt-3 flex items-center rounded-lg border border-slate-200 px-4 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                <span className="text-sm text-slate-400">$</span>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError("");
                  }}
                  className="w-full bg-transparent py-3 pl-2 text-sm outline-none"
                />

                <span className="text-sm font-medium text-slate-500">
                  USD
                </span>
              </div>
            </div>

            {/* Optional note */}
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Payment note
                <span className="ml-1 font-normal text-slate-400">
                  (optional)
                </span>
              </label>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's this payment for?"
                rows={3}
                className="mt-3 w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Transfer summary */}
            <div className="rounded-xl bg-slate-50 p-5">
              <h3 className="text-sm font-semibold text-slate-700">
                Transfer summary
              </h3>

              <div className="mt-4 flex justify-between text-sm text-slate-500">
                <span>Recipient</span>
                <span className="max-w-[60%] truncate font-medium text-slate-700">
                  {recipient.trim() || "Not entered"}
                </span>
              </div>

              <div className="mt-3 flex justify-between text-sm text-slate-500">
                <span>Transfer amount</span>
                <span className="font-medium text-slate-700">
                  ${Number(amount || 0).toFixed(2)} USD
                </span>
              </div>

              <div className="mt-4 flex justify-between border-t border-slate-200 pt-4">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">
                  ${Number(amount || 0).toFixed(2)} USD
                </span>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {/* Continue button */}
            <button
              onClick={handleContinue}
              disabled={!recipient.trim() || !validAmount}
              className="w-full rounded-lg bg-[#0070E0] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#005EA6] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue to Confirm Transfer
            </button>

            <p className="text-center text-xs text-slate-400">
              PayPal Sandbox demonstration. No real money will be transferred.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
