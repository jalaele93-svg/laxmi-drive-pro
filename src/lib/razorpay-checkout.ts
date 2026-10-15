type Result = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type Checkout = { open(): void; on(event: string, callback: () => void): void };
declare global { interface Window { Razorpay?: new (options: Record<string, unknown>) => Checkout } }
let loading: Promise<void> | undefined;
export function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    const timer = window.setTimeout(() => { loading = undefined; script.remove(); reject(new Error('Payment service took too long to load. Retry.')); }, 15000);
    script.onload = () => { clearTimeout(timer); resolve(); };
    script.onerror = () => { clearTimeout(timer); loading = undefined; script.remove(); reject(new Error('Could not load Razorpay. Check your connection and retry.')); };
    document.head.appendChild(script);
  });
  return loading;
}
export async function openRazorpay(order: { key: string; orderId: string; amount: number; currency: string }) {
  await loadRazorpay();
  const Razorpay = window.Razorpay;
  if (!Razorpay) throw new Error('Razorpay is unavailable. Please retry.');
  return new Promise<Result>((resolve, reject) => {
    const checkout = new Razorpay({ key: order.key, order_id: order.orderId, amount: order.amount, currency: order.currency, name: 'Laxmi Driving Training', description: 'Driving training payment', handler: resolve, modal: { ondismiss: () => reject(new Error('Payment cancelled. Nothing has been confirmed; you can retry.')) } });
    checkout.on('payment.failed', () => reject(new Error('Payment unsuccessful. Please retry with the same payment link.')));
    checkout.open();
  });
}