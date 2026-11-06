import * as Label from "@radix-ui/react-label";
import type { ReactNode } from "react";

export function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label.Root htmlFor={id} className="text-[11px] font-bold uppercase tracking-[.18em] text-sand/65">
        {label}
      </Label.Root>
      {children}
      {(error || hint) && (
        <p
          id={`${id}-message`}
          role={error ? "alert" : undefined}
          className={error ? "text-xs text-red-300" : "text-xs text-sand/45"}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
