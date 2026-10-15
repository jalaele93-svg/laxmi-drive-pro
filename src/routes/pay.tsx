import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { getLessonPayment } from '@/lib/razorpay.functions';
import { RazorpayPayment } from '@/components/site/RazorpayPayment';

export const Route = createFileRoute('/pay')({
  head: () => ({ meta: [{ title: 'Secure Lesson Payment | Laxmi Driving Training' }, { name: 'description', content: 'Pay your confirmed Laxmi Driving Training lesson amount securely through Razorpay.' }, { property: 'og:title', content: 'Secure Lesson Payment | Laxmi Driving Training' }, { property: 'og:description', content: 'Secure checkout for your confirmed driving lesson fees.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex, nofollow' }, { name: 'referrer', content: 'no-referrer' }] }),
  component: PaymentPage,
});
function PaymentPage() {
  const read = useServerFn(getLessonPayment);
  const [token, setToken] = useState('');
  const [data, setData] = useState<{ amount: number; state: string } | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const value = new URLSearchParams(window.location.hash.slice(1)).get('token') ?? '';
    setToken(value);
    if (!value) { setError('Ask our team for your private payment link after your fee is confirmed.'); return; }
    read({ data: { token: value } }).then(setData).catch(() => setError('This payment link is invalid or has been replaced. Please contact our team.'));
  }, []);
  return <section className="section-y"><div className="container-page max-w-xl space-y-5"><h1 className="font-display text-3xl font-bold">Lesson Payment</h1>{error ? <p role="alert">{error}</p> : !data ? <p role="status">Checking your payment link…</p> : data.state === 'captured' ? <p role="status">Your payment has been verified. Our team will confirm your lesson.</p> : data.state === 'refunded' ? <p>Payment refunded.</p> : <><p className="text-lg font-semibold">Confirmed amount: ₹{(data.amount / 100).toLocaleString('en-IN')}</p><RazorpayPayment token={token} amount={data.amount} /></>}</div></section>;
}