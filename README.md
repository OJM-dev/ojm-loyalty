# OJM Loyalty Desk

A static English/Arabic loyalty messaging app backed by Supabase Auth and a private Postgres workspace record. Prepared for https://github.com/OJM-dev/ojm-loyalty.

## Upload and publish

1. Upload the contents of this folder (including `vendor`) to the root of the GitHub repository. `index.html` must be at the root. Do not upload the ZIP itself.
2. Open Settings → Pages. Select “Deploy from a branch”, branch `main`, folder `/ (root)`, and Save.
3. Wait for GitHub to report the published URL. Open the site using HTTPS.
4. Sign in using the email/password created in Supabase Authentication → Users.
5. Use “Restore backup” to import the JSON backup downloaded from the previous website. Wait for “Saved to Supabase”. Refresh and confirm the customers, phone numbers, and Sent flags remain.

The supplied `config.js` already contains your Project URL and public publishable key. It contains no database password, secret key, or user login.

## Database requirement

The previously supplied SQL must have created `public.loyalty_workspaces` with:

- `user_id` UUID primary key referencing `auth.users(id)`
- `data` JSONB object
- `revision` BIGINT default 0, incremented on updates by the metadata trigger
- `created_at` and `updated_at` timestamps
- RLS enabled, an authenticated owner-only policy, and no anonymous table access

Keep public sign-ups and anonymous sign-ins disabled. The app has no registration page. Each login has its own workspace; creating another login does not share the first user's data.

## Existing workflow

- Select the report month, then upload the points report (دائن) and the separate balance report (الرصيد).
- Match accounts by رمز. Missing balances and mismatched currencies block points messages.
- Customer selection and phone numbers persist in the cloud.
- Message amounts are positive, rounded to the nearest 1,000 LBP and comma-separated.
- Opening the WhatsApp desktop app flags the customer as Sent for the selected month. This records opening, not delivery. Undo and filters are available.
- Inactive customers need individual opt-in for Arabic follow-up messages. Follow-up status is stored separately.
- Backups include customer data: keep them private and do not upload them to GitHub.

## Cloud saving and recovery

Writes are serialised and check the server revision to prevent stale tabs from overwriting newer data. A conflict requires downloading the local backup, then loading the latest cloud data; the app does not merge conflicting workspaces automatically.

Unsaved changes are retained in memory and a per-user draft on this browser. The header shows save errors and Retry save. A recovered draft with an older revision cannot overwrite the cloud automatically. Wait for “Saved to Supabase” before closing or signing out. Network timeouts can leave a write outcome uncertain; retry or resolve a conflict without forcing an overwrite.

“Reset all data” now clears the signed-in Supabase workspace, not just a browser copy. It requires the phrase `reset all data` and a confirmation. This phrase protects against accidental clicks; it is not an authorization mechanism. Supabase Auth and RLS enforce access.

The website stores only the current imported report pair, plus customer details and month-keyed message flags, as the previous website did. It is not an archive of all historical Excel reports. Keep original exports separately.

## Checks

Run `node --test tests/sync-store.test.cjs` for the sync tests. Run `node --check app.js`, `node --check cloud.js`, `node --check i18n.js`, and `node --check sync-store.js` for syntax checks.

The bilingual login screen and sync tests were checked during preparation. The project's public Auth settings were reachable, with email enabled and sign-ups disabled. End-to-end sign-in, owner-only database read/write, backup restore and refresh still need testing with your account after deployment. No private credentials or real customer data were used for automated tests.

## Dependencies

`vendor/xlsx.full.min.js`: SheetJS Community Edition 0.20.3 (Apache-2.0), https://sheetjs.com/.
`vendor/supabase.js`: Supabase JavaScript SDK (MIT), downloaded from the official npm package's UMD distribution. See https://github.com/supabase/supabase-js.
