import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { useQueryClient } from '@tanstack/react-query';
import { CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { startLessonPayment, startPartnerPayment, verifyRazorpayPayment } from '@/lib/razorpay.functions';
import { openRazorpay, loadRazorpay } from '@/lib/razorpay-checkout';

export function RazorpayPayment({ token, applicationId, amount }: { token?: string; applicationId?: string; amount: number }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [paid, setPaid] = useState(false);
  const [proof, setProof] = useState<{ orderId: string; paymentId: string; signature: string } | null>(null);
  const startLesson = useServerFn(startLessonPayment);
  const startPartner = useServerFn(startPartnerPayment);
  const verify = useServerFn(verifyRazorpayPayment);
  const qc = useQueryClient();
  async function pay() {
    setBusy(true); setMessage('');
    try {
      let evidence = proof;
      if (!evidence) {
        await loadRazorpay();
        const order = applicationId ? await startPartner({ data: { applicationId } }) : token ? await startLesson({ data: { token } }) : null;
        if (!order) throw new Error('Payment link is missing.');
        const result = await openRazorpay(order);
        evidence = { orderId: result.razorpay_order_id, paymentId: result.razorpay_payment_id, signature: result.razorpay_signature };
        setProof(evidence);
      }
      const result = await verify({ data: evidence });
      setPaid(result.paid); setMessage(result.message);
      await qc.invalidateQueries();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Payment could not be confirmed. Please retry.'); }
    finally { setBusy(false); }
  }
  return <div className="space-y-3">
    <p className="text-sm text-muted-foreground">Secure Razorpay checkout · UPI, cards and netbanking. Test payments do not collect real money.</p>
    <Button type="button" variant="cta" disabled={busy || paid} onClick={pay} className="h-auto min-h-11 whitespace-normal">
      {busy ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
      {busy ? 'Processing…' : paid ? 'Payment verified' : proof ? 'Check payment status' : `Pay ₹${(amount / 100).toLocaleString('en-IN')} with Razorpay`}
    </Button>
    {message && <p role="status" className="text-sm">{message}</p>}
  </div>;
}