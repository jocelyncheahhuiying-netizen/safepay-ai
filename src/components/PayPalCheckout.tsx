
"use client";

import {
  PayPalProvider,
  PayPalOneTimePaymentButton,
} from "@paypal/react-paypal-js/sdk-v6";

type PayPalCheckoutProps = {
  amount: string;
  onSuccess: (payment: { id: string; status: string }) => void;
  onCancel: () => void;
  onError: (message: string) => void;
};

export default function PayPalCheckout({
  amount,
  onSuccess,
  onCancel,
  onError,
}: PayPalCheckoutProps) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!clientId) {
    return (
      <p className="text-sm text-red-600">
        PayPal Client ID is missing. Please check your environment settings.
      </p>
    );
  }

  async function createOrder(): Promise<{ orderId: string }> {
    const response = await fetch("/api/paypal/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }),
    });

    const data = await response.json();

    if (!response.ok || !data.id) {
      throw new Error(data.error || "Unable to create PayPal order.");
    }

    return { orderId: data.id };
  }

  async function captureOrder(orderId: string) {
    const response = await fetch("/api/paypal/capture-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderID: orderId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to complete PayPal payment.");
    }

    if (data.status !== "COMPLETED") {
      throw new Error("PayPal has not confirmed payment completion.");
    }

    onSuccess({
      id: data.id,
      status: data.status,
    });
  }

  return (
    <PayPalProvider
      clientId={clientId}
      environment="sandbox"
      components={["paypal-payments"]}
      pageType="checkout"
    >
      <div className="w-full">
        <PayPalOneTimePaymentButton
          createOrder={createOrder}
          onApprove={async (data) => {
            try {
              await captureOrder(data.orderId);
            } catch (error) {
              onError(
                error instanceof Error
                  ? error.message
                  : "Payment capture failed."
              );
            }
          }}
          onCancel={onCancel}
          onError={(error) => {
            onError(error.message || "PayPal checkout encountered an error.");
          }}
          presentationMode="auto"
        />
      </div>
    </PayPalProvider>
  );
}
