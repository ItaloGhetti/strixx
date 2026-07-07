import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: perfil } = await supabase
    .from("users")
    .select("nome")
    .eq("id", user?.id ?? "")
    .single();

  const { count: alunosAtivos } = await supabase
    .from("aluno_profiles")
    .select("id", { count: "exact", head: true })
    .eq("personal_id", user?.id ?? "")
    .eq("status", "ativo");

  return (
    <div>
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Dashboard</h1>
          <p className="mt-0.5 text-[13.5px] text-black/55">
            Bom dia{perfil?.nome ? `, ${perfil.nome.split(" ")[0]}` : ""}. Aqui está o resumo de
            hoje.
          </p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="ALUNOS ATIVOS" value={String(alunosAtivos ?? 0)} />
        <StatCard label="AULAS HOJE" value="—" deltaTone="neutral" />
        <StatCard label="RECEITA DO MÊS" value="R$ 0" deltaTone="neutral" />
        <StatCard label="PENDÊNCIAS" value="0" deltaTone="neutral" />
      </div>

      <p className="text-sm text-black/45">
        Assim que você cadastrar alunos, aulas e pagamentos, os cards e gráficos acima passam a
        refletir os dados reais.
      </p>
    </div>
  );
}
