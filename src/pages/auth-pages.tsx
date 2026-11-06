import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { type FormEvent, type ReactNode, useState } from "react";
import { NftArtwork } from "@/components/nft-artwork";
import { Seo } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLogin, useRegister } from "@/features/auth/queries";
import { getErrorMessage } from "@/lib/utils";

function AuthCanvas({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="container grid min-h-[calc(100vh-72px)] items-center gap-10 py-12 lg:grid-cols-[1fr_460px]">
      <section className="relative hidden min-h-[620px] overflow-hidden border border-white/8 bg-roast lg:block">
        <NftArtwork
          index={0}
          alt="Colecionável Jungle"
          className="absolute inset-0 h-full w-full opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10">
          <p className="eyebrow">Uma identidade. Uma coleção.</p>
          <p className="mt-3 max-w-xl font-display text-5xl font-bold leading-none">
            SEJA DONO DO FUTURO DA ARTE DIGITAL
          </p>
        </div>
      </section>
      <section className="border border-white/8 bg-roast p-6 sm:p-9">
        <LockKeyhole className="text-ember" />
        <h1 className="mt-5 font-display text-4xl font-bold">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-sand/50">{subtitle}</p>
        {children}
      </section>
    </div>
  );
}

function PasswordField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <Field id="password" label="Senha" error={error}>
      <div className="relative">
        <Input
          id="password"
          name="password"
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="current-password"
          required
          minLength={8}
          error={Boolean(error)}
          aria-describedby={error ? "password-message" : undefined}
        />
        <button
          type="button"
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          onClick={() => setVisible((current) => !current)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-2 text-sand/45 hover:text-ember"
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </Field>
  );
}

export function LoginPage() {
  const search = useSearch({ from: "/login" });
  const navigate = useNavigate();
  const login = useLogin();
  const [email, setEmail] = useState("ada@jungle.test");
  const [password, setPassword] = useState("Jungle@123");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    login.mutate({ email, password }, { onSuccess: () => void navigate({ to: search.redirect || "/" }) });
  };
  return (
    <>
      <Seo
        title="Entrar"
        description="Acesse sua conta fictícia para favoritar, finalizar pedidos e gerenciar carteiras."
      />
      <AuthCanvas title="Bem-vindo de volta" subtitle="Entre para continuar sua jornada como colecionador.">
        <form className="mt-8 space-y-5" onSubmit={submit} noValidate>
          <Field id="email" label="E-mail">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </Field>
          <PasswordField value={password} onChange={setPassword} />
          {login.isError && (
            <p role="alert" className="text-sm text-red-300">
              {getErrorMessage(login.error)}
            </p>
          )}
          <Button className="w-full" size="lg" disabled={login.isPending}>
            {login.isPending ? "Entrando…" : "Entrar na conta"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-sand/45">
          Ainda não faz parte?{" "}
          <Link
            to="/register"
            search={{ redirect: search.redirect }}
            className="font-bold text-ember hover:underline"
          >
            Criar conta
          </Link>
        </p>
        <div className="mt-6 border-t border-white/8 pt-5 text-xs leading-5 text-sand/35">
          <strong className="text-sand/60">Conta demo:</strong> ada@jungle.test · Jungle@123
        </div>
      </AuthCanvas>
    </>
  );
}

export function RegisterPage() {
  const search = useSearch({ from: "/register" });
  const navigate = useNavigate();
  const register = useRegister();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    register.mutate(
      { name, email, password },
      { onSuccess: () => void navigate({ to: search.redirect || "/" }) },
    );
  };
  return (
    <>
      <Seo title="Criar conta" description="Crie uma conta fictícia de colecionador no marketplace Jungle." />
      <AuthCanvas
        title="Comece sua coleção"
        subtitle="Uma conta segura, criada apenas no ambiente simulado deste desafio."
      >
        <form className="mt-8 space-y-5" onSubmit={submit} noValidate>
          <Field id="name" label="Nome completo">
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
              minLength={2}
            />
          </Field>
          <Field id="email" label="E-mail">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </Field>
          <PasswordField value={password} onChange={setPassword} />
          {register.isError && (
            <p role="alert" className="text-sm text-red-300">
              {getErrorMessage(register.error)}
            </p>
          )}
          <Button className="w-full" size="lg" disabled={register.isPending}>
            {register.isPending ? "Criando…" : "Criar minha conta"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-sand/45">
          Já possui conta?{" "}
          <Link
            to="/login"
            search={{ redirect: search.redirect }}
            className="font-bold text-ember hover:underline"
          >
            Entrar
          </Link>
        </p>
        <p className="mt-6 text-xs leading-5 text-sand/35">
          Ao continuar, você aceita os termos do ambiente demonstrativo. Nenhum pagamento ou ativo real é
          criado.
        </p>
      </AuthCanvas>
    </>
  );
}
