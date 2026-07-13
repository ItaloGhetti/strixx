import { createClient } from "@/lib/supabase/server";
import { TreinosClient } from "@/components/treinos/treinos-client";

export interface TreinoListItem {
  id: string;
  nome: string;
  objetivo: string | null;
  categoria: string;
  totalExercicios: number;
}

export default async function TreinosPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const personalId = user?.id ?? "";

  const { data: treinos } = await supabase
    .from("treinos_biblioteca")
    .select("id, nome, objetivo, categoria")
    .eq("personal_id", personalId)
    .order("nome", { ascending: true })
    .returns<{ id: string; nome: string; objetivo: string | null; categoria: string }[]>();

  const treinoIds = (treinos ?? []).map((t) => t.id);

  const { data: exercicios } =
    treinoIds.length > 0
      ? await supabase
          .from("exercicios")
          .select("treino_id")
          .in("treino_id", treinoIds)
          .returns<{ treino_id: string }[]>()
      : { data: [] as { treino_id: string }[] };

  const lista: TreinoListItem[] = (treinos ?? []).map((t) => ({
    ...t,
    totalExercicios: (exercicios ?? []).filter((e) => e.treino_id === t.id).length,
  }));

  return <TreinosClient treinos={lista} />;
}
