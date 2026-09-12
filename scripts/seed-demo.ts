/**
 * Seeds the demo accounts and their fictional builds.
 *
 *   bun run seed:demo              — create or refresh the demo data
 *   bun run seed:demo --dry-run    — build everything locally, touch nothing
 *   bun run seed:demo --out ./tmp  — also write the generated files to a folder
 *
 * Re-running is safe: it removes the previous demo projects (and their storage
 * objects) and lays the whole thing down again, dated relative to today.
 *
 * The service-role key is used for exactly one thing — creating the demo auth
 * users, which is the same carve-out CLAUDE.md allows for invites. Everything
 * after that runs as the demo staff account through the ordinary client, so the
 * seed goes through the same RLS policies the app does. If a policy is wrong,
 * this fails rather than papering over it.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { BUILD_STAGES } from '../src/constants/build-stages';
import { DEMO_ACCOUNTS } from '../src/lib/demo';
import type { Database, StageStatus } from '../src/types/database';
import { PEOPLE, PROJECTS, type DemoProject, type PersonKey } from './demo/content';
import { EMPTY_LIBRARY, loadPhotoFolder, photoFor } from './demo/images';
import { samplePdf } from './demo/pdf';

const PHOTO_BUCKET = 'project-photos';
const DOCUMENT_BUCKET = 'project-documents';
/** Drop real job-site photos in here and they are used instead of everything else. */
const SUPPLIED_PHOTOS_DIR = path.join(process.cwd(), 'demo-photos');
/** The curated CC0 set that ships with the repo. See demo/photo-sources.json. */
const STOCK_PHOTOS_DIR = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  'demo',
  'stock'
);

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
/**
 * Re-seed the builds without touching the accounts. Everything except creating
 * auth users runs as the demo builder through RLS, so this needs no
 * service-role key — handy for swapping the photos on a demo that already runs.
 */
const skipAccounts = args.includes('--skip-accounts');
/** Ignore the stock photos and draw the illustrations instead. */
const noStock = args.includes('--no-stock');
const outIndex = args.indexOf('--out');
const outDir = outIndex >= 0 ? args[outIndex + 1] : null;

