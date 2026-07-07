import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function HojePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: perfil } = await supabase
    .from("users")
    .select("nome")
    .eq("id", user?.id ?? "")
    .single();

  const { data: agua } = await supabase
    .from("registro_agua")
    .select("quantidade_ml, meta_ml")
    .eq("aluno_id", user?.id ?? "")
    .eq("data", new Date().toISOString().slice(0, 10))
    .single<{ quantidade_ml: number; meta_ml: number }>();

  const litros = ((agua?.quantidade_ml ?? 0) / 1000).toFixed(1);
  const meta = ((agua?.meta_ml ?? 3000) / 1000).toFixed(1);

  return (
    <div>
      <div className="mb-4 px-1">
        <p className="text-xs font-semibold text-black/55">
          Olá{perfil?.nome ? `, ${perfil.nome.split(" ")[0]}` : ""} 👋
        </p>
        <h2 className="font-display text-xl font-bold">Hoje é dia de treinar</h2>
      </div>

      <div className="mb-3.5 flex items-center gap-4 rounded-2xl bg-black p-5 text-white">
        <div
          className="relative flex h-[74px] w-[74px] flex-shrink-0 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(#8B73FF 0turn ${
              (Number(litros) / Number(meta)) * 1
            }turn, rgba(255,255,255,0.12) 0turn 1turn)`,
          }}
        >
          <div className="absolute inset-2 rounded-full bg-black" />
          <span className="relative z-10 font-mono text-[13px] font-semibold">{litros}L</span>
        </div>
        <div>
          <b className="mb-0.5 block text-sm">Meta diária de água</b>
          <small className="text-xs text-white/55">Meta de {meta}L por dia</small>
        </div>
      </div>

      <div className="mb-3.5 rounded-2xl bg-white p-5 shadow-sm">
        <span className="mb-2.5 inline-block rounded-full bg-purple/10 px-2.5 py-1 text-[10.5px] font-bold text-purple">
          TREINO DE HOJE
        </span>
        <h3 className="mb-1 font-display text-lg font-bold">Nenhum treino atribuído ainda</h3>
        <p className="mb-3.5 text-xs text-black/55">
          Assim que seu personal enviar um treino, ele aparece aqui.
        </p>
        <Button className="w-full">Marcar água ✓</Button>
      </div>
    </div>
  );
}
