import { createClient } from "@/lib/supabase/server";
import { TreinoForm } from "@/components/treinos/treino-form";

interface ExercicioRaw {
  id: string;
  nome: string;
  series: number | null;
  repeticoes: string | null;
  carga: string | null;
  tempo: string | null;
  descanso: string | null;
  midia_url: string | null;
  ordem: number;
}

export default async function EditarTreinoPage({ params }: { params: { treinoId: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: treino } = await supabase
    .from("treinos_biblioteca")
    .select("nome, objetivo, categoria, observacoes")
    .eq("id", params.treinoId)
    .single<{ nome: string; objetivo: string | null; categoria: string; observacoes: string | null }>();

  const { data: exerciciosRaw } = await supabase
    .from("exercicios")
    .select("id, nome, series, repeticoes, carga, tempo, descanso, midia_url, ordem")
    .eq("treino_id", params.treinoId)
    .order("ordem", { ascending: true })
    .returns<ExercicioRaw[]>();

  const { data: alunoProfiles } = await supabase
    .from("aluno_profiles")
    .select("id")
    .eq("personal_id", user?.id ?? "")
    .returns<{ id: string }[]>();

  const alunoIds = (alunoProfiles ?? []).map((a) => a.id);
  const { data: alunoUsers } =
    alunoIds.length > 0
      ? await supabase.from("users").select("id, nome").in("id", alunoIds).returns<{ id: string; nome: string }[]>()
      : { data: [] as { id: string; nome: string }[] };

  if (!treino) {
    return (
      <div>
        <p className="text-sm text-black/55">Treino não encontrado.</p>
      </div>
    );
  }

  return (
    <TreinoForm
      mode="editar"
      treinoId={params.treinoId}
      alunos={alunoUsers ?? []}
      initialData={{
        nome: treino.nome,
        objetivo: treino.objetivo ?? "",
        categoria: treino.categoria,
        observacoes: treino.observacoes ?? "",
        exercicios: (exerciciosRaw ?? []).map((e) => ({
          key: e.id,
          nome: e.nome,
          series: e.series?.toString() ?? "",
          repeticoes: e.repeticoes ?? "",
          carga: e.carga ?? "",
          tempo: e.tempo ?? "",
          descanso: e.descanso ?? "",
          midia_url: e.midia_url ?? "",
        })),
      }}
    />
  );
}
