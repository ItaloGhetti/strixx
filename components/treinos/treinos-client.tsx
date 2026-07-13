"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { TreinoListItem } from "@/app/(personal)/treinos/page";

const CATEGORIAS = [
  { value: "hipertrofia", label: "Hipertrofia" },
  { value: "emagrecimento", label: "Emagrecimento" },
  { value: "iniciante", label: "Iniciante" },
  { value: "intermediario", label: "Intermediário" },
  { value: "avancado", label: "Avançado" },
  { value: "mobilidade", label: "Mobilidade" },
  { value: "cardio", label: "Cardio" },
];

function labelCategoria(valor: string) {
  return CATEGORIAS.find((c) => c.value === valor)?.label ?? valor;
}

export function TreinosClient({ treinos: treinosIniciais }: { treinos: TreinoListItem[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [treinos, setTreinos] = useState(treinosIniciais);
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string>("todas");

  const filtrados = useMemo(() => {
    return treinos.filter((t) => {
      const bateBusca = t.nome.toLowerCase().includes(busca.toLowerCase());
      const bateCategoria = categoria === "todas" || t.categoria === categoria;
      return bateBusca && bateCategoria;
    });
  }, [treinos, busca, categoria]);

  async function excluirTreino(id: string) {
    if (!confirm("Excluir este treino da biblioteca? Essa ação não pode ser desfeita.")) return;
    setTreinos((atual) => atual.filter((t) => t.id !== id));
    await supabase.from("treinos_biblioteca").delete().eq("id", id);
  }

  async function duplicarTreino(t: TreinoListItem) {
    const { data: novoTreino, error } = await supabase
      .from("treinos_biblioteca")
      .insert({
        personal_id: (await supabase.auth.getUser()).data.user?.id ?? "",
        nome: `${t.nome} (cópia)`,
        objetivo: t.objetivo,
        categoria: t.categoria,
      } as never)
      .select("id, nome, objetivo, categoria")
      .returns<{ id: string; nome: string; objetivo: string | null; categoria: string }[]>();

    if (error || !novoTreino?.[0]) return;

    const { data: exerciciosOriginais } = await supabase
      .from("exercicios")
      .select("nome, series, repeticoes, carga, tempo, descanso, midia_url, ordem")
      .eq("treino_id", t.id)
      .returns
        {
          nome: string;
          series: number | null;
          repeticoes: string | null;
          carga: string | null;
          tempo: string | null;
          descanso: string | null;
          midia_url: string | null;
          ordem: number;
        }[]
      >();

    if (exerciciosOriginais && exerciciosOriginais.length > 0) {
      await supabase.from("exercicios").insert(
        exerciciosOriginais.map((e) => ({ ...e, treino_id: novoTreino[0].id })) as never
      );
    }

    setTreinos((atual) => [
      ...atual,
      { ...novoTreino[0], totalExercicios: exerciciosOriginais?.length ?? 0 },
    ]);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Biblioteca de Treinos</h1>
          <p className="mt-0.5 text-[13.5px] text-black/55">
            {treinos.length} treino{treinos.length === 1 ? "" : "s"} na sua biblioteca.
          </p>
        </div>
        <Link href="/treinos/novo">
          <Button>+ Criar treino</Button>
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
        <Input
          placeholder="Pesquisar treino..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="md:max-w-xs"
        />
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setCategoria("todas")}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              categoria === "todas" ? "bg-black text-white" : "bg-gray-light text-black/55"
            )}
          >
            Todas
          </button>
          {CATEGORIAS.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategoria(c.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                categoria === c.value ? "bg-black text-white" : "bg-gray-light text-black/55"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {filtrados.length === 0 ? (
        <Card>
          <p className="py-6 text-center text-sm text-black/45">
            {treinos.length === 0
              ? 'Nenhum treino ainda. Clique em "Criar treino" para montar o primeiro.'
              : "Nenhum treino encontrado com esse filtro."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((t) => (
            <Card key={t.id}>
              <div className="mb-3 flex items-start justify-between gap-2">
                <Link href={`/treinos/${t.id}`} className="min-w-0">
                  <div className="truncate font-display text-[15px] font-bold hover:text-purple">
                    {t.nome}
                  </div>
                  <div className="mt-0.5 text-xs text-black/45">
                    {t.totalExercicios} exercício{t.totalExercicios === 1 ? "" : "s"}
                  </div>
                </Link>
                <span className="flex-shrink-0 rounded-full bg-purple/10 px-2.5 py-1 text-[11px] font-bold text-purple">
                  {labelCategoria(t.categoria)}
                </span>
              </div>
              {t.objetivo && <p className="mb-4 text-xs text-black/55">{t.objetivo}</p>}
              <div className="flex gap-3 text-xs font-semibold">
                <Link href={`/treinos/${t.id}`} className="text-purple hover:underline">
                  Editar
                </Link>
                <button onClick={() => duplicarTreino(t)} className="text-black/55 hover:text-black hover:underline">
                  Duplicar
                </button>
                <button onClick={() => excluirTreino(t.id)} className="text-danger hover:underline">
                  Excluir
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
