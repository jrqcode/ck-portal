import 'server-only';

import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { PHOTO_BUCKET, signedUrls } from '@/lib/storage';
import type { Project, ProjectStage, Update, UpdatePhoto, ProjectDocument } from '@/types/database';

/**
 * Every query here goes through the user's own client, so RLS decides what comes
 * back. A homeowner cannot widen these by guessing an id — the policies filter
 * first and there is nothing to leak.
 */

export type UpdateWithPhotos = Update & {
  update_photos: UpdatePhoto[];
  project_stages: { name: string } | null;
};

/** Projects the caller can see. Homeowners normally have exactly one. */
export const getMyProjects = cache(async (): Promise<Project[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  return data ?? [];
});

/** The homeowner's build. Returns null if they somehow have none. */
export const getMyProject = cache(async (): Promise<Project | null> => {
  const projects = await getMyProjects();
  return projects[0] ?? null;
});

export const getStages = cache(async (projectId: string): Promise<ProjectStage[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from('project_stages')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order');
  return data ?? [];
});

/** The stage in progress, or the last completed one if nothing is active yet. */
export function currentStage(stages: ProjectStage[]): ProjectStage | null {
  return (
    stages.find((s) => s.status === 'in_progress') ??
    stages.toReversed().find((s) => s.status === 'complete') ??
    stages[0] ??
    null
  );
}

export function nextStage(stages: ProjectStage[]): ProjectStage | null {
  return stages.find((s) => s.status === 'not_started') ?? null;
}

export const getUpdates = cache(
  async (projectId: string, limit?: number): Promise<UpdateWithPhotos[]> => {
    const supabase = await createClient();
    let query = supabase
      .from('updates')
      .select('*, update_photos(*), project_stages(name)')
      .eq('project_id', projectId)
      .order('published_at', { ascending: false, nullsFirst: false });

    if (limit) query = query.limit(limit);

    const { data } = await query;
    return ((data ?? []) as UpdateWithPhotos[]).map((u) => ({
      ...u,
      update_photos: (u.update_photos ?? []).toSorted((a, b) => a.sort_order - b.sort_order)
    }));
  }
);

export const getUpdate = cache(async (id: string): Promise<UpdateWithPhotos | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from('updates')
    .select('*, update_photos(*), project_stages(name)')
    .eq('id', id)
    .single();

  if (!data) return null;
  const update = data as UpdateWithPhotos;
  return {
    ...update,
    update_photos: (update.update_photos ?? []).toSorted((a, b) => a.sort_order - b.sort_order)
  };
});

export const getDocuments = cache(async (projectId: string): Promise<ProjectDocument[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from('documents')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  return data ?? [];
});

/** Resolve every photo in a set of updates to a signed URL in one round trip. */
export async function photoUrls(updates: UpdateWithPhotos[]) {
  const paths = updates.flatMap((u) => u.update_photos.map((p) => p.storage_path));
  return signedUrls(PHOTO_BUCKET, paths);
}
