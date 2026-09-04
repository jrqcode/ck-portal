/**
 * The standard Caiden-Keller build phases, seeded onto every new project.
 *
 * Deliberately a constant rather than a table: the phase list rarely changes and
 * a template table would be one more thing to maintain. Wording is aimed at
 * homeowners, not trades — this text appears verbatim on the timeline.
 */
export const BUILD_STAGES = [
  {
    name: 'Design & Permits',
    description: 'Drawings finalised, engineering complete, and building permits issued.'
  },
  {
    name: 'Site Preparation',
    description: 'Lot cleared and graded, services staked, excavation underway.'
  },
  {
    name: 'Foundation',
    description: 'Footings and foundation walls poured, waterproofed, and backfilled.'
  },
  {
    name: 'Framing',
    description: 'Floors, walls, and roof structure go up — the shape of the house appears.'
  },
  {
    name: 'Roofing & Exterior Envelope',
    description: 'Shingles, windows, and exterior doors installed to close the house in.'
  },
  {
    name: 'Mechanicals',
    description: 'Plumbing, electrical, heating and cooling roughed in behind the walls.'
  },
  {
    name: 'Insulation & Drywall',
    description: 'Insulation inspected, then drywall hung, taped, and sanded smooth.'
  },
  {
    name: 'Interior Finishes',
    description: 'Trim, cabinetry, flooring, tile, and paint — your selections go in.'
  },
  {
    name: 'Exterior Finishes & Landscaping',
    description: 'Grading, driveway, walkways, sod, and final exterior details.'
  },
  {
    name: 'Pre-Delivery Inspection',
    description: 'We walk the finished home together and record anything needing attention.'
  },
  {
    name: 'Closing & Possession',
    description: 'Final inspections signed off, keys handed over, warranty documents issued.'
  }
] as const;
