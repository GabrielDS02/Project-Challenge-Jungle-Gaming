import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm data-[state=open]:animate-in" />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 max-h-[88vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-white/10 bg-roast p-6 shadow-2xl focus:outline-none sm:p-8",
          className,
        )}
      >
        {children}
        <DialogPrimitive.Close className="group absolute right-4 top-4 z-10 grid size-11 place-items-center rounded-full border border-ember/45 bg-ink/85 text-sand shadow-lg backdrop-blur transition hover:border-ember hover:bg-ember hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-roast">
          <X
            className="transition-transform duration-300 group-hover:rotate-90 group-focus-visible:rotate-90"
            size={19}
            aria-hidden="true"
          />
          <span className="sr-only">Fechar</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export const DialogTitle = ({ children }: { children: ReactNode }) => (
  <DialogPrimitive.Title className="font-display text-3xl font-bold text-sand">
    {children}
  </DialogPrimitive.Title>
);
export const DialogDescription = ({ children }: { children: ReactNode }) => (
  <DialogPrimitive.Description className="mt-2 text-sm leading-6 text-sand/60">
    {children}
  </DialogPrimitive.Description>
);
