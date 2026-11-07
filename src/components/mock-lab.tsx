import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FlaskConical, RefreshCcw, Radio } from "lucide-react";
import { api } from "@/lib/api";
import type { MockScenario } from "@/types/api";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";
import { SelectField } from "./ui/select";

const scenarios: Array<[MockScenario, string]> = [
  ["success", "Sucesso padrão"],
  ["slow", "Rede lenta"],
  ["offline", "Sem conexão"],
  ["server-error", "Erro HTTP 503"],
  ["expired-session", "Sessão expirada"],
  ["favorite-error", "Falha em favorito"],
  ["payment-declined", "Pagamento recusado"],
  ["order-timeout", "Timeout após criar pedido"],
];

/** Evaluation control surface: scenarios remain at the network boundary and never leak into UI business logic. */
export function MockLab() {
  const client = useQueryClient();
  const scenario = useQuery({
    queryKey: ["mock-scenario"],
    queryFn: async () => (await api.get<{ scenario: MockScenario }>("/mock/scenario")).data.scenario,
    retry: false,
  });
  const select = useMutation({
    mutationFn: (value: MockScenario) => api.put("/mock/scenario", { scenario: value }),
    onSuccess: async () => {
      client.clear();
      await client.invalidateQueries();
    },
  });
  const reset = useMutation({
    mutationFn: () => api.post("/mock/reset"),
    onSuccess: async () => {
      client.clear();
      location.assign("/");
    },
  });
  const realtime = useMutation({
    mutationFn: () =>
      api.post("/mock/events/nft", { nftId: "emerald-ape-442", priceEth: "2.93", available: 3 }),
  });
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="fixed bottom-4 left-4 z-40 grid size-11 place-items-center rounded-full border border-ember/35 bg-roast text-ember shadow-xl hover:bg-bark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
          aria-label="Abrir laboratório de cenários"
        >
          <FlaskConical size={18} />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Laboratório de cenários</DialogTitle>
        <DialogDescription>
          Altere a rede simulada de forma determinística para validar feedback, recuperação e tempo real.
        </DialogDescription>
        <label className="mt-6 grid gap-2 text-xs font-bold uppercase tracking-widest text-sand/55">
          Cenário
          <SelectField
            ariaLabel="Cenário"
            value={scenario.data ?? "success"}
            options={scenarios.map(([value, label]) => ({ value, label }))}
            onValueChange={(value) => select.mutate(value)}
          />
        </label>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button variant="secondary" onClick={() => realtime.mutate()}>
            <Radio size={15} />
            Emitir nft.updated
          </Button>
          <Button variant="danger" onClick={() => reset.mutate()}>
            <RefreshCcw size={15} />
            Resetar dados
          </Button>
        </div>
        <p className="mt-5 text-xs leading-5 text-sand/35">
          O evento usa socket.io-client sobre o binding Socket.IO do MSW. O reset restaura usuários, estoque,
          carrinhos e pedidos.
        </p>
      </DialogContent>
    </Dialog>
  );
}
