"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [erro, setErro] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setErro(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.senha,
    });
    if (error) {
      setErro("E-mail ou senha incorretos.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Painel de marca */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-black p-14 text-white lg:flex">
        <div
          className="absolute -right-44 -top-40 h-[520px] w-[520px] rounded-full opacity-55 blur-[10px]"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, #8B73FF, #6C4CF1 45%, transparent 70%)",
          }}
        />
        <div className="relative z-10 font-display text-2xl font-extrabold tracking-tight">
          Str<span className="text-purple-light">i</span>x
        </div>
        <div className="relative z-10 max-w-md">
          <h1 className="mb-4 font-display text-4xl font-bold leading-tight tracking-tight">
            A operação do
            <br />
            seu treino, organizada.
          </h1>
          <p className="text-[15px] leading-relaxed text-white/65">
            Gerencie alunos, treinos, agenda e financeiro em um só lugar — enquanto seus alunos
            acompanham cada detalhe da própria evolução.
          </p>
        </div>
        <div className="relative z-10 text-[13px] text-white/40">
          Feito para personal trainers que levam o negócio a sério.
        </div>
      </div>

      {/* Formulário */}
      <div className="flex items-center justify-center p-8 lg:p-14">
        <div className="w-full max-w-sm">
          <h2 className="mb-1.5 font-display text-2xl font-bold">Bem-vindo de volta</h2>
          <p className="mb-7 text-sm text-black/55">Entre para acessar seu painel.</p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Field label="E-mail">
              <Input type="email" placeholder="voce@email.com" {...register("email")} />
              {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
            </Field>
            <Field label="Senha">
              <Input type="password" placeholder="••••••••" {...register("senha")} />
              {errors.senha && <p className="mt-1 text-xs text-danger">{errors.senha.message}</p>}
            </Field>

            {erro && <p className="mb-4 text-xs text-danger">{erro}</p>}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-black/55">
            Ainda não tem conta?{" "}
            <Link href="/cadastro" className="font-semibold text-purple">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
