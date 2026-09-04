import type { Metadata } from 'next';
import { EmptyState } from '@/components/empty-state';
import { getDocuments, getMyProject } from '@/features/portal/queries';
import { DOCUMENT_BUCKET, signedUrls } from '@/lib/storage';
import { formatDate, formatFileSize } from '@/lib/format';
import type { DocumentCategory } from '@/types/database';

export const metadata: Metadata = { title: 'Documents' };

/** Homeowner-facing wording. Tarion paperwork gets its own groups on purpose —
 *  these are the documents owners are told to keep and produce years later. */
const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  contract: 'Agreements',
  permit: 'Permits & approvals',
  plan: 'Plans & drawings',
  warranty: 'Warranty',
  pdi: 'Pre-delivery inspection',
  selection: 'Selections',
  other: 'Other'
};

const ORDER: DocumentCategory[] = [
  'contract',
  'plan',
  'permit',
  'selection',
  'pdi',
  'warranty',
  'other'
];

export default async function DocumentsPage() {
  const project = await getMyProject();
  if (!project) return <EmptyState title='Your build is being set up' />;

  const documents = await getDocuments(project.id);
  const urls = await signedUrls(
    DOCUMENT_BUCKET,
    documents.map((d) => d.storage_path)
  );

  const groups = ORDER.map((category) => ({
    category,
    items: documents.filter((d) => d.category === category)
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      <h1 className='text-[28px] leading-[1.4] font-bold text-ink'>Documents</h1>
      <p className='mt-2 max-w-[60ch] text-base leading-relaxed text-body'>
        Your paperwork, kept in one place. Worth holding onto after you move in — your warranty
        documents in particular.
      </p>

      {groups.length === 0 ? (
        <EmptyState title='No documents yet' className='mt-10'>
          As your agreements, permits, and drawings are finalised, we&rsquo;ll add them here for you
          to download any time.
        </EmptyState>
      ) : (
        <div className='mt-12 space-y-12'>
          {groups.map((group) => (
            <section key={group.category}>
              <h2 className='border-b-2 border-gold pb-3 text-[20px] leading-[1.18] font-semibold tracking-[-0.18px] text-ink'>
                {CATEGORY_LABELS[group.category]}
              </h2>

              {/* Stacked rows with 44px+ targets — not a table. */}
              <ul className='mt-2'>
                {group.items.map((doc) => {
                  const url = urls.get(doc.storage_path);
                  return (
                    <li key={doc.id} className='border-b border-hairline-soft last:border-0'>
                      <a
                        href={url ?? '#'}
                        target='_blank'
                        rel='noreferrer'
                        className='flex min-h-16 items-center justify-between gap-4 py-4 transition-colors hover:text-primary'
                      >
                        <span className='min-w-0'>
                          <span className='block truncate text-base font-medium text-ink'>
                            {doc.title}
                          </span>
                          <span className='mt-0.5 block text-sm text-muted-foreground'>
                            {[formatDate(doc.created_at), formatFileSize(doc.size_bytes)]
                              .filter(Boolean)
                              .join(' · ')}
                          </span>
                        </span>
                        <span className='shrink-0 text-base font-medium text-primary'>Open</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
