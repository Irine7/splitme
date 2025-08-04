import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-70',
  {
    variants: {
      variant: {
        default: 'bg-accent text-white hover:bg-accent/90 shadow-sm hover:shadow-md',
        destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md',
        outline: 'border border-border bg-transparent text-foreground hover:bg-hover-bg hover:border-accent/50',
        secondary: 'bg-secondary/10 text-secondary-foreground hover:bg-secondary/20',
        ghost: 'text-foreground hover:bg-hover-bg',
        link: 'text-accent underline-offset-4 hover:underline hover:opacity-80',
        subtle: 'bg-hover-bg text-foreground/80 hover:bg-hover-bg/80 hover:text-foreground',
        gradient: 'bg-gradient-to-r from-accent to-accent/80 text-white hover:shadow-lg hover:shadow-accent/20',
      },
      size: {
        default: 'h-10 px-5 py-2.5 rounded-lg text-sm',
        sm: 'h-9 px-4 rounded-md text-xs',
        lg: 'h-12 px-8 rounded-xl text-base',
        xl: 'h-14 px-10 rounded-xl text-lg',
        icon: 'h-10 w-10 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    asChild = false,
    isLoading = false,
    disabled = false,
    children,
    leftIcon,
    rightIcon,
    ...props
  }, ref) => {
    return (
      <button
        className={cn(
          buttonVariants({ variant, size, className }),
          'group relative overflow-hidden',
          'after:absolute after:inset-0 after:bg-white/10 after:opacity-0 hover:after:opacity-100 after:transition-opacity',
          'active:scale-[0.98] transition-transform duration-150',
          {
            'opacity-70 cursor-not-allowed': disabled || isLoading,
            'gap-2': (leftIcon || rightIcon) && children,
          }
        )}
        ref={ref}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </span>
        )}
        
        <span className={cn(
          'flex items-center gap-2 transition-opacity',
          { 'opacity-0': isLoading }
        )}>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </span>
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };