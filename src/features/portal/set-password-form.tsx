'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setPassword, type PasswordState } from './actions';

const EMPTY: PasswordState = {};

export function SetPasswordForm() {
  const [state, action, pending] = useActionState(setPassword, EMPTY);

  return (
    <form action={action} className='mt-6 space-y-5'>
      <div className='space-y-2'>
        <Label htmlFor='password' className='text-sm font-medium text-ink'>
          New password
        </Label>
        <Input
          id='password'
          name='password'
          type='password'
          autoComplete='new-password'
          minLength={8}
          required
        />
        <p className='text-sm text-muted-foreground'>At least 8 characters.</p>
      </div>

      {state.error && (
        <p role='alert' className='text-sm text-destructive'>
          {state.error}
        </p>
      )}
      {state.done && (
        <p role='status' className='text-sm text-status-complete'>
          Password saved. You can now sign in either way.
        </p>
      )}

      <Button type='submit' variant='outline' size='cta' disabled={pending}>
        {pending ? 'Saving…' : 'Save password'}
      </Button>
    </form>
  );
}
