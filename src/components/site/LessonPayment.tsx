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
      <img src={qrAsset.url} alt="Paytm UPI QR code for N. Jalandhara Patro, 9861704224@ptsbi" className="mx-auto h-auto w-full max-w-sm rounded-lg" width={768} height={1206} loading="lazy" />
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
      {validAmount ? <Button asChild variant="cta" className="w-full"><a href={`upi://pay?${params.toString()}`}><Smartphone aria-hidden="true" />Pay ₹{Number(amount).toFixed(2)} with UPI</a></Button> : <Button variant="cta" className="w-full" disabled><Smartphone aria-hidden="true" />Enter amount to pay with UPI</Button>}
      <Button asChild variant="outline" className="h-auto min-h-11 w-full whitespace-normal py-3">
        <a href={`https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(receiptMessage)}`} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" />Send payment reference on WhatsApp</a>
      </Button>
      <p className="text-xs leading-relaxed text-muted-foreground">Scan with any UPI app, or open UPI on your phone. Send your UTR and booking details after payment. Payment and booking remain unconfirmed until our team checks receipt and confirms your lesson.</p>
    </div>
  );
}