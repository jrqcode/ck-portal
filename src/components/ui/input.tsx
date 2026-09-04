import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';

import { cn } from '@/lib/utils';

/**
 * DESIGN.md field heights: 48px in the homeowner area, 44px in admin.
 * `compact` is the starter's original 32px — dense table filters only.
 */
const inputSizes = {
  default: 'h-12 px-3.5 text-base',
  admin: 'h-11 px-3 text-sm',
  compact: 'h-8 px-2.5 py-1 text-base md:text-sm'
} as const;

function Input({
  className,
  type,
  uiSize = 'default',
  ...props
}: React.ComponentProps<'input'> & { uiSize?: keyof typeof inputSizes }) {
  return (
    <InputPrimitive
      type={type}
      data-slot='input'
      className={cn(
        'w-full min-w-0 rounded-[8px] border border-input bg-transparent transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:border-destructive md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
        inputSizes[uiSize],
        className
      )}
      {...props}
    />
  );
}

export { Input };
