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
