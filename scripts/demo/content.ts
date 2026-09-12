/**
 * The fictional builds behind demo mode.
 *
 * Everything is relative to the day the seed runs (`daysAgo` / `daysAhead`) so
 * re-running refreshes the timeline: the newest update always reads "3 days
 * ago", never "some time last spring". Names, addresses, and the 555-01xx phone
 * numbers are invented — no real client appears here.
 */

import type { DocumentCategory, ProjectStatus } from '../../src/types/database';

export type PersonKey =
  | 'caiden'
  | 'dana'
  | 'marcus'
  | 'elaine'
  | 'sara'
  | 'jeanpaul'
  | 'ana';

export type DemoPerson = {
  key: PersonKey;
  email: string;
  fullName: string;
  phone: string | null;
  role: 'staff' | 'homeowner';
};

/**
 * Two of these are the accounts the demo buttons sign into — their addresses are
 * mirrored in src/lib/demo.ts and the seed asserts they still match. The rest
 * exist so the People page and the project rosters are not one name long.
 */
export const PEOPLE: DemoPerson[] = [
  {
    key: 'caiden',
    email: 'builder@ck-demo.ca',
    fullName: 'Caiden Keller',
    phone: '(905) 555-0118',
    role: 'staff'
  },
  {
    key: 'dana',
    email: 'dana@ck-demo.ca',
    fullName: 'Dana Mulvaney',
    phone: '(905) 555-0176',
    role: 'staff'
  },
  {
    key: 'marcus',
    email: 'homeowner@ck-demo.ca',
    fullName: 'Marcus Whitfield',
    phone: '(416) 555-0142',
    role: 'homeowner'
  },
  {
    key: 'elaine',
    email: 'elaine@ck-demo.ca',
    fullName: 'Elaine Whitfield',
    phone: '(416) 555-0143',
    role: 'homeowner'
  },
  {
    key: 'sara',
    email: 'nakamura@ck-demo.ca',
    fullName: 'Sara Nakamura',
    phone: '(519) 555-0107',
    role: 'homeowner'
  },
  {
    key: 'jeanpaul',
    email: 'boucher@ck-demo.ca',
    fullName: 'Jean-Paul Boucher',
    phone: '(519) 555-0188',
    role: 'homeowner'
  },
  {
    key: 'ana',
    email: 'delgado@ck-demo.ca',
    fullName: 'Ana Delgado',
    phone: '(905) 555-0164',
    role: 'homeowner'
  }
];

export type DemoUpdate = {
  /** How long ago it was posted. Drafts are dated but never published. */
  daysAgo: number;
  /** Index into BUILD_STAGES — what this update is about. */
  stage: number;
  title: string;
  body: string;
  author: PersonKey;
  photos: number;
  /** Staff-only: shows what an unpublished update looks like in the admin. */
  draft?: boolean;
};

export type DemoDocument = {
  title: string;
  category: DocumentCategory;
  daysAgo: number;
  /** A staged document, to show that the switch does something. */
  hidden?: boolean;
  /** Body copy for the generated sample PDF. */
  summary: string;
};

export type DemoProject = {
  name: string;
  address: string;
  community: string;
  lot: string;
  status: ProjectStatus;
  startedDaysAgo: number;
  /** Negative means the date has already passed — a finished build. */
  occupancyDaysAhead: number;
  /**
   * Start date of every stage that has begun, in BUILD_STAGES order. Each stage
   * is treated as complete the day before the next one starts, so the last entry
   * is whatever is underway right now — unless `finishedDaysAgo` says the build
   * is done.
   */
  stageStartsDaysAgo: number[];
  finishedDaysAgo?: number;
  homeowners: PersonKey[];
  updates: DemoUpdate[];
  documents: DemoDocument[];
};

/**
 * The Whitfield build is the one the demo homeowner account is attached to, so
 * it carries the most history — a full year of updates, a photo on every one,
 * and a draft waiting in the admin.
 */
