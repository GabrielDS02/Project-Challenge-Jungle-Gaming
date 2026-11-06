import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-5 text-xs font-black uppercase tracking-[.18em] transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:pointer-events-none disabled:opacity-50 active:translate-y-px",
  {
    variants: {
      variant: {
        primary: "bg-ember text-ink shadow-glow hover:bg-[#f2a25d]",
        secondary: "border border-ember/55 bg-transparent text-sand hover:bg-ember/10",
        ghost: "text-sand hover:bg-white/5 hover:text-ember",
        danger: "border border-red-400/50 bg-red-500/10 text-red-200 hover:bg-red-500/20",
      },
      size: { default: "h-11", sm: "h-9 min-h-9 px-3 text-[10px]", lg: "h-13 min-h-13 px-7" },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild, className, variant, size, ...props }, ref) => {
    const Component = asChild ? Slot : "button";
    return <Component className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";
