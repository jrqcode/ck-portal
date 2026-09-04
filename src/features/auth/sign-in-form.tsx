'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sendMagicLink, signInWithPassword, type AuthState } from './actions';

const EMPTY: AuthState = {};

export function SignInForm({ next }: { next: string }) {
  const [usePassword, setUsePassword] = useState(false);
  const [linkState, sendLink, linkPending] = useActionState(sendMagicLink, EMPTY);
  const [pwState, signIn, pwPending] = useActionState(signInWithPassword, EMPTY);

  if (linkState.sent) {
    return (
      <div className='text-center'>
        <h1 className='text-[22px] leading-[1.16] font-medium tracking-[-0.44px] text-ink'>
          Check your email
        </h1>
        <p className='mt-3 text-base leading-relaxed text-body'>
          We sent you a link to sign in. Open it on this device and you&rsquo;ll go straight to your
          build.
        </p>
        <p className='mt-6 text-sm text-muted-foreground'>
          The link works once and lasts an hour. If it expires, just ask for another.
        </p>
      </div>
    );
  }

  const state = usePassword ? pwState : linkState;
  const pending = usePassword ? pwPending : linkPending;

  return (
    <form action={usePassword ? signIn : sendLink} className='space-y-5'>
      <input type='hidden' name='next' value={next} />

      <div className='space-y-2'>
        <Label htmlFor='email' className='text-sm font-medium text-ink'>
          Email address
        </Label>
        <Input
          id='email'
          name='email'
          type='email'
          autoComplete='email'
          required
          placeholder='you@example.com'
          aria-invalid={state.error ? true : undefined}
        />
      </div>

      {usePassword && (
        <div className='space-y-2'>
          <Label htmlFor='password' className='text-sm font-medium text-ink'>
            Password
          </Label>
          <Input
            id='password'
            name='password'
            type='password'
            autoComplete='current-password'
            required
          />
        </div>
      )}

      {/* Never colour alone — the message carries the meaning. */}
      {state.error && (
        <p role='alert' className='text-sm text-destructive'>
          {state.error}
        </p>
      )}

      <Button type='submit' size='cta' className='w-full' disabled={pending}>
        {pending ? 'One moment…' : usePassword ? 'Sign in' : 'Email me a sign-in link'}
      </Button>

      <div className='text-center'>
        <button
          type='button'
          onClick={() => setUsePassword((v) => !v)}
          className='min-h-11 text-sm text-muted-foreground underline-offset-4 hover:text-ink hover:underline'
        >
          {usePassword ? 'Email me a link instead' : 'I have a password'}
        </button>
      </div>
    </form>
  );
}
