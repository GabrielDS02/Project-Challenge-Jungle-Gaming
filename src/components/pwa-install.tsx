import { Download, Share2, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

export function PwaInstall({ className, mobile = false }: { className?: string; mobile?: boolean }) {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [installed, setInstalled] = useState(
    () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as NavigatorWithStandalone).standalone),
  );
  const [isIos] = useState(() => /iphone|ipad|ipod/i.test(navigator.userAgent));

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setPrompt(null);
      setInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || (!prompt && !isIos)) return null;

  const install = async () => {
    if (!prompt) {
      setShowIosHelp(true);
      return;
    }

    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "accepted") setPrompt(null);
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className={cn(mobile && "w-full", className)}
        onClick={() => void install()}
      >
        <Download size={15} />
        Instalar app
      </Button>

      <Dialog open={showIosHelp} onOpenChange={setShowIosHelp}>
        <DialogContent>
          <DialogTitle>Instale o Jungle</DialogTitle>
          <DialogDescription>
            Leve o marketplace para a tela inicial e use-o como um aplicativo independente.
          </DialogDescription>
          <ol className="mt-6 space-y-4 text-sm text-sand/65">
            <li className="flex gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ember/10 text-ember">
                <Share2 size={16} />
              </span>
              <span>Toque em Compartilhar na barra do Safari.</span>
            </li>
            <li className="flex gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ember/10 text-ember">
                <Smartphone size={16} />
              </span>
              <span>Escolha “Adicionar à Tela de Início” e confirme.</span>
            </li>
          </ol>
        </DialogContent>
      </Dialog>
    </>
  );
}
