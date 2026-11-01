# ENGINEX cloud accounts for GitHub Pages

The website stays at https://iemfaraz.github.io/enginex-engineering-suite/.
Accounts require a Supabase project. Until configured, the existing browser workspace remains available; account screens clearly show setup is required.

1. Create your own Supabase account and project at https://supabase.com/dashboard. Choose the plan you want; review its limits and pricing before proceeding.
2. Run `supabase/migrations/001_accounts.sql` in the project's SQL Editor once.
3. Under Authentication > URL Configuration, set Site URL to `https://iemfaraz.github.io/enginex-engineering-suite/dashboard.html` and add both that exact URL and `https://iemfaraz.github.io/enginex-engineering-suite/account-login.html` as permitted redirect URLs.
4. Keep email confirmation enabled. Set the minimum password length to 12 in Supabase Auth. Configure your own SMTP before public launch; test delivery and provider rate limits.
5. Set `url` and `publishableKey` in `assets/enginex-cloud-config.js`. These are public client settings. NEVER publish a secret, service-role key, database password, or personal access token.
6. Register your own account using `account-login.html`, then verify your email.
7. Bootstrap the first admin only through the private SQL Editor: replace the email below with your verified email. Do not allow arbitrary users to call a bootstrap endpoint.

```sql
update public.enginex_profiles
set role='admin', status='active'
where email='YOUR_VERIFIED_EMAIL' and id in (
 select id from auth.users where email_confirmed_at is not null
);
```

8. Sign in and open `dashboard.html`. Approve each new user from Users & access. New registrations are pending by default. Users cannot assign themselves roles or activate themselves.

## Existing projects
Export your current browser workspace before activating cloud settings. Cloud workspaces are isolated by authenticated user and initially start empty. Import your existing JSON export through the workspace's existing Import option. Do not automatically copy a shared browser's old data into a new user's account.

## Access and backup behavior
The database enforces authorization on each cloud request, including accounts with an existing JWT that are suspended afterward. UI refresh checks active status every minute. Previously downloaded/local cached files cannot be recalled when access is suspended. Admins can manage profiles but cannot read another user's project data. User management changes are audited. No user deletion UI is included; permanent deletion requires the trusted Supabase dashboard.

Cloud backup covers the main workspace's storage. Embedded standalone calculator/sizing tools retain their existing browser storage and are not included in this cloud backup. Export important work separately. Concurrent editing across multiple devices uses the last successful save; avoid editing the same account simultaneously. There is no organization-wide shared project workspace in this version.

## Required activation checks
Use two confirmed users plus an administrator to test: pending access denial; approval; cross-user workspace isolation; normal user inability to read other profiles or call the admin RPC; suspension blocks new cloud reads and writes; signout; email recovery; cloud backup roundtrip; quotation print layout. Run SQL authorization tests in an isolated staging project before production activation. Live authentication/database tests have not been run until a project is provisioned.
