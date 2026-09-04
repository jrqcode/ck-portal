import 'server-only';

import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { Profile, Project, ProjectStage, ProjectDocument, Update } from '@/types/database';

export type ProjectRow = Project & {
  homeowners: string[];
  current_stage: string | null;
  last_update_at: string | null;
};

/**
 * The admin projects list, ordered by staleness.
 *
 * Sorting by "days since last update" is deliberate: a portal nobody updates is
 * worse than no portal, so the build most at risk of going quiet sits at the top
 * of the page every time a staff member signs in.
 */
export const getProjectRows = cache(async (): Promise<ProjectRow[]> => {
  const supabase = await createClient();

  const { data } = await supabase
    .from('projects')
    .select(
      `*,
       project_members(profiles(full_name)),
       project_stages(name, status, sort_order),
       updates(published_at)`
    )
    .order('created_at', { ascending: false });

  type Raw = Project & {
    project_members: { profiles: { full_name: string } | null }[] | null;
    project_stages: Pick<ProjectStage, 'name' | 'status' | 'sort_order'>[] | null;
    updates: { published_at: string | null }[] | null;
  };

  const rows = ((data ?? []) as Raw[]).map((p) => {
    const published = (p.updates ?? [])
      .map((u) => u.published_at)
      .filter((d): d is string => Boolean(d))
      .toSorted()
      .toReversed();

    const stages = (p.project_stages ?? []).toSorted((a, b) => a.sort_order - b.sort_order);

    return {
      ...p,
      homeowners: (p.project_members ?? [])
        .map((m) => m.profiles?.full_name)
        .filter((n): n is string => Boolean(n)),
      current_stage:
        stages.find((s) => s.status === 'in_progress')?.name ??
        stages.toReversed().find((s) => s.status === 'complete')?.name ??
        null,
      last_update_at: published[0] ?? null
    };
  });

  // Never updated sorts first, then oldest update first.
  return rows.toSorted((a, b) => {
    if (a.last_update_at === b.last_update_at) return 0;
    if (!a.last_update_at) return -1;
    if (!b.last_update_at) return 1;
    return a.last_update_at < b.last_update_at ? -1 : 1;
  });
});

export const getProject = cache(async (id: string): Promise<Project | null> => {
  const supabase = await createClient();
  const { data } = await supabase.from('projects').select('*').eq('id', id).single();
  return data ?? null;
});

export const getProjectStages = cache(async (projectId: string): Promise<ProjectStage[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from('project_stages')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order');
  return data ?? [];
});

/** Includes drafts — staff see them, homeowners never do (RLS enforces that). */
export const getProjectUpdates = cache(async (projectId: string): Promise<Update[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from('updates')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  return data ?? [];
});

export const getProjectDocuments = cache(async (projectId: string): Promise<ProjectDocument[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from('documents')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  return data ?? [];
});

export const getProjectPeople = cache(async (projectId: string): Promise<Profile[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from('project_members')
    .select('profiles(*)')
    .eq('project_id', projectId);

  return ((data ?? []) as { profiles: Profile | null }[])
    .map((r) => r.profiles)
    .filter((p): p is Profile => Boolean(p));
});

export const getAllPeople = cache(async (): Promise<Profile[]> => {
  const supabase = await createClient();
  const { data } = await supabase.from('profiles').select('*').order('role').order('full_name');
  return data ?? [];
});
