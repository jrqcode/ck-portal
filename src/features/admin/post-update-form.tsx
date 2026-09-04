'use client';

import { useActionState, useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { postUpdate, type ActionState } from './actions';

const EMPTY: ActionState = {};

/**
 * The most important screen in the product, and a mobile-first one — staff use
 * it standing on a job site, one-handed, in daylight. Everything is a large tap
 * target, photos come straight from the camera roll, and the whole thing is one
 * screen with no steps.
 */
export function PostUpdateForm({
  projectId,
  stages
}: {
  projectId: string;
  stages: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(postUpdate, EMPTY);
  const [previews, setPreviews] = useState<{ name: string; url: string }[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setPreviews(files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })));
  }

  return (
    <form action={action} className='mt-8 space-y-6'>
      <input type='hidden' name='project_id' value={projectId} />

      <div className='space-y-2'>
        <Label htmlFor='photos' className='text-sm font-medium text-ink'>
          Photos
        </Label>
        <input
          ref={fileInput}
          id='photos'
          name='photos'
          type='file'
          accept='image/*'
          multiple
          onChange={onFiles}
          className='sr-only'
        />
        <Button
          type='button'
          variant='outline'
          size='cta'
          className='w-full'
          onClick={() => fileInput.current?.click()}
        >
          {previews.length > 0
            ? `${previews.length} photo${previews.length === 1 ? '' : 's'} selected — change`
            : 'Choose photos'}
        </Button>

        {previews.length > 0 && (
          <ul className='mt-3 grid grid-cols-3 gap-2'>
            {previews.map((p) => (
              <li
                key={p.url}
                className='relative aspect-square overflow-hidden rounded-[8px] bg-surface-strong'
              >
                <Image
                  src={p.url}
                  alt={p.name}
                  fill
                  sizes='33vw'
                  className='object-cover'
                  unoptimized
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='title' className='text-sm font-medium text-ink'>
          Headline
        </Label>
        <Input
          id='title'
          name='title'
          required
          placeholder='Foundation poured'
          autoComplete='off'
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='body' className='text-sm font-medium text-ink'>
          Note <span className='ml-1 font-normal text-muted-foreground'>optional</span>
        </Label>
        <Textarea
          id='body'
          name='body'
          rows={4}
          placeholder='Weather held off and the pour went well. Framing starts next week.'
          className='min-h-28 text-base'
        />
      </div>

      {stages.length > 0 && (
        <div className='space-y-2'>
          <Label htmlFor='stage_id' className='text-sm font-medium text-ink'>
            Stage <span className='ml-1 font-normal text-muted-foreground'>optional</span>
          </Label>
          <select
            id='stage_id'
            name='stage_id'
            defaultValue=''
            className='h-12 w-full rounded-[8px] border border-input bg-background px-3 text-base'
          >
            <option value=''>Not linked to a stage</option>
            {stages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {state.error && (
        <p role='alert' className='text-sm text-destructive'>
          {state.error}
        </p>
      )}

      {/* Publish is the primary action; saving a draft is for finishing the
          note back at the office. */}
      <div className='flex flex-col gap-3 sm:flex-row'>
        <Button
          type='submit'
          name='publish'
          value='true'
          size='cta'
          className='flex-1'
          disabled={pending}
        >
          {pending ? 'Posting…' : 'Post to homeowners'}
        </Button>
        <Button
          type='submit'
          name='publish'
          value='false'
          variant='outline'
          size='cta'
          disabled={pending}
        >
          Save as draft
        </Button>
      </div>
    </form>
  );
}
