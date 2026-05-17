import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-bounce overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/85 [a&]:hover:scale-105',
        secondary:
          'border-transparent bg-warm-accent text-white [a&]:hover:bg-warm-accent/90 [a&]:hover:scale-105',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/85 [a&]:hover:scale-105 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'text-warm-accent border-warm-accent/50 [a&]:hover:bg-warm-accent/10 [a&]:hover:border-warm-accent [a&]:hover:scale-105',
        warm: 'border-warm-accent/30 bg-warm-accent/10 text-warm-accent font-medium [a&]:hover:bg-warm-accent/20 [a&]:hover:scale-105',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
