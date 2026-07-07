"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AlunoListItem } from "@/app/(personal)/alunos/page";

export function AlunosClient({
  personalId,
  alunos,
}: {
  personalId: string;
  alunos: AlunoListItem[];
}) {
  const [copiado, setCopiado] = useState(false);

  function copiarLink() {
    const link = `${window.location.origin}/cadastro?convite=${personalId}`;
    navigator.clipboard.writeText(link);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div>
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Alunos</h1>
          <p className="mt-0.5 text-[13.5px] text-black/55">
            {alunos.length} aluno{alunos.length === 1 ? "" : "s"} cadastrado{alunos.length === 1 ? "" : "s"}.
          </p>
        </div>
        <Button onClick={copiarLink}>{copiado ? "Link copiado! ✓" : "Convidar aluno"}</Button>
      </div>

      <Card className="mb-6 border-purple/20 bg-purple/[0.04]">
        <p className="text-[13px] text-black/65">
          Compartilhe seu link de convite com um aluno — ao criar a conta por ele, o aluno já
          aparece automaticamente na sua lista, vinculado a você.
        </p>
      </Card>

      {alunos.length === 0 ? (
        <Card>
          <p className="py-6 text-center text-sm text-black/45">
            Nenhum aluno ainda. Use o botão "Convidar aluno" para compartilhar seu link e começar.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {alunos.map((a) => (
            <Link key={a.id} href={`/alunos/${a.id}`}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-purple to-purple-light" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{a.nome}</div>
                    <div className="truncate text-xs text-black/45">{a.email}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-black/55">{a.objetivo ?? "Objetivo não definido"}</span>
                  <span
                    className={
                      a.status === "ativo"
                        ? "rounded-full bg-success/10 px-2 py-0.5 font-bold text-success"
                        : "rounded-full bg-black/5 px-2 py-0.5 font-bold text-black/40"
                    }
                  >
                    {a.status === "ativo" ? "Ativo" : "Inativo"}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
