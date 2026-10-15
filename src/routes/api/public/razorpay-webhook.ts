import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

export const Route = createFileRoute('/api/public/razorpay-webhook')({ server: { handlers: {
  POST: async ({ request }) => {
    const secret = process.env['RAZORPAY_WEBHOOK_SECRET'];
    if (!secret) return new Response('Webhook not configured', { status: 503 });
    if (Number(request.headers.get('content-length') ?? 0) > 65536) return new Response('Too large', { status: 413 });
    const body = await request.text();
    if (body.length > 65536) return new Response('Too large', { status: 413 });
    const { validSignature, reconcile } = await import('@/lib/razorpay.server');
    if (!validSignature(body, request.headers.get('x-razorpay-signature') ?? '', secret)) return new Response('Invalid signature', { status: 401 });
    try {
      const event = z.object({ event: z.string(), payload: z.object({ payment: z.object({ entity: z.object({ id: z.string().regex(/^pay_[A-Za-z0-9]+$/), order_id: z.string().regex(/^order_[A-Za-z0-9]+$/) }) }).optional() }) }).parse(JSON.parse(body));
      if (['payment.captured', 'order.paid', 'refund.processed'].includes(event.event) && event.payload.payment) {
        await reconcile(event.payload.payment.entity.order_id, event.payload.payment.entity.id);
      }
      return new Response('ok');
    } catch { return new Response('Could not process event', { status: 500 }); }
  },
} } });