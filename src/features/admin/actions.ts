'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireStaff } from '@/lib/auth';
import { BUILD_STAGES } from '@/constants/build-stages';
import { DOCUMENT_BUCKET, PHOTO_BUCKET } from '@/lib/storage';
import type { DocumentCategory, ProjectStage, StageStatus } from '@/types/database';

export type ActionState = { error?: string; ok?: boolean };

const MAX_PHOTO_BYTES = 15 * 1024 * 1024;
const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;

function str(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function nullableStr(form: FormData, key: string) {
  return str(form, key) || null;
}

/** Creates a project and seeds the standard build stages in one go. */
export async function createProject(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff();

  const name = str(form, 'name');
  if (!name) return { error: 'Give the project a name.' };

  const supabase = await createClient();
  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      name,
      address: nullableStr(form, 'address'),
      community: nullableStr(form, 'community'),
      lot: nullableStr(form, 'lot'),
      start_date: nullableStr(form, 'start_date'),
      target_occupancy: nullableStr(form, 'target_occupancy')
    })
    .select('id')
    .single();

  if (error || !project) return { error: 'Could not create the project. Please try again.' };

  const { error: stageError } = await supabase.from('project_stages').insert(
    BUILD_STAGES.map((stage, i) => ({
      project_id: project.id,
      name: stage.name,
      description: stage.description,
      sort_order: i
    }))
  );

  if (stageError) {
    // A project with no timeline is not usable; don't leave a half-made one behind.
    await supabase.from('projects').delete().eq('id', project.id);
    return { error: 'Could not set up the build stages. Please try again.' };
  }

  redirect(`/admin/projects/${project.id}`);
}

/**
 * Post an update. Photos upload first so a failed upload doesn't leave an
 * update with missing images. Staff use this from a phone on site.
 */
export async function postUpdate(_prev: ActionState, form: FormData): Promise<ActionState> {
  const staff = await requireStaff();

  const projectId = str(form, 'project_id');
  const title = str(form, 'title');
  if (!projectId) return { error: 'Missing project.' };
  if (!title) return { error: 'Add a short headline so homeowners know what they are looking at.' };

  const publish = form.get('publish') === 'true';
  const photos = form.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0);

  for (const photo of photos) {
    if (photo.size > MAX_PHOTO_BYTES) {
      return { error: `${photo.name} is too large. Photos must be under 15 MB.` };
    }
    if (!photo.type.startsWith('image/')) {
      return { error: `${photo.name} is not an image.` };
    }
  }

  const supabase = await createClient();

  const { data: update, error } = await supabase
    .from('updates')
    .insert({
      project_id: projectId,
      author_id: staff.id,
      stage_id: nullableStr(form, 'stage_id'),
      title,
      body: str(form, 'body'),
      published_at: publish ? new Date().toISOString() : null
    })
    .select('id')
    .single();

  if (error || !update) return { error: 'Could not save the update. Please try again.' };

  const uploaded: string[] = [];
  for (const [i, photo] of photos.entries()) {
    const ext = photo.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    // Bucket policies key off the first path segment, so the project id must lead.
    const path = `${projectId}/${update.id}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, photo, { contentType: photo.type, upsert: false });

    if (uploadError) {
      await supabase.storage.from(PHOTO_BUCKET).remove(uploaded);
      await supabase.from('updates').delete().eq('id', update.id);
      return { error: 'A photo failed to upload. Nothing was posted — please try again.' };
    }

    uploaded.push(path);
    await supabase.from('update_photos').insert({
      update_id: update.id,
      storage_path: path,
      sort_order: i
    });
  }

  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}`);
}

export async function publishUpdate(formData: FormData) {
  await requireStaff();
  const id = String(formData.get('id'));
  const projectId = String(formData.get('project_id'));

  const supabase = await createClient();
  await supabase.from('updates').update({ published_at: new Date().toISOString() }).eq('id', id);

  revalidatePath(`/admin/projects/${projectId}`);
}

export async function deleteUpdate(formData: FormData) {
  await requireStaff();
  const id = String(formData.get('id'));
  const projectId = String(formData.get('project_id'));

  const supabase = await createClient();

  // Remove the objects too, or the bucket fills with orphans.
  const { data: photos } = await supabase
    .from('update_photos')
    .select('storage_path')
    .eq('update_id', id);

  if (photos?.length) {
    await supabase.storage.from(PHOTO_BUCKET).remove(photos.map((p) => p.storage_path));
  }

  await supabase.from('updates').delete().eq('id', id);
  revalidatePath(`/admin/projects/${projectId}`);
}

