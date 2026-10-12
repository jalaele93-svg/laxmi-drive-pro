# Razorpay test-mode prototype — not ready for live use

This branch adds an **isolated** `/payment-test` page, two Supabase Edge Functions and a restricted test ledger. It intentionally does **not** modify the public booking flow, existing QR section, admin dashboard, customer fees, or live website. The remaining balance / installments feature is **not implemented** yet.

## Required deployment steps (do not put secrets in GitHub)

1. In your existing Supabase project, apply `supabase/migrations/202610120001_razorpay_test_payments.sql`.
2. Add these **Edge Function secrets** in Supabase (not Vite variables): `RAZORPAY_TEST_KEY_ID` (starts with `rzp_test_`), `RAZORPAY_TEST_KEY_SECRET`, `RAZORPAY_TEST_CAR_PAISE`, `RAZORPAY_TEST_BIKE_PAISE`, `RAZORPAY_TEST_SCOOTER_PAISE`, `RAZORPAY_TEST_AUTO_PAISE`. Set all amounts to **your approved booking advance in paise** (₹1 = 100 paise); none are assumed in the code. Supabase also needs its standard `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` secrets.
3. Deploy both Edge Functions `razorpay-test-order` and `razorpay-test-verify` to the Supabase project. Confirm the client can invoke them. Depending on the project's key type and function auth configuration, JWT verification may require adjustment. Keep the test endpoint inaccessible to public traffic until appropriate rate limiting/authentication is added.
4. Deploy **this branch to a separate preview**; do not merge into main or publish the live domain. Open `/payment-test` on the preview.
5. Use Razorpay's **official test payment methods**. Verify the test ledger shows `captured` only after server-side verification. Test failed/cancelled payments as well.

## Security and limitations

- Key Secret remains server-side. Never put it in `VITE_*`, GitHub, chat, or frontend code.
- Prices are server-controlled; no user-entered payment amount.
- Server checks the checkout signature, Razorpay API captured status, currency, order and amount before recording a successful test.
- Public Edge Functions need authorization, rate limiting, CORS allowlist and replay/abuse protections before production. The prototype currently uses permissive CORS to simplify initial preview; **do not enable it publicly without hardening**.
- The checkout callback is not reliable enough for production settlement on its own. Add Razorpay webhook signature verification, idempotent processing, refunds/reconciliation, and transactional booking balance updates.
- Admin-controlled total course fee, installment schedules, due dates, payment links, paid balance and secure admin authorization must be designed and implemented separately.
- Payment test page is deliberately separate from booking; it is not a complete business integration.

## Fix for publishable-key CORS preflight rejection (October 2026)

Supabase's legacy **Verify JWT** gateway may reject the modern `sb_publishable_...` credential before the function handles OPTIONS. This branch now includes **manual server-side user authentication** using `supabase.auth.getUser(token)` plus an exact allowed-email check on BOTH functions. It is **not sufficient** to disable gateway JWT verification on the original unprotected functions.

**Before changing JWT settings:**
1. Redeploy both updated Edge Functions from this branch (including the shared `supabase/functions/_shared/test-auth.ts` import; Supabase editor may require pasting the helper inline if it cannot resolve shared files).
2. Add secret `RAZORPAY_TEST_ALLOWED_EMAIL` with your own email used to sign in through Supabase Auth.
3. In Supabase Authentication, configure Email OTP/magic links and allow the exact Vercel preview URL (including `/payment-test`) in URL Configuration. Test Auth sign-in and confirm your email account can log in.
4. Only after the updated server-side identity checks are deployed, set **Verify JWT OFF** on the two test functions to allow the OPTIONS preflight through. The functions then validate the user's Supabase access token themselves and restrict access to the allowlisted email.
5. Redeploy the preview branch so the sign-in UI is available.

**Warning:** An allowed email is a minimal test gate, not production security. Before exposing to wider traffic add abuse/rate limits, origin allowlist, monitoring and stronger authentication. The function code must be deployed first. Do not run a payment until these checks have been verified. Never use real Razorpay credentials with this prototype.