function required(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set. Copy env.example.txt to .env.local and fill it in.`);
  }
  return value;
}

/** Midnight-anchored so a re-run at 9am and one at 5pm produce the same dates. */
const TODAY = new Date();
TODAY.setHours(12, 0, 0, 0);

function dayOffset(days: number) {
  const date = new Date(TODAY);
  date.setDate(date.getDate() - days);
  return date;
}

const isoDate = (days: number) => dayOffset(days).toISOString().slice(0, 10);
const isoTimestamp = (days: number) => dayOffset(days).toISOString();

type Client = SupabaseClient<Database>;

/**
 * Make sure every demo person has an account with the demo password.
 *
 * Creating an auth user is the one thing a staff member genuinely cannot do as
 * themselves, so this is the only step that needs the service-role key.
 */
async function ensureUsers(admin: Client, password: string) {
  const ids = new Map<PersonKey, string>();

  for (const person of PEOPLE) {
    const existing = await findUserByEmail(admin, person.email);

    if (existing) {
      const { error } = await admin.auth.admin.updateUserById(existing, {
        password,
        email_confirm: true,
        user_metadata: { full_name: person.fullName, role: person.role }
      });
      if (error) throw new Error(`Could not update ${person.email}: ${error.message}`);
      ids.set(person.key, existing);
      console.log(`  refreshed ${person.email}`);
    } else {
      const { data, error } = await admin.auth.admin.createUser({
        email: person.email,
        password,
        email_confirm: true,
        user_metadata: { full_name: person.fullName, role: person.role }
      });
      if (error || !data.user) {
        throw new Error(`Could not create ${person.email}: ${error?.message ?? 'no user'}`);
      }
      ids.set(person.key, data.user.id);
      console.log(`  created   ${person.email}`);
    }
  }

  // The trigger on auth.users fills profiles in on insert only, so names, phone
  // numbers, and role changes on an existing account are written here.
  for (const person of PEOPLE) {
    const { error } = await admin
      .from('profiles')
      .update({ full_name: person.fullName, phone: person.phone, role: person.role })
      .eq('id', ids.get(person.key)!);
    if (error) throw new Error(`Could not update the profile for ${person.email}: ${error.message}`);
  }

  return ids;
}

/**
 * The ids of accounts a previous run already created, matched on the names in
 * demo/content.ts. Used by --skip-accounts, where there is no service-role key
 * and therefore no way to read auth.users — staff can read every profile, and
 * the demo names are unique, so that is enough.
 */
async function lookupUsers(staff: Client) {
  const { data, error } = await staff.from('profiles').select('id, full_name');
  if (error) throw new Error(`Could not read the profiles: ${error.message}`);

  const byName = new Map((data ?? []).map((row) => [row.full_name, row.id]));
  const ids = new Map<PersonKey, string>();

  for (const person of PEOPLE) {
    const id = byName.get(person.fullName);
    if (!id) {
      throw new Error(
        `No account for ${person.fullName}. Run without --skip-accounts (needs SUPABASE_SERVICE_ROLE_KEY) to create them.`
      );
    }
    ids.set(person.key, id);
  }

  console.log(`  found ${ids.size} existing accounts`);
  return ids;
}

async function findUserByEmail(admin: Client, email: string) {
  const perPage = 200;
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`Could not list users: ${error.message}`);
    const match = data.users.find((user) => user.email?.toLowerCase() === email);
    if (match) return match.id;
    if (data.users.length < perPage) return null;
  }
  return null;
}

/**
 * Remove the previous run.
 *
 * Deleting a project cascades through stages, updates, photos, and documents in
 * Postgres, but storage knows nothing about that — so the object paths are read
 * out first and deleted explicitly. Only the fictional projects named in
 * demo/content.ts are touched.
 */
async function clearPreviousDemo(staff: Client) {
  const names = PROJECTS.map((project) => project.name);
  const { data: projects, error } = await staff.from('projects').select('id, name').in('name', names);
  if (error) throw new Error(`Could not look for previous demo data: ${error.message}`);
  if (!projects?.length) return;

  const ids = projects.map((project) => project.id);

  const { data: photos } = await staff
    .from('update_photos')
    .select('storage_path, updates!inner(project_id)')
    .in('updates.project_id', ids);

  const { data: documents } = await staff
    .from('documents')
    .select('storage_path')
    .in('project_id', ids);

  const photoPaths = (photos ?? []).map((row) => row.storage_path);
  const documentPaths = (documents ?? []).map((row) => row.storage_path);

  if (photoPaths.length) await staff.storage.from(PHOTO_BUCKET).remove(photoPaths);
  if (documentPaths.length) await staff.storage.from(DOCUMENT_BUCKET).remove(documentPaths);

  const { error: deleteError } = await staff.from('projects').delete().in('id', ids);
  if (deleteError) throw new Error(`Could not remove previous demo data: ${deleteError.message}`);

  console.log(
    `  removed ${projects.map((p) => p.name).join(', ')} ` +
      `(${photoPaths.length} photos, ${documentPaths.length} documents)`
  );
}

/**
 * Stage rows for one build. Each stage runs until the day before the next one
 * starts, so a single list of start dates describes the whole timeline.
 */
function stageRows(project: DemoProject, projectId: string) {
  const starts = project.stageStartsDaysAgo;

  return BUILD_STAGES.map((stage, index) => {
    const base = {
      project_id: projectId,
      name: stage.name,
      description: stage.description,
      sort_order: index
    };

    if (index >= starts.length) {
      return { ...base, status: 'not_started' as StageStatus, started_on: null, completed_on: null };
    }

    const isLast = index === starts.length - 1;
    const startedOn = isoDate(starts[index]);

    if (isLast && project.finishedDaysAgo === undefined) {
      return {
        ...base,
        status: 'in_progress' as StageStatus,
        started_on: startedOn,
        completed_on: null
      };
    }

    const finishedDaysAgo = isLast ? project.finishedDaysAgo! : starts[index + 1] + 1;
    return {
      ...base,
      status: 'complete' as StageStatus,
      started_on: startedOn,
      completed_on: isoDate(finishedDaysAgo)
    };
  });
}

/** A stable number per photo, so a re-run redraws the same picture. */
function photoSeed(title: string, index: number) {
  let hash = 7;
  for (const char of title) hash = (hash * 31 + char.charCodeAt(0)) % 100_000;
  return hash + index * 977;
}

async function main() {
  const url = required('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = required('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  const password = required('DEMO_PASSWORD');

  // The demo buttons in the app sign in with these addresses — if content.ts and
  // src/lib/demo.ts ever drift apart, the buttons stop working silently.
  for (const [role, account] of Object.entries(DEMO_ACCOUNTS)) {
    if (!PEOPLE.some((person) => person.email === account.email)) {
      throw new Error(
        `src/lib/demo.ts expects a ${role} account at ${account.email}, which scripts/demo/content.ts does not create.`
      );
    }
  }

  // Your own photos win; then the curated CC0 stock set; then drawings.
  let library = await loadPhotoFolder(SUPPLIED_PHOTOS_DIR, 'photo(s) from demo-photos/');
  if (!library.byStage.size && !library.general.length && !noStock) {
    library = await loadPhotoFolder(STOCK_PHOTOS_DIR, 'CC0 stock photo(s)');
  }
  if (library === EMPTY_LIBRARY) {
    console.log('Photos: generated illustrations.');
  } else {
    console.log(`Photos: ${library.description}.`);
  }

  if (outDir) await mkdir(outDir, { recursive: true });

  let staff: Client;
  let userIds = new Map<PersonKey, string>();

  if (dryRun) {
    console.log('\nDry run: nothing will be written to Supabase.\n');
    staff = null as unknown as Client;
    userIds = new Map(PEOPLE.map((person) => [person.key, `dry-${person.key}`]));
  } else {
    console.log('\nAccounts');

    if (skipAccounts) {
      console.log('  --skip-accounts: reusing the accounts already there');
    } else {
      const serviceKey = required('SUPABASE_SERVICE_ROLE_KEY');
      const admin = createClient<Database>(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });
      userIds = await ensureUsers(admin, password);
    }

    // Everything from here runs as the demo builder, through RLS.
    staff = createClient<Database>(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const { error } = await staff.auth.signInWithPassword({
      email: DEMO_ACCOUNTS.staff.email,
      password
    });
    if (error) throw new Error(`Could not sign in as ${DEMO_ACCOUNTS.staff.email}: ${error.message}`);

    if (skipAccounts) userIds = await lookupUsers(staff);

    console.log('\nPrevious demo data');
    await clearPreviousDemo(staff);
  }

  let photoCount = 0;
  let documentCount = 0;

  console.log('\nBuilds');
  for (const project of PROJECTS) {
    const projectId = dryRun ? crypto.randomUUID() : '';
    let id = projectId;

    if (!dryRun) {
      const { data, error } = await staff
        .from('projects')
        .insert({
          name: project.name,
          address: project.address,
          community: project.community,
          lot: project.lot,
          status: project.status,
          start_date: isoDate(project.startedDaysAgo),
          target_occupancy: isoDate(-project.occupancyDaysAhead)
        })
        .select('id')
        .single();
      if (error || !data) throw new Error(`Could not create ${project.name}: ${error?.message}`);
      id = data.id;
    }

    // Stages, in order, so the timeline reads correctly.
    const stageIds = new Map<number, string>();
    if (!dryRun) {
      const { data, error } = await staff
        .from('project_stages')
        .insert(stageRows(project, id))
        .select('id, sort_order');
      if (error || !data) throw new Error(`Could not create stages for ${project.name}: ${error?.message}`);
      for (const row of data) stageIds.set(row.sort_order, row.id);

      const members = project.homeowners.map((key) => ({
        project_id: id,
        user_id: userIds.get(key)!
      }));
      const { error: memberError } = await staff.from('project_members').insert(members);
      if (memberError) {
        throw new Error(`Could not attach homeowners to ${project.name}: ${memberError.message}`);
      }
    }

    let coverPath: string | null = null;

    // Oldest first, so created_at ordering matches the story.
    for (const update of [...project.updates].toSorted((a, b) => b.daysAgo - a.daysAgo)) {
      let updateId = crypto.randomUUID();

      if (!dryRun) {
        const { data, error } = await staff
          .from('updates')
          .insert({
            project_id: id,
            author_id: userIds.get(update.author)!,
            stage_id: stageIds.get(update.stage) ?? null,
            title: update.title,
            body: update.body,
            published_at: update.draft ? null : isoTimestamp(update.daysAgo),
            created_at: isoTimestamp(update.daysAgo)
          })
          .select('id')
          .single();
        if (error || !data) throw new Error(`Could not post "${update.title}": ${error?.message}`);
        updateId = data.id;
      }

      for (let index = 0; index < update.photos; index++) {
        const image = await photoFor(library, update.stage, index, photoSeed(update.title, index));

        // Storage policies read the first path segment, so the project id leads.
        const storagePath = `${id}/${updateId}/${crypto.randomUUID()}.jpg`;
        photoCount++;

        if (outDir) {
          const name = `${project.name.split(' ')[0]}-${update.title.slice(0, 24)}-${index}.jpg`;
          await writeFile(path.join(outDir, name.replace(/[^\w.-]/g, '_')), image);
        }

        if (!dryRun) {
          const { error } = await staff.storage
            .from(PHOTO_BUCKET)
            .upload(storagePath, image, { contentType: 'image/jpeg', upsert: false });
          if (error) throw new Error(`Could not upload a photo for "${update.title}": ${error.message}`);

          const { error: rowError } = await staff.from('update_photos').insert({
            update_id: updateId,
            storage_path: storagePath,
            sort_order: index
          });
          if (rowError) throw new Error(`Could not record a photo: ${rowError.message}`);
        }

        // The homeowner hero falls back to this when the newest update has no
        // photo of its own. Updates run oldest first, so the last write wins and
        // the cover ends up being the most recent progress photo, not the first.
        if (!update.draft && index === 0) coverPath = storagePath;
      }
    }

    for (const document of project.documents) {
      const pdf = samplePdf(
        document.title,
        `${document.summary}\n\n${project.name} · ${project.address} · ${project.lot}`,
        'Sample document from the Caiden-Keller Homes portal demo. Not a real record.'
      );
      const fileName = `${document.title.replace(/[^\w.-]+/g, '_')}.pdf`;
      const storagePath = `${id}/${crypto.randomUUID()}-${fileName}`;
      documentCount++;

      if (outDir) await writeFile(path.join(outDir, fileName), pdf);

      if (!dryRun) {
        const { error } = await staff.storage
          .from(DOCUMENT_BUCKET)
          .upload(storagePath, pdf, { contentType: 'application/pdf', upsert: false });
        if (error) throw new Error(`Could not upload "${document.title}": ${error.message}`);

        const { error: rowError } = await staff.from('documents').insert({
          project_id: id,
          title: document.title,
          category: document.category,
          storage_path: storagePath,
          size_bytes: pdf.length,
          uploaded_by: userIds.get('caiden')!,
          visible_to_homeowner: !document.hidden,
          created_at: isoTimestamp(document.daysAgo)
        });
        if (rowError) throw new Error(`Could not record "${document.title}": ${rowError.message}`);
      }
    }

    if (!dryRun && coverPath) {
      await staff.from('projects').update({ cover_photo_path: coverPath }).eq('id', id);
    }

    const published = project.updates.filter((update) => !update.draft).length;
    console.log(
      `  ${project.name} — ${published} updates, ` +
        `${project.documents.length} documents, ${project.homeowners.length} homeowner(s)`
    );
  }

  console.log(
    `\n${dryRun ? 'Would seed' : 'Seeded'} ${PROJECTS.length} builds, ` +
      `${photoCount} photos, ${documentCount} documents.`
  );

  if (!dryRun) {
    console.log('\nSign in at /sign-in with the demo buttons, or directly:');
    for (const account of Object.values(DEMO_ACCOUNTS)) {
      console.log(`  ${account.label.padEnd(16)} ${account.email}`);
    }
    console.log('\nBoth use DEMO_PASSWORD. Set NEXT_PUBLIC_DEMO_MODE=true to show the buttons.');
  }
}

main().catch((error: unknown) => {
  console.error(`\n${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
