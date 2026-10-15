# Production upgrade
- [ ] Replace all new manual collections with Razorpay-only Test checkout and secure verification; preserve historical records.
- [ ] Repair UPI placement and resumable partner uploads; verify signed-in retries and failures.
- [ ] Integrate Razorpay orders, verification and webhooks for staff-set learner amounts and ₹2,000 partner advances (blocked: secure credential form declined; no Razorpay credentials saved).
- [x] Add customer UPI QR collection for lesson fees and agreed booking advances, with manual receipt verification.
- [x] Implement verified-owner admin registration, confirmation resend and secure role activation.
- [x] Upgrade admin controls: booking editing, instructor roster, filters, exports and safe sign-out.
- [x] Verify website course and instructor editing with the authorized owner; saved changes read back on public pages.
- [x] Save real lesson requests and manage them securely in admin.
- [x] Replace demo admin data and actions across bookings, payments, instructors, allocation, customers, reports and settings.
- [x] Finish partner dashboard, staff verification workflow, payment evidence and document access.
- [ ] Verify booking and partner flows end to end.
- [ ] Enable payment gateway for UPI and cards (blocked: provider account/approval and credentials).
- [ ] Enable manual partner UPI collection (blocked: real UPI ID not supplied).
- [ ] Verify initial admin activation end to end (blocked: owner must register with their own password and confirm the email).
- [ ] Add automated booking and partner confirmation e-mails (blocked: verified sending domain not configured).

- [x] Add website course and instructor editors plus reviews, FAQ and safety rules; connect saved changes to public pages.
