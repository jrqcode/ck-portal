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

## Credits

Scaffolded from [next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter)
by Kiran (MIT), with the demo pages removed and Clerk replaced by Supabase Auth.