export async function setStageStatus(formData: FormData) {
  await requireStaff();
  const id = String(formData.get('id'));
  const projectId = String(formData.get('project_id'));
  const status = String(formData.get('status')) as StageStatus;

  const today = new Date().toISOString().slice(0, 10);
  const patch: Partial<ProjectStage> = { status };
  if (status === 'in_progress') {
    patch.started_on = today;
    patch.completed_on = null;
  } else if (status === 'complete') {
    patch.completed_on = today;
  } else {
    patch.started_on = null;
    patch.completed_on = null;
  }

  const supabase = await createClient();
  await supabase.from('project_stages').update(patch).eq('id', id);

  revalidatePath(`/admin/projects/${projectId}`);
}

export async function uploadDocument(_prev: ActionState, form: FormData): Promise<ActionState> {
  const staff = await requireStaff();

  const projectId = str(form, 'project_id');
  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) return { error: 'Choose a file to upload.' };
  if (file.size > MAX_DOCUMENT_BYTES) return { error: 'Documents must be under 25 MB.' };

  const title = str(form, 'title') || file.name;
  const path = `${projectId}/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, '_')}`;

  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) return { error: 'That file could not be uploaded. Please try again.' };

  const { error } = await supabase.from('documents').insert({
    project_id: projectId,
    title,
    category: (str(form, 'category') || 'other') as DocumentCategory,
    storage_path: path,
    size_bytes: file.size,
    uploaded_by: staff.id,
    visible_to_homeowner: form.get('visible') !== 'false'
  });

  if (error) {
    await supabase.storage.from(DOCUMENT_BUCKET).remove([path]);
    return { error: 'That file could not be saved. Please try again.' };
  }

  revalidatePath(`/admin/projects/${projectId}/documents`);
  return { ok: true };
}

export async function deleteDocument(formData: FormData) {
  await requireStaff();
  const id = String(formData.get('id'));
  const projectId = String(formData.get('project_id'));

  const supabase = await createClient();
  const { data: doc } = await supabase
    .from('documents')
    .select('storage_path')
    .eq('id', id)
    .single();

  if (doc) await supabase.storage.from(DOCUMENT_BUCKET).remove([doc.storage_path]);
  await supabase.from('documents').delete().eq('id', id);

  revalidatePath(`/admin/projects/${projectId}/documents`);
}

/**
 * Invite a homeowner and attach them to a build.
 *
 * Needs the service-role client — inviting is the one thing a staff user
 * genuinely cannot do as themselves. Public sign-up stays disabled in Supabase,
 * so this is the only route to an account.
 */
export async function inviteHomeowner(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff();

  const email = str(form, 'email').toLowerCase();
  const fullName = str(form, 'full_name');
  const projectId = str(form, 'project_id');

  if (!email) return { error: 'Enter an email address.' };
  if (!projectId) return { error: 'Choose which build to attach them to.' };

  const h = await headers();
  const origin = `${h.get('x-forwarded-proto') ?? 'https'}://${h.get('x-forwarded-host') ?? h.get('host')}`;

  const admin = createAdminClient();

  // Already has an account? Just attach them to this build.
  const { data: existing } = await admin
    .from('profiles')
    .select('id')
    .eq('id', (await lookupUserId(email)) ?? '')
    .maybeSingle();

  let userId = existing?.id ?? null;

  if (!userId) {
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName, role: 'homeowner' },
      redirectTo: `${origin}/auth/callback`
    });
    if (error || !data.user) {
      return { error: 'Could not send that invitation. Check the address and try again.' };
    }
    userId = data.user.id;
  }

  const { error } = await admin
    .from('project_members')
    .upsert({ project_id: projectId, user_id: userId }, { onConflict: 'project_id,user_id' });

  if (error) return { error: 'Invited, but could not attach them to the build. Try again.' };

  revalidatePath('/admin/people');
  revalidatePath(`/admin/projects/${projectId}/people`);
  return { ok: true };
}

async function lookupUserId(email: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin.auth.admin.listUsers();
  return data?.users.find((u) => u.email?.toLowerCase() === email)?.id ?? null;
}

export async function removeMember(formData: FormData) {
  await requireStaff();
  const projectId = String(formData.get('project_id'));
  const userId = String(formData.get('user_id'));

  const supabase = await createClient();
  await supabase.from('project_members').delete().eq('project_id', projectId).eq('user_id', userId);

  revalidatePath(`/admin/projects/${projectId}/people`);
}
