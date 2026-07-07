import { createClient } from "@/lib/supabase/server";
import { AlunosClient } from "@/components/alunos/alunos-client";

export interface AlunoListItem {
  id: string;
  nome: string;
  email: string;
  objetivo: string | null;
  plano: string | null;
  status: string;
}

export default async function AlunosPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const personalId = user?.id ?? "";

  const { data: alunoProfiles } = await supabase
    .from("aluno_profiles")
    .select("id, objetivo, plano, status")
    .eq("personal_id", personalId)
    .returns<{ id: string; objetivo: string | null; plano: string | null; status: string }[]>();

  const alunoIds = (alunoProfiles ?? []).map((a) => a.id);

  const { data: alunoUsers } =
    alunoIds.length > 0
      ? await supabase
          .from("users")
          .select("id, nome, email")
          .in("id", alunoIds)
          .returns<{ id: string; nome: string; email: string }[]>()
      : { data: [] as { id: string; nome: string; email: string }[] };

  const alunos: AlunoListItem[] = (alunoProfiles ?? []).map((a) => {
    const u = alunoUsers?.find((u) => u.id === a.id);
    return {
      id: a.id,
      nome: u?.nome ?? "Aluno",
      email: u?.email ?? "",
      objetivo: a.objetivo,
      plano: a.plano,
      status: a.status,
    };
  });

  return <AlunosClient personalId={personalId} alunos={alunos} />;
}
