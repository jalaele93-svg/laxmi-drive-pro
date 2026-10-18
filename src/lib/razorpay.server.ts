import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const createOrderSchema = z.object({
  amount: z.number().positive(),
  receipt: z.string().optional(),
  notes: z.record(z.string()).optional(),
});

export const createRazorpayOrder = createServerFn({ method: "POST" })
  .validator((data: unknown) => createOrderSchema.parse(data))
  .handler(async ({ data }) => {
    const keyId =
      process.env["VITE_RAZORPAY_KEY_ID"] ||
      process.env["RAZORPAY_KEY_ID"] ||
      "rzp_test_TdVXL0e3vXa5VQ";
    const keySecret = process.env["RAZORPAY_KEY_SECRET"] || "eRlWmFo3l5oCj6r1hGre6cEu";

    if (!keyId || !keySecret) {
      throw new Error("Razorpay credentials are not configured on the server.");
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const amountInPaise = Math.round(data.amount * 100);

    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: data.receipt || `rcpt_${Date.now()}`,
        notes: data.notes || {},
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[Razorpay Orders API Error]", errText);
      throw new Error("Failed to create Razorpay payment order. Please try again.");
    }

    const orderData = (await res.json()) as { id: string; amount: number; currency: string };
    return { orderId: orderData.id, amount: orderData.amount, currency: orderData.currency };
  });
