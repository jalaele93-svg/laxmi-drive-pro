import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

const tokenInput = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/) });
export const createLessonPaymentLink = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ bookingId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: staff } = await context.supabase.rpc('is_staff', { _user_id: context.userId });
    if (!staff) throw new Error('Staff access required.');
    const { data: booking } = await context.supabase.from('lesson_bookings').select('id,amount,payment_status,status').eq('id', data.bookingId).single();
    if (!booking?.amount || booking.amount <= 0 || !Number.isSafeInteger(booking.amount * 100) || booking.status === 'Cancelled' || ['Paid', 'Refunded'].includes(booking.payment_status)) throw new Error('Set a confirmed amount on an unpaid booking first.');
    const { keys, newToken, tokenHash } = await import('./razorpay.server');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const token = newToken();
    const { data: old } = await supabaseAdmin.from('payment_requests').select('id,amount_paise,key_id,state').eq('booking_id', booking.id).maybeSingle();
    if (old && (old.amount_paise !== booking.amount * 100 || old.key_id !== keys().id || ['captured','refunded'].includes(old.state))) throw new Error('A different payment request already exists. Contact support.');
    const query = old
      ? supabaseAdmin.from('payment_requests').update({ token_hash: tokenHash(token) }).eq('id', old.id)
      : supabaseAdmin.from('payment_requests').insert({ booking_id: booking.id, amount_paise: booking.amount * 100, key_id: keys().id, token_hash: tokenHash(token) });
    const { error } = await query;
    if (error) throw new Error('Could not create payment link. Retry.');
    const { error: markError } = await supabaseAdmin.from('lesson_bookings').update({ gateway_only: true }).eq('id', booking.id);
    if (markError) throw new Error('Could not prepare booking payment.');
    return { token };
  });

export const getLessonPayment = createServerFn({ method: 'POST' })
  .inputValidator((input) => tokenInput.parse(input))
  .handler(async ({ data }) => {
    const { tokenHash } = await import('./razorpay.server');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: row } = await supabaseAdmin.from('payment_requests').select('id,amount_paise,state,booking_id').eq('token_hash', tokenHash(data.token)).single();
    if (!row?.booking_id) throw new Error('This payment link is invalid or has been replaced.');
    return { amount: row.amount_paise, state: row.state };
  });
export const startLessonPayment = createServerFn({ method: 'POST' })
  .inputValidator((input) => tokenInput.parse(input))
  .handler(async ({ data }) => {
    const { tokenHash, checkout } = await import('./razorpay.server');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: row } = await supabaseAdmin.from('payment_requests').select('id,booking_id').eq('token_hash', tokenHash(data.token)).single();
    if (!row?.booking_id) throw new Error('Invalid payment link.');
    const { data: booking } = await supabaseAdmin.from('lesson_bookings').select('status').eq('id', row.booking_id).single();
    if (!booking || booking.status === 'Cancelled') throw new Error('This booking cannot be paid. Contact our team.');
    return checkout(row.id);
  });
export const startPartnerPayment = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ applicationId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: app } = await context.supabase.from('partner_applications').select('id,status,payment_status,deposit_amount,terms_accepted,submitted_at').eq('id', data.applicationId).eq('user_id', context.userId).single();
    if (!app || !app.terms_accepted || !app.submitted_at || !['Payment Pending','Submitted','Under Review'].includes(app.status) || app.payment_status !== 'Pending' || app.deposit_amount !== 2000) throw new Error('Submit your application first, or contact our team about the existing payment.');
    const { checkout, keys } = await import('./razorpay.server');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: existing } = await supabaseAdmin.from('payment_requests').select('id').eq('application_id', app.id).maybeSingle();
    let requestId = existing?.id;
    if (!requestId) {
      const { data: created, error } = await supabaseAdmin.from('payment_requests').insert({ application_id: app.id, amount_paise: 200000, key_id: keys().id }).select('id').single();
      if (error || !created) throw new Error('Could not prepare payment. Please retry.');
      requestId = created.id;
    }
    const { error } = await supabaseAdmin.from('partner_applications').update({ gateway_only: true }).eq('id', app.id);
    if (error) throw new Error('Could not prepare application payment.');
    return checkout(requestId);
  });
export const verifyRazorpayPayment = createServerFn({ method: 'POST' })
  .inputValidator((input) => z.object({ orderId: z.string().regex(/^order_[A-Za-z0-9]+$/), paymentId: z.string().regex(/^pay_[A-Za-z0-9]+$/), signature: z.string().regex(/^[a-f0-9]{64}$/i) }).parse(input))
  .handler(async ({ data }) => {
    const { keys, validSignature, reconcile } = await import('./razorpay.server');
    if (!validSignature(`${data.orderId}|${data.paymentId}`, data.signature, keys().secret)) throw new Error('Payment signature could not be verified.');
    return reconcile(data.orderId, data.paymentId);
  });