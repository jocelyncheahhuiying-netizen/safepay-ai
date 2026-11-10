
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnlineCheckout() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("paypal");

  const product = {
    name: "Wireless Headphones",
    quantity: 1,
    price: 250.00,
  };

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-xl font-bold text-orange-600">
              ShopNow
            </h1>
            <p className="text-xs text-slate-500">
              Demo online shopping store
            </p>
          </div>

          <span className="text-sm text-slate-500">
            Checkout
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h2 className="text-2xl font-bold">Checkout</h2>
        <p className="mt-2 text-sm text-slate-500">
          Review your order and select a payment method.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold">Delivery information</h3>

              <div className="mt-4 space-y-3">
                <input
                  placeholder="Recipient name"
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />

                <input
                  placeholder="Delivery address"
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />

                <input
                  placeholder="Phone number"
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold">Payment method</h3>

              <button
                onClick={() => setPaymentMethod("paypal")}
                className={`mt-4 flex w-full items-center justify-between rounded-lg border-2 p-4 text-left transition ${
                  paymentMethod === "paypal"
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div>
                  <p className="font-semibold">PayPal</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Pay securely using PayPal
                  </p>
                </div>

                <span className="text-lg font-bold text-blue-700">
                  PayPal
                </span>
              </button>

              <button
                onClick={() => setPaymentMethod("card")}
                className={`mt-3 flex w-full items-center justify-between rounded-lg border-2 p-4 text-left transition ${
                  paymentMethod === "card"
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div>
                  <p className="font-semibold">Credit / Debit Card</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Visa, Mastercard and other cards
                  </p>
                </div>

                <span className="text-xl">💳</span>
              </button>
            </div>
          </div>

          <div className="h-fit rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="font-semibold">Order summary</h3>

            <div className="mt-5 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-3xl">
                🎧
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold">
                  {product.name}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Quantity: {product.quantity}
                </p>
              </div>

              <p className="text-sm font-semibold">
                ${product.price.toFixed(2)}
              </p>
            </div>

            <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Subtotal</span>
                <span>${product.price.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm text-slate-500">
                <span>Shipping</span>
                <span>Free</span>
              </div>

              <div className="flex justify-between border-t border-slate-100 pt-4 font-bold">
                <span>Total</span>
                <span>${product.price.toFixed(2)} USD</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (paymentMethod === "paypal") {
                  router.push("/payment?type=purchase");
                }
              }}
              className="mt-6 w-full rounded-lg bg-[#0070E0] px-5 py-3 font-semibold text-white transition hover:bg-[#005EA6]"
            >
              Continue to PayPal
            </button>

            <p className="mt-3 text-center text-xs text-slate-400">
              Demonstration checkout page
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
