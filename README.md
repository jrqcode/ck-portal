# Caiden-Keller Homes — Client Portal

A private client portal for Caiden-Keller Homes, a custom home builder in
Ontario. Builder staff post progress; homeowners sign in to follow their own
build.

Single tenant, one company. There is no marketing site here — this repository is
the portal only.

## Getting started

```bash
cp env.example.txt .env.local   # then fill in your Supabase keys
bun install
bun dev
```

### Supabase setup

1. Create a project, then apply the schema:

   ```bash
   supabase link --project-ref <ref>
   supabase db push
   ```

   This creates the seven tables, all RLS policies, and the two private storage
   buckets.

2. **Disable public sign-up** — Authentication → Sign In / Providers. The portal
   is invitation-only and this is the only thing stopping open registration.

3. Add `<your-domain>/auth/callback` to the allowed redirect URLs.

4. Make your first staff account: invite yourself from the Supabase dashboard,
   then flip the row in `profiles` to `role = 'staff'`. Every subsequent person
   can be invited from within the portal.

## Showing the portal (demo mode)

For walking someone through the portal before there are real clients on it.

1. Set both in `.env.local` (and in Vercel, if you are showing a deployment):

   ```bash
   NEXT_PUBLIC_DEMO_MODE=true
   DEMO_PASSWORD=<pick something you can say out loud>
   ```

2. Seed the sample builds:

   ```bash
   bun run seed:demo
   ```

   That creates two sign-in accounts — `builder@ck-demo.ca` and
   `homeowner@ck-demo.ca` — plus four fictional builds with a year of progress
   updates, photos, milestones, and downloadable documents. Everything is dated
   relative to the day you run it, so re-running refreshes the timeline. It is
   safe to run again: it clears the previous demo data first and touches nothing
   else.

3. Open `/sign-in`. There are now two buttons, **Builder view** and **Homeowner
   view** — no password to type. A bar across the top of either area switches
   between them in one click, which matters because a browser holds one session
   at a time.

**Turn demo mode off before inviting a real homeowner.** While it is on, anyone
who reaches the URL can sign in as either demo account. Setting
`NEXT_PUBLIC_DEMO_MODE=false` removes the buttons and the switcher; the seeded
data can be left alone or deleted from the admin area.

Real photography sells this far better than the generated placeholders — drop
job-site photos into `demo-photos/` and re-run the seed. See
[demo-photos/README.md](./demo-photos/README.md).

## Documentation

- **[DESIGN.md](./DESIGN.md)** — the design system. Binding for all UI work.
- **[CLAUDE.md](./CLAUDE.md)** — architecture, auth model, and scope.

## Commands

| Command | Description |
|---|---|
| `bun dev` | Development server |
| `bun run build` | Production build |
| `bun run typecheck` | TypeScript, no emit |
| `bun run lint` | oxlint |
| `bun run format` | oxfmt |
| `bun run seed:demo` | Seed the demo accounts and sample builds |

## Credits

Scaffolded from [next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter)
by Kiran (MIT), with the demo pages removed and Clerk replaced by Supabase Auth.
