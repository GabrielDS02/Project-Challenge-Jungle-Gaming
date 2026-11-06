import { AlertTriangle, LoaderCircle } from "lucide-react";
import { Button } from "./button";

export function Skeleton({ className = "h-6" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-sm bg-white/7 ${className}`} aria-hidden="true">
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/8 to-transparent motion-safe:animate-shimmer" />
    </div>
  );
}

export function PageLoader({ label = "Carregando" }: { label?: string }) {
  return (
    <div className="container flex min-h-[55vh] items-center justify-center" role="status">
      <LoaderCircle className="animate-spin text-ember motion-reduce:animate-none" size={28} />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function ErrorState({
  title = "Algo saiu do ritmo",
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <section
      className="mx-auto my-20 max-w-lg border border-red-400/20 bg-red-500/5 p-8 text-center"
      role="alert"
    >
      <AlertTriangle className="mx-auto mb-4 text-ember" />
      <h2 className="font-display text-2xl text-sand">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-sand/60">{message}</p>
      {onRetry && (
        <Button className="mt-6" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </section>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <section className="border border-dashed border-white/15 bg-white/[.02] px-6 py-16 text-center">
      <p className="font-display text-2xl text-sand">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-sand/50">{message}</p>
    </section>
  );
}
