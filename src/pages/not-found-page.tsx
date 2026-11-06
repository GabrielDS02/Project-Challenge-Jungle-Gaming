import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/seo";

export function NotFoundPage() {
  return (
    <>
      <Seo title="Página não encontrada" description="A rota solicitada não existe no marketplace Jungle." />
      <div className="container flex min-h-[65vh] flex-col items-center justify-center py-16 text-center">
        <p className="font-display text-[8rem] font-black leading-none text-ember/15">404</p>
        <h1 className="-mt-8 font-display text-4xl font-bold">Essa trilha não existe.</h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-sand/50">
          A página pode ter mudado ou nunca ter feito parte desta coleção.
        </p>
        <Button asChild className="mt-7">
          <Link to="/">Voltar ao início</Link>
        </Button>
      </div>
    </>
  );
}
