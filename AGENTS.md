<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

- Public lesson enquiries are saved in `lesson_bookings` with write-only anonymous access and staff-only reads; this keeps learner contact details private.
- Staff pages use verified `user_roles` via the managed auth gate and database policies, never browser-stored roles; this prevents a visitor from seeing operational data.
- Payment status is recorded separately from payment preference; a selected UPI/card method never proves money was received.
- Customer lesson collection uses a manual UPI panel on the booking page, separate from partner enrollment payments; QR scans and payment-app links never update payment status because receipt requires independent staff verification.
- Partner approval is enforced in the database and requires verified payment, required documents, and a staff-recorded vehicle inspection.
- Public courses, instructor profiles, reviews, FAQs and safety rules use validated website_content overrides through public server reads and shared query loaders; staff-only writes update website content without exposing operational roster data.
- Admin record editors are shared dialog tools and CSV downloads escape formula-like cells; this keeps editing consistent and exports safe to open in spreadsheets.
- Initial owner access is activated only by an auth lifecycle trigger matching the designated verified email, with no client-callable role-claim function; this prevents self-assigned staff privileges.
- Email confirmation returns to the public auth page and checks the verified user and staff role before entering admin; this prevents premature access and protected-callback redirects.
- Partner drafts reuse a client-generated application UUID and persist only that reference locally; signed upload confirmation checks ownership and file signatures before a service-only atomic document replacement, so retries do not create a second application or reuse obsolete verified documents.
- Current partner documents are versioned with one current row per document type; approval and staff/partner lists use current rows to prevent stale verification from approving replacement files.
