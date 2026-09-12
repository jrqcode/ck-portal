/**
 * Demo mode — a first-look account for showing the portal to someone who does
 * not have a real one yet.
 *
 * Off unless NEXT_PUBLIC_DEMO_MODE is exactly 'true'. While it is on, anyone who
 * reaches the site can sign in as either demo account with one click, so it must
 * be turned off before a real homeowner is invited. The seeded accounts and the
 * builds behind them are fictional; see scripts/seed-demo.ts.
 */

export type DemoRole = 'staff' | 'homeowner';

export type DemoAccount = {
  email: string;
  /** Matches the profile the seed script creates, so the bar can name them. */
  name: string;
  label: string;
  /** Lower-case noun for running text: "viewing as Caiden Keller (builder)". */
  short: string;
  blurb: string;
  home: string;
};

export const DEMO_ACCOUNTS: Record<DemoRole, DemoAccount> = {
  staff: {
    email: 'builder@ck-demo.ca',
    name: 'Caiden Keller',
    label: 'Builder view',
    short: 'builder',
    blurb: 'Every build at a glance — post progress, manage people, upload documents.',
    home: '/admin'
  },
  homeowner: {
    email: 'homeowner@ck-demo.ca',
    name: 'Marcus Whitfield',
    label: 'Homeowner view',
    short: 'homeowner',
    blurb: 'One build, the way a client sees it — photos, timeline, and documents.',
    home: '/'
  }
};

export const DEMO_ROLES: DemoRole[] = ['staff', 'homeowner'];

export function isDemoRole(value: unknown): value is DemoRole {
  return value === 'staff' || value === 'homeowner';
}

/** The other view, for the one-click switch in the demo bar. */
export function otherDemoRole(role: DemoRole): DemoRole {
  return role === 'staff' ? 'homeowner' : 'staff';
}

/**
 * Inlined into the client bundle at build time, so the demo affordances can be
 * rendered or withheld without a round trip. The server actions re-check it —
 * never treat this as the only gate.
 */
export const demoEnabled = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
