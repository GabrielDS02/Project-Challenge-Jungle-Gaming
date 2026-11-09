import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
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
    <div className="relative grid min-h-[calc(100vh-58px)] place-items-center overflow-hidden px-3 py-10">
      <div className="absolute inset-0 hidden opacity-35 sm:grid sm:grid-cols-3" aria-hidden="true">
        <NftArtwork index={0} alt="" />
        <NftArtwork index={4} alt="" />
        <NftArtwork index={2} alt="" />
      </div>
      <div className="absolute inset-0 bg-ink/80 backdrop-blur-[2px]" />
      <section className="relative z-10 w-full max-w-[430px] border border-ember/25 bg-roast p-6 shadow-2xl sm:p-8">
        <p className="text-center text-xs font-black tracking-[.24em] text-sand">KURIO</p>
        <h1 className="mt-7 text-center font-display text-2xl font-black">{title}</h1>
        <p className="mt-2 text-center text-[10px] leading-5 text-sand/50">{subtitle}</p>
        {children}
      </section>
    </div>
  );
}

function SocialButtons({ pending, onSocial }: { pending: boolean; onSocial: () => void }) {
  return (
    <>
      <div className="my-5 flex items-center gap-3 text-[9px] text-sand/35">
        <span className="h-px flex-1 bg-white/10" />
        Ou continue com
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <div className="grid gap-2">
        <Button type="button" variant="secondary" className="w-full" disabled={pending} onClick={onSocial}>
          <span className="text-base font-black text-[#4285f4]">G</span> Continuar com Google
        </Button>
        <Button type="button" variant="secondary" className="w-full" disabled={pending} onClick={onSocial}>
          <span className="text-base font-black text-[#6f91ff]">f</span> Continuar com Facebook
        </Button>
      </div>
    </>
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
  const socialLogin = () =>
    login.mutate(
      { email: "ada@jungle.test", password: "Jungle@123" },
      { onSuccess: () => void navigate({ to: search.redirect || "/" }) },
    );
  return (
    <>
      <Seo
        title="Entrar"
        description="Acesse sua conta fictícia para favoritar, finalizar pedidos e gerenciar carteiras."
      />
      <AuthCanvas title="Entrar" subtitle="Acesse sua carteira, coleção e perfil de qualquer lugar.">
        <form className="mt-6 space-y-4" onSubmit={submit} noValidate>
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
        <SocialButtons pending={login.isPending} onSocial={socialLogin} />
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
  const social = useLogin();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clientError, setClientError] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setClientError("As senhas precisam ser iguais.");
      return;
    }
    setClientError("");
    register.mutate(
      { name, email, password },
      { onSuccess: () => void navigate({ to: search.redirect || "/" }) },
    );
  };
  const socialRegister = () =>
    social.mutate(
      { email: "ada@jungle.test", password: "Jungle@123" },
      { onSuccess: () => void navigate({ to: search.redirect || "/" }) },
    );
  return (
    <>
      <Seo title="Criar conta" description="Crie uma conta fictícia de colecionador no marketplace Jungle." />
      <AuthCanvas
        title="Criar conta"
        subtitle="Crie seu perfil de colecionador e conecte uma carteira quando quiser."
      >
        <form className="mt-6 space-y-4" onSubmit={submit} noValidate>
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
          <Field id="confirm-password" label="Confirmar senha" error={clientError || undefined}>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
              error={Boolean(clientError)}
            />
          </Field>
          {clientError && (
            <p role="alert" className="text-sm text-red-300">
              {clientError}
            </p>
          )}
          {register.isError && (
            <p role="alert" className="text-sm text-red-300">
              {getErrorMessage(register.error)}
            </p>
          )}
          <Button className="w-full" size="lg" disabled={register.isPending}>
            {register.isPending ? "Criando…" : "Criar minha conta"}
          </Button>
        </form>
        <SocialButtons pending={social.isPending} onSocial={socialRegister} />
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
