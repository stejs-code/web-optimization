import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800",
        secondary: "bg-purple-600/20 border border-purple-600 text-purple-300 hover:bg-purple-600/30",
        light: "bg-slate-50 text-purple-600 hover:bg-slate-100 text-sm",
        destructive: "bg-red-600/10 border border-red-600 text-red-400 hover:bg-red-600/20 text-sm",
        nav_action: "border border-inherit hover:bg-blue-600/10"
      },
      size: {
        sm: "px-4 py-1",
        md: "px-6 py-1.5",
        lg: "px-6 py-2",
        xl: "px-8 py-4"
      },
      borderRadius: {
        lg: "rounded-lg",
        md: "rounded-md",
        full: "rounded-full"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      borderRadius: "lg"
    }
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, borderRadius, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, borderRadius }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
