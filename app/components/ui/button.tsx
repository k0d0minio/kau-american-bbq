import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-char-600 focus-visible:ring-offset-2 focus-visible:ring-offset-bone disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-char-700 text-bone shadow-soft hover:bg-char-900 hover:shadow-lift hover:-translate-y-0.5",
        ember:
          "bg-ember text-bone-100 shadow-soft hover:bg-[#9a3410] hover:shadow-lift hover:-translate-y-0.5",
        outline:
          "border border-char-700/30 text-char-700 hover:border-char-700 hover:bg-char-700 hover:text-bone",
        ghost: "text-ink-soft hover:bg-char-50 hover:text-char-700",
        light:
          "bg-bone-100/90 text-char-900 backdrop-blur hover:bg-bone-100 hover:-translate-y-0.5 shadow-soft",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-14 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
