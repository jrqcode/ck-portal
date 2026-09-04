import { cn } from '@/lib/utils';
import type { ProjectStatus, StageStatus } from '@/types/database';

/**
 * DESIGN.md: status is never colour alone — every badge carries a label. Red is
 * the brand accent, so it never appears here; in-progress is amber, complete is
 * green, and everything dormant is grey.
 */
const STYLES = {
  progress: 'bg-status-progress-tint text-status-progress',
  complete: 'bg-status-complete-tint text-status-complete',
  hold: 'bg-surface-strong text-status-hold'
} as const;

const STAGE_LABELS: Record<StageStatus, { label: string; tone: keyof typeof STYLES }> = {
  not_started: { label: 'Not started', tone: 'hold' },
  in_progress: { label: 'In progress', tone: 'progress' },
  complete: { label: 'Complete', tone: 'complete' }
};

const PROJECT_LABELS: Record<ProjectStatus, { label: string; tone: keyof typeof STYLES }> = {
  pre_construction: { label: 'Pre-construction', tone: 'hold' },
  in_progress: { label: 'Under construction', tone: 'progress' },
  on_hold: { label: 'On hold', tone: 'hold' },
  complete: { label: 'Complete', tone: 'complete' }
};

function Badge({
  label,
  tone,
  className
}: {
  label: string;
  tone: keyof typeof STYLES;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-full px-2.5 text-[11px] leading-[1.18] font-semibold',
        STYLES[tone],
        className
      )}
    >
      {label}
    </span>
  );
}

export function StageBadge({ status, className }: { status: StageStatus; className?: string }) {
  const { label, tone } = STAGE_LABELS[status];
  return <Badge label={label} tone={tone} className={className} />;
}

export function ProjectBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  const { label, tone } = PROJECT_LABELS[status];
  return <Badge label={label} tone={tone} className={className} />;
}

export function DraftBadge({ className }: { className?: string }) {
  return <Badge label='Draft' tone='hold' className={className} />;
}
