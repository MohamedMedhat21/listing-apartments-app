import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-accent-strong',
        outline: 'border-border bg-background hover:bg-muted hover:text-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-muted',
        ghost: 'hover:bg-muted hover:text-foreground',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'min-h-11 px-4',
        sm: 'min-h-11 px-3',
        lg: 'min-h-12 px-6',
        icon: 'size-11 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
