/**
 * Razorpay Payment Gateway Integration
 * Key ID: rzp_live_TpSwVtia3cgkgu
 */

import { createRazorpayOrder } from "./razorpay.server";

export const RAZORPAY_KEY_ID =
  (import.meta.env.VITE_RAZORPAY_KEY_ID as string) || "rzp_live_TpSwVtia3cgkgu";

export const DEFAULT_RAZORPAY_PHONE = "9861704224";

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface RazorpayPaymentOptions {
  amount: number; // in Rupees (e.g. 500)
  description?: string;
  purpose?: string;
  learnerName?: string;
  mobile?: string;
  email?: string;
  notes?: Record<string, string>;
  onSuccess?: (response: RazorpaySuccessResponse) => void;
  onError?: (error: unknown) => void;
  onDismiss?: () => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

/**
 * Dynamically loads the Razorpay checkout script if not already loaded.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Opens the Razorpay Checkout Modal
 */
export async function openRazorpayCheckout({
  amount,
  description = "Driving Lesson Payment",
  purpose = "Lesson Fees",
  learnerName = "",
  mobile = "",
  email = "",
  notes = {},
  onSuccess,
  onError,
  onDismiss,
}: RazorpayPaymentOptions): Promise<boolean> {
  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    onError?.(
      new Error("Unable to load Razorpay payment gateway. Please check your internet connection."),
    );
    return false;
  }

  // Razorpay takes amount in paise (1 INR = 100 paise)
  const amountInPaise = Math.round(amount * 100);

  // Generate official Razorpay Order ID on server to unlock NPCI UPI (GPay, PhonePe, Paytm, QR Code)
  let orderId: string | undefined;
  try {
    const orderRes = await createRazorpayOrder({
      data: {
        amount,
        receipt: `rcpt_${Date.now()}`,
        notes: {
          purpose,
          learner_name: learnerName,
          mobile,
        },
      },
    });
    if (orderRes?.orderId) {
      orderId = orderRes.orderId;
    }
  } catch (err) {
    console.warn("Server order generation notice:", err);
  }

  const options: Record<string, unknown> = {
    key: RAZORPAY_KEY_ID,
    amount: amountInPaise,
    currency: "INR",
    ...(orderId ? { order_id: orderId } : {}),
    name: "Laxmi Driving Training",
    description: `${purpose} - ₹${amount}`,
    image: "/favicon.png",
    prefill: {
      name: learnerName || undefined,
      contact: (mobile ? mobile.replace(/\D/g, "").slice(-10) : "") || DEFAULT_RAZORPAY_PHONE,
      email: email || "customer@laxmidriving.com",
    },
    notes: {
      purpose,
      learner_name: learnerName,
      mobile: (mobile ? mobile.replace(/\D/g, "").slice(-10) : "") || DEFAULT_RAZORPAY_PHONE,
      contact_phone: DEFAULT_RAZORPAY_PHONE,
      ...notes,
    },
    theme: {
      color: "#1E40E7", // matches primary brand blue
    },
    handler: function (response: RazorpaySuccessResponse) {
      onSuccess?.(response);
    },
    modal: {
      ondismiss: function () {
        onDismiss?.();
      },
    },
  };

  try {
    const rzp = new window.Razorpay(options);
    rzp.open();
    return true;
  } catch (err) {
    onError?.(err);
    return false;
  }
}