export const PROJECTS: DemoProject[] = [
  {
    name: 'Whitfield Residence',
    address: '38 Cedarpost Lane',
    community: 'Rockwood Estates',
    lot: 'Lot 14',
    status: 'in_progress',
    startedDaysAgo: 328,
    occupancyDaysAhead: 97,
    stageStartsDaysAgo: [327, 281, 250, 215, 173, 139, 96, 47],
    homeowners: ['marcus', 'elaine'],
    updates: [
      {
        daysAgo: 282,
        stage: 0,
        title: 'Permits are in hand',
        body: 'The building permit came through this morning and the drawings are stamped. Engineering signed off on the revised great-room span last week, so nothing is outstanding on paper.\n\nSite prep starts Monday, weather permitting. You will see the lot change quickly from here.',
        author: 'caiden',
        photos: 1
      },
      {
        daysAgo: 268,
        stage: 1,
        title: 'Excavation and footings',
        body: 'The hole is dug and the footings are formed and poured. We hit clean fill the whole way down, which is the best news you can get at this stage — no surprises and no change to the schedule.\n\nThe inspector was out Thursday and passed the footings without comment.',
        author: 'dana',
        photos: 2
      },
      {
        daysAgo: 238,
        stage: 2,
        title: 'Foundation walls are up',
        body: 'Walls are poured, stripped, and damp-proofed. Weeping tile and the drainage layer went in yesterday and we backfilled this afternoon.\n\nWe are letting it sit over the holidays and framing starts in the new year.',
        author: 'caiden',
        photos: 2
      },
      {
        daysAgo: 205,
        stage: 3,
        title: 'First floor deck is down',
        body: 'Joists, subfloor, and the beam pockets are all in. You can walk the main floor now and get a real sense of the room sizes — the kitchen is bigger in person than it reads on the plan, which is what everyone says at this point.',
        author: 'dana',
        photos: 2
      },
      {
        daysAgo: 180,
        stage: 3,
        title: 'Framing is topped out',
        body: 'Second floor walls and the roof trusses went up this week. The shape of the house is finally there.\n\nNext up is sheathing and getting a roof over it before the spring rain.',
        author: 'caiden',
        photos: 3
      },
      {
        daysAgo: 160,
        stage: 4,
        title: 'Shingled and closed in',
        body: 'Roof is shingled, windows and exterior doors are set, and the house is watertight. From here the work moves inside, so progress gets a little less dramatic to look at but no slower.',
        author: 'caiden',
        photos: 2
      },
      {
        daysAgo: 130,
        stage: 5,
        title: 'Rough-ins underway',
        body: 'Plumbing and HVAC are roughed in and the electricians started yesterday. This is the point where every decision you made about outlet and fixture locations shows up in the wall.\n\nIf you want to walk the house before insulation goes in, the next two weeks are the window.',
        author: 'dana',
        photos: 2
      },
      {
        daysAgo: 100,
        stage: 5,
        title: 'Rough-in inspections passed',
        body: 'Framing, plumbing, electrical, and HVAC inspections all passed on the first visit. Nothing to correct.',
        author: 'caiden',
        photos: 1
      },
      {
        daysAgo: 84,
        stage: 6,
        title: 'Insulation is in',
        body: 'Spray foam at the rim joists and batts everywhere else, all inspected and signed off. The house is noticeably quieter inside already.\n\nDrywall is booked to start next week.',
        author: 'dana',
        photos: 2
      },
      {
        daysAgo: 52,
        stage: 6,
        title: 'Drywall is sanded and primed',
        body: 'Board is hung, taped, sanded, and the primer coat is on. The rooms read properly now — it stops feeling like a construction site somewhere around this week.',
        author: 'caiden',
        photos: 2
      },
      {
        daysAgo: 24,
        stage: 7,
        title: 'Cabinets and millwork',
        body: 'Kitchen boxes are set and the island is in place. Trim carpenters are working through the second floor.\n\nThe quartz template is booked for next Tuesday, and counters follow about two weeks after that.',
        author: 'caiden',
        photos: 3
      },
      {
        daysAgo: 3,
        stage: 7,
        title: 'Flooring and tile underway',
        body: 'Engineered oak is down on the main floor and the ensuite tile is set and grouting today. Your selections look exactly like the sample board — the oak is a touch warmer in daylight, which we think is an improvement.\n\nPaint starts next week, then light fixtures and hardware.',
        author: 'dana',
        photos: 3
      },
      {
        daysAgo: 1,
        stage: 7,
        title: 'Trim and paint touch-ups',
        body: 'Draft — holding this until the painters finish the second coat so the photos are worth looking at.',
        author: 'caiden',
        photos: 1,
        draft: true
      }
    ],
    documents: [
      {
        title: 'Construction Agreement — signed',
        category: 'contract',
        daysAgo: 330,
        summary:
          'The executed construction agreement for 38 Cedarpost Lane, including the schedule of finishes and the agreed allowance amounts.'
      },
      {
        title: 'Municipal Building Permit',
        category: 'permit',
        daysAgo: 282,
        summary:
          'The issued building permit for the dwelling, posted on site for the duration of construction.'
      },
      {
        title: 'Architectural Drawings — Rev C',
        category: 'plan',
        daysAgo: 300,
        summary:
          'Stamped architectural set, revision C. Supersedes revisions A and B — the change is the revised great-room span and the relocated basement stair.'
      },
      {
        title: 'Interior Selections — final',
        category: 'selection',
        daysAgo: 120,
        summary:
          'Confirmed interior selections: flooring, tile, cabinetry, counters, plumbing fixtures, and paint colours, room by room.'
      },
      {
        title: 'Tarion Warranty Certificate',
        category: 'warranty',
        daysAgo: 320,
        summary:
          'Your Tarion warranty enrolment for this home, with the certificate number and the coverage that applies from the date of possession.'
      },
      {
        title: 'Pre-Delivery Inspection Guide',
        category: 'pdi',
        daysAgo: 30,
        summary:
          'What to expect at the pre-delivery inspection, what we walk through together, and how anything noted on the day gets tracked to completion.'
      },
      {
        title: 'Site survey — internal copy',
        category: 'other',
        daysAgo: 325,
        hidden: true,
        summary:
          'Surveyor plan of the lot with grades and setbacks. Kept internal — the homeowner copy is issued with the closing package.'
      }
    ]
  },
  {
    name: 'Nakamura Residence',
    address: '7 Harrowgate Court',
    community: 'Rockwood Estates',
    lot: 'Lot 22',
    status: 'pre_construction',
    startedDaysAgo: 40,
    occupancyDaysAhead: 520,
    stageStartsDaysAgo: [34],
    homeowners: ['sara'],
    updates: [
      {
        daysAgo: 30,
        stage: 0,
        title: 'Drawings are with the engineer',
        body: 'The architectural set went to structural review this week. Once the engineering comes back we submit for permit, which the township is currently turning around in about six weeks.',
        author: 'caiden',
        photos: 1
      },
      {
        daysAgo: 9,
        stage: 0,
        title: 'Engineering back, permit submitted',
        body: 'Structural came back with one change — a larger beam over the rear opening — which is already in the drawings. The permit application went in Monday.',
        author: 'caiden',
        photos: 1
      }
    ],
    documents: [
      {
        title: 'Construction Agreement — signed',
        category: 'contract',
        daysAgo: 40,
        summary:
          'The executed construction agreement for 7 Harrowgate Court, including the schedule of finishes and the agreed allowance amounts.'
      },
      {
        title: 'Architectural Drawings — Rev A',
        category: 'plan',
        daysAgo: 34,
        summary:
          'First issued architectural set for permit submission. Structural revisions will follow as revision B.'
      }
    ]
  },
  {
    name: 'Boucher Residence',
    address: '211 Millbrook Side Road',
    community: 'Eramosa',
    lot: 'Lot 3',
    status: 'in_progress',
    startedDaysAgo: 200,
    occupancyDaysAhead: 210,
    stageStartsDaysAgo: [196, 150, 118, 62],
    homeowners: ['jeanpaul'],
    updates: [
      {
        daysAgo: 170,
        stage: 0,
        title: 'Permit issued',
        body: 'Permit is issued and the lot is staked. Excavation is booked for the end of the month.',
        author: 'dana',
        photos: 1
      },
      {
        daysAgo: 120,
        stage: 1,
        title: 'Site cleared and services staked',
        body: 'The lot is cleared, the driveway base is in for construction traffic, and hydro and water are located and staked.',
        author: 'dana',
        photos: 2
      },
      {
        daysAgo: 70,
        stage: 2,
        title: 'Foundation poured',
        body: 'Footings and walls are poured and stripped. Waterproofing and weeping tile go on this week, then we backfill.',
        author: 'caiden',
        photos: 2
      },
      {
        daysAgo: 16,
        stage: 3,
        title: 'Framing has started',
        body: 'Main floor walls are up and the second floor deck goes down this week. The lumber package is on site in full, so there is nothing waiting on delivery.',
        author: 'dana',
        photos: 2
      }
    ],
    documents: [
      {
        title: 'Construction Agreement — signed',
        category: 'contract',
        daysAgo: 200,
        summary:
          'The executed construction agreement for 211 Millbrook Side Road, including the schedule of finishes and the agreed allowance amounts.'
      },
      {
        title: 'Municipal Building Permit',
        category: 'permit',
        daysAgo: 170,
        summary:
          'The issued building permit for the dwelling, posted on site for the duration of construction.'
      },
      {
        title: 'Architectural Drawings — Rev B',
        category: 'plan',
        daysAgo: 180,
        summary:
          'Stamped architectural set, revision B, incorporating the structural review comments.'
      }
    ]
  },
  {
    name: 'Delgado Residence',
    address: '14 Windrow Crescent',
    community: 'Rockwood Estates',
    lot: 'Lot 8',
    status: 'complete',
    startedDaysAgo: 640,
    occupancyDaysAhead: -150,
    stageStartsDaysAgo: [639, 594, 560, 520, 478, 436, 392, 340, 250, 190, 160],
    finishedDaysAgo: 150,
    homeowners: ['ana'],
    updates: [
      {
        daysAgo: 345,
        stage: 6,
        title: 'Drywall complete',
        body: 'Board is up and finished throughout. Interior finishes start after the holidays.',
        author: 'caiden',
        photos: 2
      },
      {
        daysAgo: 230,
        stage: 8,
        title: 'Driveway and sod are in',
        body: 'Final grade is approved, the driveway is paved, and the sod went down this week. The exterior is essentially finished.',
        author: 'dana',
        photos: 2
      },
      {
        daysAgo: 148,
        stage: 10,
        title: 'Keys handed over',
        body: 'Occupancy is signed off and the keys are yours. Your warranty documents are in the Documents tab, and anything from the pre-delivery inspection is tracked through to completion.\n\nIt has been a genuine pleasure building this one. Welcome home.',
        author: 'caiden',
        photos: 3
      }
    ],
    documents: [
      {
        title: 'Construction Agreement — signed',
        category: 'contract',
        daysAgo: 640,
        summary:
          'The executed construction agreement for 14 Windrow Crescent, including the schedule of finishes and the agreed allowance amounts.'
      },
      {
        title: 'Pre-Delivery Inspection Report',
        category: 'pdi',
        daysAgo: 158,
        summary:
          'The completed pre-delivery inspection form, listing every item noted on the walkthrough and its current status.'
      },
      {
        title: 'Tarion Warranty Certificate',
        category: 'warranty',
        daysAgo: 152,
        summary:
          'Your Tarion warranty enrolment for this home, with the certificate number and the coverage that applies from the date of possession.'
      },
      {
        title: 'Appliance & Fixture Manuals',
        category: 'other',
        daysAgo: 150,
        summary:
          'Manuals and warranty cards for the appliances, mechanical equipment, and plumbing fixtures installed in the home.'
      }
    ]
  }
];
