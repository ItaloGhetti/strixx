"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { cadastroSchema, type CadastroInput } from "@/lib/validators/auth";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const roles = [
  { value: "personal" as const, icon: "🏋️", label: "Personal Trainer" },
  { value: "aluno" as const, icon: "🎯", label: "Aluno" },
];

function CadastroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const convitePersonalId = searchParams.get("convite");
  const supabase = createClient();
  const [erro, setErro] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CadastroInput>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: { role: convitePersonalId ? "aluno" : "personal" },
  });

  const roleAtual = watch("role");

  async function onSubmit(data: CadastroInput) {
    setErro(null);

    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.senha,
    });
    if (error || !signUpData.user) {
      setErro(error?.message ?? "Não foi possível criar a conta.");
      return;
    }

    const userId = signUpData.user.id;

    const { error: userError } = await supabase.from("users").insert({
      id: userId,
      email: data.email,
      nome: data.nome,
      role: data.role,
    } as never);
    if (userError) {
      setErro(userError.message);
      return;
    }

    if (data.role === "personal") {
      await supabase.from("personal_profiles").insert({ id: userId } as never);
    } else {
      await supabase.from("aluno_profiles").insert({
        id: userId,
        personal_id: convitePersonalId ?? null,
      } as never);
    }

    router.push(data.role === "personal" ? "/dashboard" : "/hoje");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-light p-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center font-display text-xl font-extrabold tracking-tight">
          Str<span className="text-purple">i</span>x
        </div>

        <h2 className="mb-1.5 font-display text-2xl font-bold">Criar sua conta</h2>
        {convitePersonalId ? (
          <p className="mb-5 rounded-lg bg-purple/10 px-3 py-2 text-xs font-semibold text-purple">
            Você foi convidado(a) para entrar como aluno(a) 🎯
          </p>
        ) : (
          <p className="mb-5 text-sm text-black/55">Você é:</p>
        )}

        {!convitePersonalId && (
          <div className="mb-6 grid grid-cols-2 gap-2.5">
            {roles.map((r) => (
              <button
                type="button"
                key={r.value}
                onClick={() => setValue("role", r.value)}
                className={cn(
                  "rounded-xl border-[1.5px] border-border px-3 py-4 text-center transition-colors duration-150",
                  roleAtual === r.value && "border-purple bg-purple/[0.06]"
                )}
              >
                <div className="mb-1.5 text-xl">{r.icon}</div>
                <div className="text-[12.5px] font-semibold">{r.label}</div>
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Field label="Nome">
            <Input placeholder="Seu nome" {...register("nome")} />
            {errors.nome && <p className="mt-1 text-xs text-danger">{errors.nome.message}</p>}
          </Field>
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
            {isSubmitting ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-black/55">
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-purple">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function CadastroPage() {
  return (
    <Suspense fallback={null}>
      <CadastroForm />
    </Suspense>
  );
}
