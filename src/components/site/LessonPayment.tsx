import { useState } from "react";
import { Check, Copy, MessageCircle, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import qrAsset from "@/assets/lesson-payment-qr.png.asset.json";
import { site } from "@/lib/site";

const upiId = "9861704224@ptsbi";
const recipient = "N. Jalandhara Patro";

export function LessonPayment() {
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("Booking advance");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const validAmount = /^\d+(\.\d{1,2})?$/.test(amount) && Number(amount) > 0;
  const params = new URLSearchParams({ pa: upiId, pn: recipient, cu: "INR", tn: `Laxmi Driving Training - ${purpose}` });
  if (validAmount) params.set("am", Number(amount).toFixed(2));
  const upiLink = `upi://pay?${params.toString()}`;
  // The QR contains the same amount-specific UPI payment link as the mobile button.
  const qrUrl = validAmount
    ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&data=${encodeURIComponent(upiLink)}`
    : qrAsset.url;
  const receiptMessage = `Hello, I made a UPI payment for driving training.\nPurpose: ${purpose}\nAmount: ${validAmount ? `₹${Number(amount).toFixed(2)}` : ""}\nLearner name:\nBooking mobile number:\nUTR / transaction reference:\nPlease verify receipt of payment.`;

  async function copyUpi() {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      setCopyError("");
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopyError("Please select and copy the UPI ID shown below.");
    }
  }

  return (
    <div id="lesson-payment" className="space-y-4 border-t border-border pt-6">
      <div>
        <h2 className="font-display text-xl font-bold">Pay lesson fees or a booking advance</h2>
        <p className="mt-2 text-sm text-muted-foreground">Confirm your fee or advance amount with our team before paying. Check the recipient name in your UPI app.</p>
      </div>
      <div className="rounded-xl bg-muted/50 p-4">
        <p className="mb-3 text-center text-sm font-semibold">
          {validAmount ? `Scan to pay ₹${Number(amount).toFixed(2)}` : "Enter an amount below to generate a payment QR"}
        </p>
        <img key={qrUrl} src={qrUrl} alt={validAmount ? `UPI payment QR for ₹${Number(amount).toFixed(2)} to ${recipient}` : `UPI QR code for ${recipient}`} className="mx-auto h-auto w-full max-w-xs rounded-lg bg-white p-2" width={320} height={320} loading="lazy" />
        <p className="mt-3 text-center text-xs text-muted-foreground">
          On a laptop: open Google Pay, PhonePe, Paytm or your bank's UPI app on your phone and scan this QR. On a phone: use the Pay with UPI button below.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0 text-sm">
          <p className="font-semibold">{recipient}</p>
          <p className="break-all text-primary">{upiId}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={copyUpi} aria-label="Copy UPI ID">
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />} {copied ? "Copied" : "Copy UPI ID"}
        </Button>
      </div>
      {copyError && <p role="alert" className="text-sm text-destructive">{copyError}</p>}
      <label className="grid gap-2 text-sm font-semibold" htmlFor="lesson-payment-purpose">
        Payment for
        <select id="lesson-payment-purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-foreground">
          <option>Booking advance</option>
          <option>Lesson fees</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold" htmlFor="lesson-payment-amount">
        Confirmed amount (₹)
        <input id="lesson-payment-amount" type="number" inputMode="decimal" min="0.01" step="0.01" placeholder="Enter the amount agreed with our team" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground" />
      </label>
      {validAmount ? <Button asChild variant="cta" className="w-full"><a href={upiLink}><Smartphone aria-hidden="true" />Pay ₹{Number(amount).toFixed(2)} with UPI</a></Button> : <Button variant="cta" className="w-full" disabled><Smartphone aria-hidden="true" />Enter amount to pay with UPI</Button>}
      <Button asChild variant="outline" className="h-auto min-h-11 w-full whitespace-normal py-3">
        <a href={`https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(receiptMessage)}`} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" />Send payment reference on WhatsApp</a>
      </Button>
      <p className="text-xs leading-relaxed text-muted-foreground">The Pay with UPI button requires a compatible UPI app, so it may not work on laptops. Scan the QR from a phone instead. Confirm the recipient and amount in your UPI app before approving. Send your UTR and booking details after payment. Payment and booking remain unconfirmed until our team verifies receipt.</p>
    </div>
  );
}