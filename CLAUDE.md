# Caiden-Keller Homes — Client Portal

A private client portal for **one** custom home builder in Ontario. Not a SaaS
product, not multi-tenant, and there is no marketing site — this repository is
the portal only.

Two roles:

- **Staff** (builder) post progress, manage builds, upload documents.
- **Homeowners** sign in to follow their own build. Nothing else.

**Simplicity is a hard constraint.** Homeowners are not technical and sign in
maybe twice a month. When a feature could be simpler or could be left out,
leave it out.

## Design — read DESIGN.md first

**[DESIGN.md](./DESIGN.md) is binding for all UI work.** Read it before writing
or changing any component.

Do not invent colours, fonts, radii, or spacing values outside it. If something
truly needs a new token, add it to DESIGN.md first — with a reason — then use
it. In particular:

- One accent: Caiden-Keller Red `#d92227`, used scarcely.
- The gold `#b6a071` is **decorative only, homeowner area only**, and never
  carries or sits behind text (it is 2.54:1).
- Status colours are amber and green, never red — red is the brand accent.
- Inter is the only family. Light only; there is no dark mode or theme switcher.

## Stack

- Next.js 16 (App Router) on Vercel
- Supabase — Postgres, Auth, Storage
- Tailwind 4 + shadcn/ui (Base UI primitives)

Scaffolded from [next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter)
(MIT), with its demo pages stripped and Clerk replaced by Supabase Auth.

## Structure

```
src/app/(auth)      /sign-in            — magic link default, password optional
src/app/(admin)     /admin/*            — staff. Compact, table-friendly.
src/app/(portal)    /  /updates  /timeline  /documents  — homeowners.
                                          Comfortable, photo-forward, NO tables.
src/app/auth/*      route handlers for magic-link callbacks
supabase/migrations schema + RLS policies
```

The two route groups share one design system and differ only in density — see
the "Two Densities" table in DESIGN.md.

## Auth and access control

- **RLS is the security boundary.** Layout-level checks (`requireStaff()`) are
  for redirects and UX only. Next.js layouts do not re-run on every navigation
  and do not protect route handlers or server actions. Never rely on them to
  keep a homeowner out of another homeowner's build.
- A homeowner reaches a project only via `project_members`. Staff (`profiles.role
  = 'staff'`) see everything.
- `src/proxy.ts` is Next 16's renamed middleware and **must not be deleted** —
  it is the only place the Supabase auth token gets refreshed. Without it,
  sessions expire silently and users appear randomly signed out.
- Public sign-up must stay **disabled** in the Supabase dashboard. Homeowners
  arrive by invitation only.
- Use `getUser()` on the server, never `getSession()` — the latter only reads a
  cookie and is not verified.
- `src/lib/supabase/admin.ts` bypasses RLS. Use it only for invites, never as a
  shortcut around a missing policy.

### Demo mode

`NEXT_PUBLIC_DEMO_MODE=true` adds one-click sign-in as two seeded accounts, plus
a bar for switching between the builder and homeowner views — a browser holds one
Supabase session, so without it, seeing both sides means clearing cookies. It
exists to show the portal to someone who has no account.

It is off by default and **must be off once real homeowners are invited**: while
it is on, anyone who reaches the URL can sign in. `signInAsDemo` is gated on the
flag and on the two addresses in `src/lib/demo.ts`, so it can never sign anyone
into a real account.

The sample builds come from `bun run seed:demo` (`scripts/seed-demo.ts`). It uses
the service-role key for one thing — creating the demo auth users — and makes
every other write as the demo staff account, through RLS. `--skip-accounts`
leaves the accounts alone and therefore needs no service-role key at all.

Photos come from `scripts/demo/stock/` (24 CC0 images, provenance in
`photo-sources.json`), matched to build stage by filename; `demo-photos/` wins
if you put anything there, and any stage with no photo falls back to a generated
illustration.

## Storage

Two private buckets, `project-photos` and `project-documents`, keyed
`<project_id>/<filename>` — the first path segment is what the storage policies
check. Always serve through signed URLs; neither bucket is public.

## Scope

v1 is deliberately narrow: **progress updates, milestones, and documents.**

Designed for but **not built**: selections/decisions, change orders. There is
deliberately no money, no messaging inbox, no budget, and no Gantt chart. Do not
add them without being asked.

## Commands

```bash
bun install
bun dev
bun run typecheck
bun run lint
bun run format
```
