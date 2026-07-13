"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

const CATEGORIAS = [
  { value: "hipertrofia", label: "Hipertrofia" },
  { value: "emagrecimento", label: "Emagrecimento" },
  { value: "iniciante", label: "Iniciante" },
  { value: "intermediario", label: "Intermediário" },
  { value: "avancado", label: "Avançado" },
  { value: "mobilidade", label: "Mobilidade" },
  { value: "cardio", label: "Cardio" },
];

interface ExercicioForm {
  key: string;
  nome: string;
  series: string;
  repeticoes: string;
  carga: string;
  tempo: string;
  descanso: string;
  midia_url: string;
}

function novoExercicioVazio(): ExercicioForm {
  return {
    key: crypto.randomUUID(),
    nome: "",
    series: "",
    repeticoes: "",
    carga: "",
    tempo: "",
    descanso: "",
    midia_url: "",
  };
}

export interface TreinoFormInitialData {
  nome: string;
  objetivo: string;
  categoria: string;
  observacoes: string;
  exercicios: ExercicioForm[];
}

export function TreinoForm({
  mode,
  treinoId,
  initialData,
  alunos,
}: {
  mode: "novo" | "editar";
  treinoId?: string;
  initialData?: TreinoFormInitialData;
  alunos?: { id: string; nome: string }[];
}) {
  const supabase = createClient();
  const router = useRouter();

  const [nome, setNome] = useState(initialData?.nome ?? "");
  const [objetivo, setObjetivo] = useState(initialData?.objetivo ?? "");
  const [categoria, setCategoria] = useState(initialData?.categoria ?? "hipertrofia");
  const [observacoes, setObservacoes] = useState(initialData?.observacoes ?? "");
  const [exercicios, setExercicios] = useState<ExercicioForm[]>(
    initialData?.exercicios && initialData.exercicios.length > 0
      ? initialData.exercicios
      : [novoExercicioVazio()]
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [alunoSelecionado, setAlunoSelecionado] = useState(alunos?.[0]?.id ?? "");
  const [atribuindo, setAtribuindo] = useState(false);
  const [atribuido, setAtribuido] = useState(false);

  function atualizarExercicio(key: string, campo: keyof ExercicioForm, valor: string) {
    setExercicios((atual) => atual.map((e) => (e.key === key ? { ...e, [campo]: valor } : e)));
  }

  function removerExercicio(key: string) {
    setExercicios((atual) => atual.filter((e) => e.key !== key));
  }

  function adicionarExercicio() {
    setExercicios((atual) => [...atual, novoExercicioVazio()]);
  }

  async function salvar() {
    if (!nome.trim()) {
      setErro("Dê um nome para o treino.");
      return;
    }
    setSalvando(true);
    setErro(null);

    const exerciciosValidos = exercicios.filter((e) => e.nome.trim() !== "");

    if (mode === "novo") {
      const userId = (await supabase.auth.getUser()).data.user?.id ?? "";

      const { data: treino, error } = await supabase
        .from("treinos_biblioteca")
        .insert({
          personal_id: userId,
          nome,
          objetivo: objetivo || null,
          categoria,
          observacoes: observacoes || null,
        } as never)
        .select("id")
        .returns<{ id: string }[]>();

      if (error || !treino?.[0]) {
        setErro(error?.message ?? "Não foi possível criar o treino.");
        setSalvando(false);
        return;
      }

      if (exerciciosValidos.length > 0) {
        await supabase.from("exercicios").insert(
          exerciciosValidos.map((e, i) => ({
            treino_id: treino[0].id,
            nome: e.nome,
            series: e.series ? Number(e.series) : null,
            repeticoes: e.repeticoes || null,
            carga: e.carga || null,
            tempo: e.tempo || null,
            descanso: e.descanso || null,
            midia_url: e.midia_url || null,
            ordem: i,
          })) as never
        );
      }

      router.push(`/treinos/${treino[0].id}`);
      router.refresh();
      return;
    }

    // modo editar
    await supabase
      .from("treinos_biblioteca")
      .update({
        nome,
        objetivo: objetivo || null,
        categoria,
        observacoes: observacoes || null,
      } as never)
      .eq("id", treinoId as string);

    // substitui a lista de exercícios (mais simples que diff campo a campo)
    await supabase.from("exercicios").delete().eq("treino_id", treinoId as string);
    if (exerciciosValidos.length > 0) {
      await supabase.from("exercicios").insert(
        exerciciosValidos.map((e, i) => ({
          treino_id: treinoId as string,
          nome: e.nome,
          series: e.series ? Number(e.series) : null,
          repeticoes: e.repeticoes || null,
          carga: e.carga || null,
          tempo: e.tempo || null,
          descanso: e.descanso || null,
          midia_url: e.midia_url || null,
          ordem: i,
        })) as never
      );
    }

    setSalvando(false);
    router.refresh();
  }

  async function atribuirAoAluno() {
    if (!alunoSelecionado || !treinoId) return;
    setAtribuindo(true);
    await supabase.from("treinos_atribuidos").insert({
      treino_id: treinoId,
      aluno_id: alunoSelecionado,
    } as never);
    setAtribuindo(false);
    setAtribuido(true);
    setTimeout(() => setAtribuido(false), 2500);
  }

  return (
    <div>
      <Link href="/treinos" className="mb-4 inline-block text-xs font-semibold text-black/45 hover:text-black">
        ← Voltar para Biblioteca de Treinos
      </Link>

      <h1 className="mb-6 font-display text-2xl font-bold">
        {mode === "novo" ? "Criar treino" : "Editar treino"}
      </h1>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="mb-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Nome do treino">
                <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Hipertrofia - Superior" />
              </Field>
              <Field label="Categoria">
                <select className="input-field" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                  {CATEGORIAS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Objetivo">
                <Input value={objetivo} onChange={(e) => setObjetivo(e.target.value)} placeholder="Ex: Ganho de massa muscular" />
              </Field>
              <Field label="Observações">
                <Input value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Opcional" />
              </Field>
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div className="font-display text-[15px] font-bold">Exercícios</div>
              <button onClick={adicionarExercicio} className="text-xs font-semibold text-purple hover:underline">
                + Adicionar exercício
              </button>
            </div>

            <div className="space-y-4">
              {exercicios.map((ex, i) => (
                <div key={ex.key} className="rounded-xl border border-border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-black/45">Exercício {i + 1}</span>
                    {exercicios.length > 1 && (
                      <button onClick={() => removerExercicio(ex.key)} className="text-xs font-semibold text-danger hover:underline">
                        Remover
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    <div className="col-span-2 md:col-span-3">
                      <Field label="Nome do exercício">
                        <Input
                          value={ex.nome}
                          onChange={(e) => atualizarExercicio(ex.key, "nome", e.target.value)}
                          placeholder="Ex: Supino reto"
                        />
                      </Field>
                    </div>
                    <Field label="Séries">
                      <Input value={ex.series} onChange={(e) => atualizarExercicio(ex.key, "series", e.target.value)} placeholder="4" />
                    </Field>
                    <Field label="Repetições">
                      <Input
                        value={ex.repeticoes}
                        onChange={(e) => atualizarExercicio(ex.key, "repeticoes", e.target.value)}
                        placeholder="12"
                      />
                    </Field>
                    <Field label="Carga">
                      <Input value={ex.carga} onChange={(e) => atualizarExercicio(ex.key, "carga", e.target.value)} placeholder="20kg" />
                    </Field>
                    <Field label="Tempo">
                      <Input value={ex.tempo} onChange={(e) => atualizarExercicio(ex.key, "tempo", e.target.value)} placeholder="Opcional" />
                    </Field>
                    <Field label="Descanso">
                      <Input
                        value={ex.descanso}
                        onChange={(e) => atualizarExercicio(ex.key, "descanso", e.target.value)}
                        placeholder="60s"
                      />
                    </Field>
                    <Field label="Link do GIF/vídeo">
                      <Input
                        value={ex.midia_url}
                        onChange={(e) => atualizarExercicio(ex.key, "midia_url", e.target.value)}
                        placeholder="Opcional"
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>

            {erro && <p className="mt-4 text-xs text-danger">{erro}</p>}
            <Button className="mt-5" onClick={salvar} disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar treino"}
            </Button>
          </Card>
        </div>

        {mode === "editar" && (
          <div>
            <Card>
              <div className="mb-3 font-display text-[15px] font-bold">Atribuir a um aluno</div>
              {!alunos || alunos.length === 0 ? (
                <p className="text-xs text-black/45">
                  Você ainda não tem alunos cadastrados. Convide um aluno na aba "Alunos" primeiro.
                </p>
              ) : (
                <>
                  <Field label="Aluno">
                    <select
                      className="input-field"
                      value={alunoSelecionado}
                      onChange={(e) => setAlunoSelecionado(e.target.value)}
                    >
                      {alunos.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.nome}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Button className="w-full" onClick={atribuirAoAluno} disabled={atribuindo}>
                    {atribuido ? "Atribuído! ✓" : atribuindo ? "Atribuindo..." : "Atribuir treino"}
                  </Button>
                </>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
