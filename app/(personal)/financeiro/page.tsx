import { createClient } from "@/lib/supabase/server";
import { FinanceiroClient } from "@/components/financeiro/financeiro-client";

interface AlunoProfileRow {
  id: string;
  plano: string | null;
  status: string;
}
interface UserRow {
  id: string;
  nome: string;
}
export interface PagamentoRow {
  id: string;
  aluno_id: string;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: "pago" | "pendente" | "atrasado";
}

export default async function FinanceiroPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const personalId = user?.id ?? "";

  const { data: alunoProfiles } = await supabase
    .from("aluno_profiles")
    .select("id, plano, status")
    .eq("personal_id", personalId)
    .returns<AlunoProfileRow[]>();

  const alunoIds = (alunoProfiles ?? []).map((a) => a.id);

  const { data: alunoUsers } =
    alunoIds.length > 0
      ? await supabase.from("users").select("id, nome").in("id", alunoIds).returns<UserRow[]>()
      : { data: [] as UserRow[] };

  const { data: pagamentos } = await supabase
    .from("pagamentos")
    .select("id, aluno_id, valor, data_vencimento, data_pagamento, status")
    .eq("personal_id", personalId)
    .order("data_vencimento", { ascending: true })
    .returns<PagamentoRow[]>();

  const alunos = (alunoProfiles ?? []).map((a) => ({
    id: a.id,
    plano: a.plano,
    status: a.status,
    nome: alunoUsers?.find((u) => u.id === a.id)?.nome ?? "Aluno",
  }));

  return (
    <FinanceiroClient
      personalId={personalId}
      alunos={alunos}
      pagamentosIniciais={pagamentos ?? []}
    />
  );
}
