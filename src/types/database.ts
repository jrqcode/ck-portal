/**
 * Hand-written to match supabase/migrations. Regenerate with:
 *   supabase gen types typescript --linked > src/types/database.ts
 *
 * These are type aliases, not interfaces, on purpose: postgrest-js constrains
 * rows to `Record<string, unknown>`, and an interface has no implicit index
 * signature. Declare one of these as an interface and every insert and update
 * in the app silently resolves to `never`.
 */

export type UserRole = 'staff' | 'homeowner';
export type ProjectStatus = 'pre_construction' | 'in_progress' | 'on_hold' | 'complete';
export type StageStatus = 'not_started' | 'in_progress' | 'complete';
export type DocumentCategory =
  | 'contract'
  | 'permit'
  | 'plan'
  | 'warranty'
  | 'pdi'
  | 'selection'
  | 'other';

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
};

export type Project = {
  id: string;
  name: string;
  address: string | null;
  community: string | null;
  lot: string | null;
  status: ProjectStatus;
  cover_photo_path: string | null;
  start_date: string | null;
  target_occupancy: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectMember = {
  project_id: string;
  user_id: string;
  created_at: string;
};

export type ProjectStage = {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  sort_order: number;
  status: StageStatus;
  started_on: string | null;
  completed_on: string | null;
};

export type Update = {
  id: string;
  project_id: string;
  author_id: string | null;
  stage_id: string | null;
  title: string;
  body: string;
  /** null means draft — homeowners never see these. */
  published_at: string | null;
  created_at: string;
};

export type UpdatePhoto = {
  id: string;
  update_id: string;
  storage_path: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
};

export type ProjectDocument = {
  id: string;
  project_id: string;
  title: string;
  category: DocumentCategory;
  storage_path: string;
  size_bytes: number | null;
  uploaded_by: string | null;
  visible_to_homeowner: boolean;
  created_at: string;
};

/**
 * supabase-js resolves inserts and updates through this shape. `Relationships`
 * must be present or every query collapses to `never`.
 */
type Table<Row, Relationships extends readonly unknown[] = []> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: Relationships;
};

/** Foreign keys, so embedded selects like `project_members(profiles(*))` resolve. */
type FK<Column extends string, Relation extends string> = {
  foreignKeyName: string;
  columns: [Column];
  isOneToOne: false;
  referencedRelation: Relation;
  referencedColumns: ['id'];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile>;
      projects: Table<Project>;
      project_members: Table<
        ProjectMember,
        [FK<'project_id', 'projects'>, FK<'user_id', 'profiles'>]
      >;
      project_stages: Table<ProjectStage, [FK<'project_id', 'projects'>]>;
      updates: Table<
        Update,
        [
          FK<'project_id', 'projects'>,
          FK<'author_id', 'profiles'>,
          FK<'stage_id', 'project_stages'>
        ]
      >;
      update_photos: Table<UpdatePhoto, [FK<'update_id', 'updates'>]>;
      documents: Table<
        ProjectDocument,
        [FK<'project_id', 'projects'>, FK<'uploaded_by', 'profiles'>]
      >;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      user_role: UserRole;
      project_status: ProjectStatus;
      stage_status: StageStatus;
      document_category: DocumentCategory;
    };
    CompositeTypes: { [_ in never]: never };
  };
};
