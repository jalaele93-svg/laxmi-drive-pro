import { createHmac, randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export function keys() {
  const id = process.env['RAZORPAY_KEY_ID'];
  const secret = process.env['RAZORPAY_KEY_SECRET'];
  if (!id || !secret) throw new Error('Razorpay is not configured. Please contact our team.');
  return { id, secret };
}
export const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');
export const newToken = () => randomBytes(32).toString('hex');
export function validSignature(body: string, signature: string, secret: string) {
  if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = createHmac('sha256', secret).update(body).digest();
  return timingSafeEqual(expected, Buffer.from(signature, 'hex'));
}
type ProviderOrder = { id: string; amount: number; currency: string; status: string; receipt: string };
type ProviderPayment = { id: string; order_id: string; amount: number; currency: string; status: string; amount_refunded: number };
export async function razorpay<T>(path: string, body?: object): Promise<T> {
  const { id, secret } = keys();
  const response = await fetch(`https://api.razorpay.com/v1/${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error('Razorpay could not complete this request. Please retry or contact our team.');
  return response.json() as Promise<T>;
}
export async function checkout(requestId: string) {
  const { data: row, error } = await supabaseAdmin.from('payment_requests').select('*').eq('id', requestId).single();
  if (error || !row) throw new Error('Payment request not found.');
  const { id } = keys();
  if (row.key_id !== id) throw new Error('This payment request uses previous credentials. Please ask our team for help.');
  if (row.state === 'captured' || row.state === 'refunded') throw new Error('This payment has already been recorded.');
  let orderId = row.order_id;
  if (!orderId) {
    const { data: claimed } = await supabaseAdmin.from('payment_requests').update({ state: 'creating' }).eq('id', row.id).eq('state', 'pending').is('order_id', null).select('id').maybeSingle();
    if (!claimed) throw new Error('Payment is being prepared. Wait a moment and retry.');
    try {
      const order = await razorpay<ProviderOrder>('orders', { amount: row.amount_paise, currency: 'INR', receipt: row.id });
      if (order.amount !== row.amount_paise || order.currency !== 'INR') throw new Error('Payment amount mismatch.');
      const { error: saveError } = await supabaseAdmin.from('payment_requests').update({ order_id: order.id, state: 'pending' }).eq('id', row.id);
      if (saveError) throw new Error('Could not save payment order. Please contact our team before paying.');
      orderId = order.id;
    } catch (error) {
      await supabaseAdmin.from('payment_requests').update({ state: 'pending' }).eq('id', row.id).is('order_id', null);
      throw error;
    }
  }
  return { key: id, orderId, amount: row.amount_paise, currency: 'INR', requestId: row.id, test: id.startsWith('rzp_test_') };
}
export async function reconcile(orderId: string, paymentId: string) {
  const { data: request } = await supabaseAdmin.from('payment_requests').select('*').eq('order_id', orderId).single();
  if (!request || request.key_id !== keys().id) throw new Error('Unknown payment order.');
  const [payment, order] = await Promise.all([
    razorpay<ProviderPayment>(`payments/${encodeURIComponent(paymentId)}`),
    razorpay<ProviderOrder>(`orders/${encodeURIComponent(orderId)}`),
  ]);
  if (payment.order_id !== orderId || payment.amount !== request.amount_paise || payment.currency !== 'INR' || order.amount !== request.amount_paise || order.currency !== 'INR') throw new Error('Payment details did not match the saved amount.');
  if (!['captured', 'refunded'].includes(payment.status)) return { paid: false, message: 'Payment is awaiting capture. Please check again shortly.' };
  const refunded = payment.status === 'refunded' && payment.amount_refunded === payment.amount;
  const { error } = await supabaseAdmin.rpc('settle_razorpay_payment', { _order: orderId, _payment: paymentId, _amount: request.amount_paise, _refunded: refunded });
  if (error) throw new Error('Payment received but recording is pending. Do not pay again; contact our team.');
  return { paid: !refunded, message: refunded ? 'Payment refunded.' : 'Payment verified by Razorpay.' };
}