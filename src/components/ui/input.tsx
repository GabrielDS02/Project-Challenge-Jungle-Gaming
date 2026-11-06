import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, error, ...props }, ref) => (
  <input
    ref={ref}
    aria-invalid={error || undefined}
    className={cn(
      "h-12 w-full rounded-sm border border-white/12 bg-black/20 px-4 text-sm text-sand outline-none transition placeholder:text-sand/35 focus:border-ember focus:ring-2 focus:ring-ember/20",
      error && "border-red-400 focus:border-red-400 focus:ring-red-400/20",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
