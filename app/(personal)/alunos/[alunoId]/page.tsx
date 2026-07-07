import { createClient } from "@/lib/supabase/server";
import { AlunoPerfilClient } from "@/components/alunos/aluno-perfil-client";

export interface AlunoPerfilData {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  objetivo: string | null;
  peso_atual: number | null;
  altura: number | null;
  plano: string | null;
  status: string;
}

export interface PagamentoResumo {
  id: string;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: "pago" | "pendente" | "atrasado";
}

export default async function AlunoPerfilPage({ params }: { params: { alunoId: string } }) {
  const supabase = createClient();

  const { data: alunoProfile } = await supabase
    .from("aluno_profiles")
    .select("id, objetivo, peso_atual, altura, plano, status")
    .eq("id", params.alunoId)
    .single<{
      id: string;
      objetivo: string | null;
      peso_atual: number | null;
      altura: number | null;
      plano: string | null;
      status: string;
    }>();

  const { data: userRow } = await supabase
    .from("users")
    .select("nome, email, telefone")
    .eq("id", params.alunoId)
    .single<{ nome: string; email: string; telefone: string | null }>();

  const { data: pagamentos } = await supabase
    .from("pagamentos")
    .select("id, valor, data_vencimento, data_pagamento, status")
    .eq("aluno_id", params.alunoId)
    .order("data_vencimento", { ascending: false })
    .returns<PagamentoResumo[]>();

  if (!alunoProfile || !userRow) {
    return (
      <div>
        <p className="text-sm text-black/55">Aluno não encontrado.</p>
      </div>
    );
  }

  const aluno: AlunoPerfilData = {
    id: alunoProfile.id,
    nome: userRow.nome,
    email: userRow.email,
    telefone: userRow.telefone,
    objetivo: alunoProfile.objetivo,
    peso_atual: alunoProfile.peso_atual,
    altura: alunoProfile.altura,
    plano: alunoProfile.plano,
    status: alunoProfile.status,
  };

  return <AlunoPerfilClient aluno={aluno} pagamentos={pagamentos ?? []} />;
}
