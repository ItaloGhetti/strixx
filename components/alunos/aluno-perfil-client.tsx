"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { AlunoPerfilData, PagamentoResumo } from "@/app/(personal)/alunos/[alunoId]/page";

const formatoMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const formatoData = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

export function AlunoPerfilClient({
  aluno,
  pagamentos,
}: {
  aluno: AlunoPerfilData;
  pagamentos: PagamentoResumo[];
}) {
  const supabase = createClient();
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [objetivo, setObjetivo] = useState(aluno.objetivo ?? "");
  const [pesoAtual, setPesoAtual] = useState(aluno.peso_atual?.toString() ?? "");
  const [altura, setAltura] = useState(aluno.altura?.toString() ?? "");
  const [plano, setPlano] = useState(aluno.plano ?? "");
  const [status, setStatus] = useState(aluno.status);

  async function salvar() {
    setSalvando(true);
    setErro(null);

    const { error } = await supabase
      .from("aluno_profiles")
      .update({
        objetivo: objetivo || null,
        peso_atual: pesoAtual ? Number(pesoAtual.replace(",", ".")) : null,
        altura: altura ? Number(altura.replace(",", ".")) : null,
        plano: plano || null,
        status,
      } as never)
      .eq("id", aluno.id);

    setSalvando(false);

    if (error) {
      setErro(error.message);
      return;
    }
    setEditando(false);
  }

  const imc =
    pesoAtual && altura
      ? (Number(pesoAtual.replace(",", ".")) / Number(altura.replace(",", ".")) ** 2).toFixed(1)
      : null;

  return (
    <div>
      <Link href="/alunos" className="mb-4 inline-block text-xs font-semibold text-black/45 hover:text-black">
        ← Voltar para Alunos
      </Link>

      <div className="mb-7 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 flex-shrink-0 rounded-full bg-gradient-to-br from-purple to-purple-light" />
          <div>
            <h1 className="font-display text-2xl font-bold">{aluno.nome}</h1>
            <p className="mt-0.5 text-[13.5px] text-black/55">{aluno.email}</p>
          </div>
        </div>
        <Button variant={editando ? "secondary" : "primary"} onClick={() => setEditando((v) => !v)}>
          {editando ? "Cancelar" : "Editar perfil"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="mb-5">
            <div className="mb-4 font-display text-[15px] font-bold">Avaliação e plano</div>

            {editando ? (
              <div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Objetivo">
                    <Input value={objetivo} onChange={(e) => setObjetivo(e.target.value)} placeholder="Ex: Hipertrofia" />
                  </Field>
                  <Field label="Plano">
                    <Input value={plano} onChange={(e) => setPlano(e.target.value)} placeholder="Ex: Mensal" />
                  </Field>
                  <Field label="Peso atual (kg)">
                    <Input value={pesoAtual} onChange={(e) => setPesoAtual(e.target.value)} placeholder="70" />
                  </Field>
                  <Field label="Altura (m)">
                    <Input value={altura} onChange={(e) => setAltura(e.target.value)} placeholder="1,75" />
                  </Field>
                  <Field label="Status">
                    <select
                      className="input-field"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </Field>
                </div>
                {erro && <p className="mb-3 mt-3 text-xs text-danger">{erro}</p>}
                <Button className="mt-4" onClick={salvar} disabled={salvando}>
                  {salvando ? "Salvando..." : "Salvar alterações"}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                <div>
                  <div className="mb-1 text-xs font-semibold text-black/45">OBJETIVO</div>
                  <div className="font-medium">{aluno.objetivo ?? "—"}</div>
                </div>
                <div>
                  <div className="mb-1 text-xs font-semibold text-black/45">PLANO</div>
                  <div className="font-medium">{aluno.plano ?? "—"}</div>
                </div>
                <div>
                  <div className="mb-1 text-xs font-semibold text-black/45">PESO</div>
                  <div className="font-medium">{aluno.peso_atual ? `${aluno.peso_atual} kg` : "—"}</div>
                </div>
                <div>
                  <div className="mb-1 text-xs font-semibold text-black/45">ALTURA</div>
                  <div className="font-medium">{aluno.altura ? `${aluno.altura} m` : "—"}</div>
                </div>
                <div>
                  <div className="mb-1 text-xs font-semibold text-black/45">IMC</div>
                  <div className="font-medium">
                    {aluno.peso_atual && aluno.altura
                      ? (aluno.peso_atual / aluno.altura ** 2).toFixed(1)
                      : "—"}
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-xs font-semibold text-black/45">STATUS</div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-bold",
                      aluno.status === "ativo" ? "bg-success/10 text-success" : "bg-black/5 text-black/40"
                    )}
                  >
                    {aluno.status === "ativo" ? "Ativo" : "Inativo"}
                  </span>
                </div>
              </div>
            )}
          </Card>

          <Card>
            <div className="mb-4 font-display text-[15px] font-bold">Histórico de pagamentos</div>
            {pagamentos.length === 0 ? (
              <p className="py-4 text-center text-sm text-black/45">
                Nenhum pagamento lançado para este aluno ainda.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs font-semibold text-black/45">
                      <th className="py-2 pr-4">Valor</th>
                      <th className="py-2 pr-4">Vencimento</th>
                      <th className="py-2 pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagamentos.map((p) => (
                      <tr key={p.id} className="border-b border-border last:border-none">
                        <td className="py-2.5 pr-4 font-mono">{formatoMoeda.format(Number(p.valor))}</td>
                        <td className="py-2.5 pr-4 text-black/60">
                          {formatoData.format(new Date(p.data_vencimento))}
                        </td>
                        <td className="py-2.5 pr-4">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-[11px] font-bold",
                              p.status === "pago"
                                ? "bg-success/10 text-success"
                                : p.status === "atrasado"
                                  ? "bg-danger/10 text-danger"
                                  : "bg-warning/10 text-warning"
                            )}
                          >
                            {p.status === "pago" ? "Pago" : p.status === "atrasado" ? "Atrasado" : "Pendente"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card>
            <div className="mb-4 font-display text-[15px] font-bold">Contato</div>
            <div className="space-y-3 text-sm">
              <div>
                <div className="mb-1 text-xs font-semibold text-black/45">E-MAIL</div>
                <div className="font-medium">{aluno.email}</div>
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold text-black/45">TELEFONE</div>
                <div className="font-medium">{aluno.telefone ?? "Não informado"}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
