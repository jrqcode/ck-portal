'use client';

import { useActionState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadDocument, type ActionState } from './actions';

const EMPTY: ActionState = {};

const CATEGORIES = [
  { value: 'contract', label: 'Agreement' },
  { value: 'plan', label: 'Plan or drawing' },
  { value: 'permit', label: 'Permit or approval' },
  { value: 'selection', label: 'Selection' },
  { value: 'pdi', label: 'Pre-delivery inspection' },
  { value: 'warranty', label: 'Warranty' },
  { value: 'other', label: 'Other' }
];

export function UploadDocumentForm({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState(uploadDocument, EMPTY);
  const form = useRef<HTMLFormElement>(null);

  // Clear the form after a successful upload so the next one is a clean start.
  useEffect(() => {
    if (state.ok) form.current?.reset();
  }, [state.ok]);

  return (
    <form ref={form} action={action} className='mt-4 space-y-4'>
      <input type='hidden' name='project_id' value={projectId} />

      <div className='space-y-2'>
        <Label htmlFor='file' className='text-sm font-medium text-ink'>
          File
        </Label>
        <Input id='file' name='file' type='file' required uiSize='admin' className='py-2' />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='title' className='text-sm font-medium text-ink'>
          Title <span className='ml-1 font-normal text-muted-foreground'>optional</span>
        </Label>
        <Input id='title' name='title' placeholder='Uses the filename if blank' uiSize='admin' />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='category' className='text-sm font-medium text-ink'>
          Category
        </Label>
        <select
          id='category'
          name='category'
          defaultValue='other'
          className='h-11 w-full rounded-[8px] border border-input bg-background px-3 text-sm'
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <label className='flex items-start gap-2.5 text-sm text-body'>
        <input
          type='checkbox'
          name='visible'
          value='true'
          defaultChecked
          className='mt-0.5 size-4 accent-[var(--ck-primary)]'
        />
        Homeowners can see this
      </label>

      {state.error && (
        <p role='alert' className='text-sm text-destructive'>
          {state.error}
        </p>
      )}
      {state.ok && (
        <p role='status' className='text-sm text-status-complete'>
          Uploaded.
        </p>
      )}

      <Button type='submit' size='admin' disabled={pending}>
        {pending ? 'Uploading…' : 'Upload'}
      </Button>
    </form>
  );
}
