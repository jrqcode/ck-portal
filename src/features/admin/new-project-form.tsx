'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createProject, type ActionState } from './actions';

const EMPTY: ActionState = {};

export function NewProjectForm() {
  const [state, action, pending] = useActionState(createProject, EMPTY);

  return (
    <form action={action} className='mt-8 space-y-5'>
      <Field name='name' label='Build name' required placeholder='Lot 12, Gerber Meadows' />
      <Field name='address' label='Address' />
      <div className='grid gap-5 sm:grid-cols-2'>
        <Field name='community' label='Community' placeholder='Gerber Meadows' />
        <Field name='lot' label='Lot' placeholder='12' />
      </div>
      <div className='grid gap-5 sm:grid-cols-2'>
        <Field name='start_date' label='Start date' type='date' />
        <Field name='target_occupancy' label='Target occupancy' type='date' />
      </div>

      {state.error && (
        <p role='alert' className='text-sm text-destructive'>
          {state.error}
        </p>
      )}

      <Button type='submit' size='admin' disabled={pending}>
        {pending ? 'Creating…' : 'Create build'}
      </Button>
    </form>
  );
}

function Field({
  name,
  label,
  type = 'text',
  required,
  placeholder
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className='space-y-2'>
      <Label htmlFor={name} className='text-sm font-medium text-ink'>
        {label}
        {!required && <span className='ml-1.5 font-normal text-muted-foreground'>optional</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        uiSize='admin'
      />
    </div>
  );
}
