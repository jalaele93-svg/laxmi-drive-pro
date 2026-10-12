import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export const Route = createFileRoute("/payment-test")({
  component: PaymentTest,
  head: () => ({ meta: [{ title: "Razorpay Test Checkout | Laxmi Driving Training" }, { name: "robots", content: "noindex,nofollow" }] }),
});

async function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Razorpay Checkout could not load"));
    document.body.appendChild(script);
  });
}

function PaymentTest() {
  const [vehicle, setVehicle] = useState("Car");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function pay() {
    setBusy(true);
    setMessage("");
    try {
      await loadRazorpay();
      const { data: order, error } = await supabase.functions.invoke("razorpay-test-order", { body: { vehicle } });
      if (error || !order?.orderId) throw new Error(order?.error || "Could not create test order. Check backend deployment and secrets.");
      if (!window.Razorpay) throw new Error("Razorpay Checkout unavailable");
      const checkout = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: "INR",
        name: "Laxmi Driving Training",
        description: `${vehicle} training booking advance — TEST MODE`,
        handler: async (result: Record<string, string>) => {
          setBusy(true);
          try {
            const { data, error: verifyError } = await supabase.functions.invoke("razorpay-test-verify", { body: result });
            if (verifyError || !data?.verified) throw new Error(data?.error || "Payment could not be verified.");
            setMessage("Test payment verified successfully. No real money was transferred.");
          } catch (e) {
            setMessage(e instanceof Error ? e.message : "Verification failed. Do not retry before checking the transaction.");
          } finally { setBusy(false); }
        },
        modal: { ondismiss: () => { setMessage("Checkout closed; no payment confirmed."); setBusy(false); } },
        theme: { color: "#223dff" },
      });
      checkout.open();
      setBusy(false);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Payment test failed");
      setBusy(false);
    }
  }
  return <main className="mx-auto max-w-xl px-4 py-16">
    <h1 className="mb-3 text-3xl font-bold">Razorpay Payment Test</h1>
    <p className="mb-6 text-sm text-muted-foreground">TEST MODE ONLY. This page does not create a real booking or charge real money. Booking advances are set securely on the server.</p>
    <label className="mb-2 block font-semibold" htmlFor="test-vehicle">Choose training vehicle</label>
    <select id="test-vehicle" className="mb-5 h-12 w-full rounded-lg border bg-background px-3" value={vehicle} onChange={e => setVehicle(e.target.value)}>
      <option>Car</option><option>Bike</option><option>Scooter</option><option>Auto</option>
    </select>
    <Button type="button" disabled={busy} onClick={pay} className="w-full">{busy ? "Please wait…" : "Open Razorpay Test Checkout"}</Button>
    {message && <p role="status" className="mt-5 rounded-lg border p-3">{message}</p>}
    <p className="mt-6 text-xs text-muted-foreground">This is an isolated checkout test. Admin balance payments, installments, booking linkage and live payment activation are not implemented yet.</p>
  </main>;
}
