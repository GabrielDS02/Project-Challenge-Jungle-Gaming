import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

interface SelectFieldProps<T extends string> {
  value: T;
  options: readonly SelectOption<T>[];
  onValueChange: (value: T) => void;
  ariaLabel: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * The native Windows select popup ignores parts of the site's dark color scheme.
 * Radix keeps the list accessible while giving every browser the same visual surface.
 */
export function SelectField<T extends string>({
  value,
  options,
  onValueChange,
  ariaLabel,
  id,
  disabled,
  className,
}: SelectFieldProps<T>) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        id={id}
        aria-label={ariaLabel}
        className={cn(
          "group flex h-12 w-full items-center justify-between gap-4 border border-white/12 bg-black/20 px-4 text-left text-sm font-bold text-sand outline-none transition",
          "hover:border-ember/45 hover:bg-roast focus-visible:border-ember focus-visible:ring-2 focus-visible:ring-ember/20",
          "data-[placeholder]:text-sand/40 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
      >
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon asChild>
          <ChevronDown
            size={16}
            className="shrink-0 text-ember transition-transform duration-200 group-data-[state=open]:rotate-180"
          />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          collisionPadding={12}
          className="select-menu-content z-[100] min-w-[var(--radix-select-trigger-width)] overflow-hidden border border-ember/35 bg-roast text-sand shadow-[0_24px_70px_rgba(0,0,0,.55)]"
        >
          <SelectPrimitive.ScrollUpButton className="grid h-7 place-items-center bg-bark text-ember">
            <ChevronUp size={15} />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className={cn(
                  "relative flex min-h-11 cursor-default select-none items-center px-9 py-2.5 text-sm outline-none transition-colors",
                  "data-[highlighted]:bg-ember data-[highlighted]:text-ink data-[state=checked]:text-ember data-[highlighted]:data-[state=checked]:text-ink",
                )}
              >
                <SelectPrimitive.ItemIndicator className="absolute left-3 grid place-items-center">
                  <Check size={15} strokeWidth={3} />
                </SelectPrimitive.ItemIndicator>
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="grid h-7 place-items-center bg-bark text-ember">
            <ChevronDown size={15} />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
