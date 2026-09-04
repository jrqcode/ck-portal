'use client';

import { useActionState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { inviteHomeowner, type ActionState } from './actions';

const EMPTY: ActionState = {};

export function InviteForm({
  projectId,
  projects
}: {
  projectId?: string;
  projects?: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(inviteHomeowner, EMPTY);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) form.current?.reset();
  }, [state.ok]);

  return (
    <form ref={form} action={action} className='mt-4 space-y-4'>
      {projectId ? (
        <input type='hidden' name='project_id' value={projectId} />
      ) : (
        <div className='space-y-2'>
          <Label htmlFor='project_id' className='text-sm font-medium text-ink'>
            Build
          </Label>
          <select
            id='project_id'
            name='project_id'
            required
            className='h-11 w-full rounded-[8px] border border-input bg-background px-3 text-sm'
          >
            <option value=''>Choose a build…</option>
            {(projects ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className='space-y-2'>
        <Label htmlFor='full_name' className='text-sm font-medium text-ink'>
          Name
        </Label>
        <Input id='full_name' name='full_name' uiSize='admin' autoComplete='off' />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='email' className='text-sm font-medium text-ink'>
          Email
        </Label>
        <Input id='email' name='email' type='email' required uiSize='admin' autoComplete='off' />
      </div>

      {state.error && (
        <p role='alert' className='text-sm text-destructive'>
          {state.error}
        </p>
      )}
      {state.ok && (
        <p role='status' className='text-sm text-status-complete'>
          Invitation sent.
        </p>
      )}

      <Button type='submit' size='admin' disabled={pending}>
        {pending ? 'Sending…' : 'Send invitation'}
      </Button>
    </form>
  );
}
