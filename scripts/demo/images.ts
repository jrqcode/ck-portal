/**
 * Photos for the demo builds.
 *
 * Real job-site photography is what this portal is for, so anything you drop in
 * `demo-photos/` wins — the seed shuffles through those files and uploads them
 * instead. With the folder empty it falls back to the drawings below: one
 * parametric illustration of the house that assembles itself as the build
 * progresses, so a foundation update looks like a foundation and a finishing
 * update looks like a finished house.
 *
 * They are deliberately drawings and not fake photographs. Nobody should mistake
 * a demo for a real client's home.
 */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const WIDTH = 1600;
const HEIGHT = 1200;

/** DESIGN.md greys, softened — these read as paper, not as UI chrome. */
const SKY_TOP = '#f4f4f1';
const SKY_BOTTOM = '#e4e4e0';
const GROUND = '#cfcec8';
const LINE = '#8e8d87';
const LINE_SOFT = '#aeada7';
const SOLID = '#f0efeb';
const ROOF = '#b6b5af';
const GLASS = '#b9c1c6';

/** Deterministic jitter, so the same update always renders the same photo. */
function rng(seed: number) {
  let state = (seed * 1103515245 + 12345) & 0x7fffffff;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

const GRADE = 860;

function planSheet(jitter: () => number) {
  // Design & permits: a drawing on the table rather than anything built yet.
  const rooms: string[] = [];
  const cols = [400, 700, 1000, 1200];
  const rows = [400, 590, 800];
  for (let r = 0; r < rows.length - 1; r++) {
    for (let c = 0; c < cols.length - 1; c++) {
        if (jitter() < 0.12) continue;
      rooms.push(
        `<rect x="${cols[c]}" y="${rows[r]}" width="${cols[c + 1] - cols[c]}" height="${
          rows[r + 1] - rows[r]
        }" fill="none" stroke="${LINE}" stroke-width="5"/>`
      );
    }
  }
  const grid: string[] = [];
  for (let x = 320; x <= 1280; x += 60) {
    grid.push(`<line x1="${x}" y1="300" x2="${x}" y2="900" stroke="${LINE_SOFT}" stroke-width="2"/>`);
  }
  for (let y = 300; y <= 900; y += 60) {
    grid.push(`<line x1="320" y1="${y}" x2="1280" y2="${y}" stroke="${LINE_SOFT}" stroke-width="2"/>`);
  }
  return `
    <rect x="260" y="240" width="1080" height="720" rx="14" fill="#ffffff" stroke="${LINE_SOFT}" stroke-width="4"/>
    ${grid.join('')}
    <rect x="400" y="400" width="800" height="400" fill="none" stroke="${LINE}" stroke-width="11"/>
    ${rooms.join('')}
    <line x1="400" y1="860" x2="1200" y2="860" stroke="${LINE_SOFT}" stroke-width="4" stroke-dasharray="16 12"/>
    <line x1="400" y1="848" x2="400" y2="872" stroke="${LINE_SOFT}" stroke-width="4"/>
    <line x1="1200" y1="848" x2="1200" y2="872" stroke="${LINE_SOFT}" stroke-width="4"/>`;
}

function excavation(jitter: () => number) {
  const stakes: string[] = [];
  for (let i = 0; i < 5; i++) {
    const x = 380 + i * 210 + Math.round(jitter() * 16);
    stakes.push(
      `<line x1="${x}" y1="${GRADE - 90}" x2="${x}" y2="${GRADE + 10}" stroke="${LINE}" stroke-width="6"/>`
    );
  }
  return `
    <path d="M 430 ${GRADE} L 500 ${GRADE + 190} L 1100 ${GRADE + 190} L 1170 ${GRADE} Z"
          fill="#cfcec9" stroke="${LINE}" stroke-width="5"/>
    ${stakes.join('')}
    <line x1="380" y1="${GRADE - 90}" x2="1220" y2="${GRADE - 90}" stroke="${LINE_SOFT}" stroke-width="3"/>`;
}

function foundation() {
  return `
    <rect x="430" y="${GRADE - 120}" width="740" height="160" fill="${SOLID}" stroke="${LINE}" stroke-width="6"/>
    <line x1="430" y1="${GRADE}" x2="1170" y2="${GRADE}" stroke="${LINE_SOFT}" stroke-width="3"/>`;
}

const WALL_TOP = 520;
const ROOF_APEX = 340;

function roofLine(fill: string) {
  return `<path d="M 390 ${WALL_TOP} L 800 ${ROOF_APEX} L 1210 ${WALL_TOP} Z"
            fill="${fill}" stroke="${LINE}" stroke-width="6" stroke-linejoin="round"/>`;
}

function framedShell(jitter: () => number) {
  const studs: string[] = [];
  const count = 9 + Math.round(jitter() * 3);
  for (let i = 1; i < count; i++) {
    const x = 430 + (740 / count) * i;
    studs.push(
      `<line x1="${x}" y1="${WALL_TOP}" x2="${x}" y2="${GRADE - 120}" stroke="${LINE_SOFT}" stroke-width="7"/>`
    );
  }
  const trusses: string[] = [];
  for (let i = 1; i < 4; i++) {
    const x = 500 + i * 200;
    trusses.push(
      `<line x1="${x}" y1="${WALL_TOP}" x2="800" y2="${ROOF_APEX + 20}" stroke="${LINE_SOFT}" stroke-width="5"/>`
    );
  }
  return `
    <rect x="430" y="${WALL_TOP}" width="740" height="${GRADE - 120 - WALL_TOP}" fill="none" stroke="${LINE}" stroke-width="6"/>
    ${studs.join('')}
    <line x1="430" y1="${WALL_TOP + 110}" x2="1170" y2="${WALL_TOP + 110}" stroke="${LINE_SOFT}" stroke-width="6"/>
    ${trusses.join('')}
    ${roofLine('none')}`;
}

function closedShell() {
  return `
    <rect x="430" y="${WALL_TOP}" width="740" height="${GRADE - 120 - WALL_TOP}" fill="${SOLID}" stroke="${LINE}" stroke-width="6"/>
    ${roofLine(ROOF)}`;
}

function windows(glazed: boolean) {
  const boxes = [
    [500, WALL_TOP + 60, 150, 110],
    [730, WALL_TOP + 60, 150, 110],
    [960, WALL_TOP + 60, 150, 110],
    [500, WALL_TOP + 230, 150, 110],
    [960, WALL_TOP + 230, 150, 110]
  ];
  return boxes
    .map(([x, y, w, h]) => {
      const inner = glazed
        ? `<line x1="${x + w / 2}" y1="${y}" x2="${x + w / 2}" y2="${y + h}" stroke="${LINE_SOFT}" stroke-width="4"/>`
        : '';
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${
        glazed ? GLASS : '#bdbcb8'
      }" stroke="${LINE}" stroke-width="5"/>${inner}`;
    })
    .join('');
}

function services() {
  return `
    <path d="M 470 ${GRADE - 140} L 470 ${WALL_TOP + 40} L 1130 ${WALL_TOP + 40}"
          fill="none" stroke="${LINE}" stroke-width="5" stroke-dasharray="18 12"/>
    <path d="M 620 ${GRADE - 140} L 620 ${WALL_TOP + 170} L 980 ${WALL_TOP + 170} L 980 ${GRADE - 140}"
          fill="none" stroke="${LINE}" stroke-width="5" stroke-dasharray="18 12"/>
    <circle cx="470" cy="${WALL_TOP + 40}" r="12" fill="${LINE}"/>
    <circle cx="1130" cy="${WALL_TOP + 40}" r="12" fill="${LINE}"/>`;
}

function panels() {
  const lines: string[] = [];
  for (let x = 430 + 123; x < 1170; x += 123) {
    lines.push(
      `<line x1="${x}" y1="${WALL_TOP}" x2="${x}" y2="${GRADE - 120}" stroke="${LINE_SOFT}" stroke-width="3"/>`
    );
  }
  lines.push(
    `<line x1="430" y1="${WALL_TOP + 170}" x2="1170" y2="${WALL_TOP + 170}" stroke="${LINE_SOFT}" stroke-width="3"/>`
  );
  return lines.join('');
}

function door() {
  return `
    <rect x="745" y="${GRADE - 300}" width="110" height="180" fill="#b9b8b3" stroke="${LINE}" stroke-width="5"/>
    <circle cx="830" cy="${GRADE - 210}" r="7" fill="${SKY_TOP}"/>`;
}

function landscape(jitter: () => number) {
  const trees: string[] = [];
  for (const base of [250, 1360]) {
    const x = base + Math.round(jitter() * 40) - 20;
    const h = 150 + Math.round(jitter() * 60);
    trees.push(`
      <line x1="${x}" y1="${GRADE}" x2="${x}" y2="${GRADE - h}" stroke="${LINE}" stroke-width="10"/>
      <circle cx="${x}" cy="${GRADE - h - 50}" r="78" fill="#cdd0c6" stroke="${LINE_SOFT}" stroke-width="4"/>`);
  }
  return `
    <path d="M 700 ${GRADE} L 900 ${GRADE} L 1010 ${HEIGHT} L 590 ${HEIGHT} Z" fill="#d3d2ce" stroke="${LINE_SOFT}" stroke-width="3"/>
    ${trees.join('')}`;
}

/**
 * How each photo on an update is framed. An update with three photos should not
 * be the same drawing three times, so later photos crop in — a wide elevation,
 * then two closer looks.
 */
const WIDE_VIEW = [0, 0, WIDTH, HEIGHT];
const ABOVE_GRADE_VIEWS = [WIDE_VIEW, [360, 300, 800, 600], [800, 360, 800, 600]];
const AT_GRADE_VIEWS = [WIDE_VIEW, [330, 540, 800, 600], [740, 540, 800, 600]];

function viewBoxFor(stage: number, variant: number) {
  const views = stage >= 3 ? ABOVE_GRADE_VIEWS : AT_GRADE_VIEWS;
  const [x, y, w, h] = views[variant % views.length];
  return `${x} ${y} ${w} ${h}`;
}

/** The illustration for one update, chosen by which stage it belongs to. */
function buildScene(stage: number, seed: number, variant: number) {
  const jitter = rng(seed);
  const parts: string[] = [];

  if (stage <= 0) {
    parts.push(planSheet(jitter));
  } else if (stage === 1) {
    parts.push(excavation(jitter));
  } else {
    parts.push(foundation());
    if (stage === 2) {
      // Nothing above grade yet.
    } else if (stage === 3) {
      parts.push(framedShell(jitter));
    } else {
      parts.push(closedShell());
      parts.push(windows(stage >= 7));
      if (stage === 5) parts.push(services());
      if (stage === 6) parts.push(panels());
      if (stage >= 7) parts.push(door());
    }
    if (stage >= 8) parts.push(landscape(jitter));
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="${viewBoxFor(stage, variant)}">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${SKY_TOP}"/>
        <stop offset="100%" stop-color="${SKY_BOTTOM}"/>
      </linearGradient>
    </defs>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#sky)"/>
    <rect x="0" y="${GRADE}" width="${WIDTH}" height="${HEIGHT - GRADE}" fill="${GROUND}"/>
    <line x1="0" y1="${GRADE}" x2="${WIDTH}" y2="${GRADE}" stroke="${LINE_SOFT}" stroke-width="3"/>
    ${parts.join('')}
  </svg>`;
}

export async function drawStagePhoto(
  stage: number,
  seed: number,
  variant = 0
): Promise<Buffer> {
  return sharp(Buffer.from(buildScene(stage, seed, variant)))
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
}

const PHOTO_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

/**
 * Real photos to use instead, if there are any. Sorted so the order is stable
 * between runs — name them 01-…, 02-… and they upload in that order.
 */
export async function loadSuppliedPhotos(dir: string): Promise<Buffer[]> {
  let names: string[];
  try {
    names = await readdir(dir);
  } catch {
    return [];
  }

  const usable = names
    .filter((name) => PHOTO_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .toSorted();

  return Promise.all(
    usable.map(async (name) =>
      // Normalised on the way in: a 6 MB phone photo does not belong in a demo.
      sharp(await readFile(path.join(dir, name)))
        .rotate()
        .resize(1600, 1200, { fit: 'cover' })
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer()
    )
  );
}
