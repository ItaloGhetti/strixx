"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, StatCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { PagamentoRow } from "@/app/(personal)/financeiro/page";

interface Aluno {
  id: string;
  nome: string;
  plano: string | null;
  status: string;
}

type Periodo = "hoje" | "semana" | "mes" | "ano";

const formatoMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const formatoData = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

function inicioDoDia(d: Date) {
  const novo = new Date(d);
  novo.setHours(0, 0, 0, 0);
  return novo;
}

function dentroDoPeriodo(data: Date, periodo: Periodo, hoje: Date) {
  const inicio = inicioDoDia(hoje);
  const alvo = inicioDoDia(data);
  if (periodo === "hoje") return alvo.getTime() === inicio.getTime();
  if (periodo === "semana") {
    const fimSemana = new Date(inicio);
    fimSemana.setDate(fimSemana.getDate() + 7);
    return alvo >= inicio && alvo < fimSemana;
  }
  if (periodo === "mes") {
    return alvo.getFullYear() === inicio.getFullYear() && alvo.getMonth() === inicio.getMonth();
  }
  return alvo.getFullYear() === inicio.getFullYear();
}

export function FinanceiroClient({
  personalId,
  alunos,
  pagamentosIniciais,
}: {
  personalId: string;
  alunos: Aluno[];
  pagamentosIniciais: PagamentoRow[];
}) {
  const supabase = createClient();
  const [pagamentos, setPagamentos] = useState<PagamentoRow[]>(pagamentosIniciais);
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [novoAlunoId, setNovoAlunoId] = useState(alunos[0]?.id ?? "");
  const [novoValor, setNovoValor] = useState("");
  const [novoVencimento, setNovoVencimento] = useState("");

  const hoje = useMemo(() => new Date(), []);

  const alunoPorId = useMemo(() => {
    const mapa = new Map<string, Aluno>();
    alunos.forEach((a) => mapa.set(a.id, a));
    return mapa;
  }, [alunos]);

  // status "efetivo": um pagamento pendente cuja data de vencimento já passou é tratado como atrasado
  const pagamentosComStatus = useMemo(
    () =>
      pagamentos.map((p) => {
        const vencimento = new Date(p.data_vencimento);
        const efetivo =
          p.status === "pago"
            ? "pago"
            : inicioDoDia(vencimento) < inicioDoDia(hoje)
              ? "atrasado"
              : "pendente";
        return { ...p, statusEfetivo: efetivo as "pago" | "pendente" | "atrasado" };
      }),
    [pagamentos, hoje]
  );

  const receitaDoMes = useMemo(
    () =>
      pagamentosComStatus
        .filter((p) => p.status === "pago" && p.data_pagamento)
        .filter((p) => dentroDoPeriodo(new Date(p.data_pagamento as string), "mes", hoje))
        .reduce((soma, p) => soma + Number(p.valor), 0),
    [pagamentosComStatus, hoje]
  );

  const pendentes = useMemo(
    () => pagamentosComStatus.filter((p) => p.statusEfetivo === "pendente"),
    [pagamentosComStatus]
  );
  const atrasados = useMemo(
    () => pagamentosComStatus.filter((p) => p.statusEfetivo === "atrasado"),
    [pagamentosComStatus]
  );
  const valorPendente = pendentes.reduce((s, p) => s + Number(p.valor), 0);
  const valorAtrasado = atrasados.reduce((s, p) => s + Number(p.valor), 0);

  const projecaoMes = useMemo(
    () =>
      pagamentosComStatus
        .filter((p) => dentroDoPeriodo(new Date(p.data_vencimento), "mes", hoje))
        .reduce((soma, p) => soma + Number(p.valor), 0),
    [pagamentosComStatus, hoje]
  );

  const listaFiltrada = useMemo(
    () =>
      pagamentosComStatus
        .filter((p) => dentroDoPeriodo(new Date(p.data_vencimento), periodo, hoje))
        .sort((a, b) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime()),
    [pagamentosComStatus, periodo, hoje]
  );

  async function adicionarPagamento() {
    if (!novoAlunoId || !novoValor || !novoVencimento) {
      setErro("Preencha aluno, valor e data de vencimento.");
      return;
    }
    setSalvando(true);
    setErro(null);

    const { data, error } = await supabase
      .from("pagamentos")
      .insert({
        aluno_id: novoAlunoId,
        personal_id: personalId,
        valor: Number(novoValor.replace(",", ".")),
        data_vencimento: novoVencimento,
        status: "pendente",
      } as never)
      .select("id, aluno_id, valor, data_vencimento, data_pagamento, status")
      .returns<PagamentoRow[]>();

    setSalvando(false);

    if (error) {
      setErro(error.message);
      return;
    }
    if (data && data[0]) {
      setPagamentos((atual) => [...atual, data[0]]);
    }
    setNovoValor("");
    setNovoVencimento("");
    setMostrarForm(false);
  }

  async function marcarComoPago(id: string) {
    const hojeISO = new Date().toISOString().slice(0, 10);
    setPagamentos((atual) =>
      atual.map((p) => (p.id === id ? { ...p, status: "pago", data_pagamento: hojeISO } : p))
    );
    await supabase
      .from("pagamentos")
      .update({ status: "pago", data_pagamento: hojeISO } as never)
      .eq("id", id);
  }

  async function gerarFatura(p: PagamentoRow & { statusEfetivo: string }) {
    const aluno = alunoPorId.get(p.aluno_id);
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(108, 76, 241);
    doc.text("Strix", 20, 25);

    doc.setTextColor(20, 20, 20);
    doc.setFontSize(14);
    doc.text("Fatura de Mensalidade", 20, 40);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Aluno: ${aluno?.nome ?? "—"}`, 20, 58);
    doc.text(`Plano: ${aluno?.plano ?? "—"}`, 20, 66);
    doc.text(`Valor: ${formatoMoeda.format(Number(p.valor))}`, 20, 74);
    doc.text(`Vencimento: ${formatoData.format(new Date(p.data_vencimento))}`, 20, 82);
    doc.text(
      `Status: ${p.statusEfetivo === "pago" ? "Pago" : p.statusEfetivo === "atrasado" ? "Atrasado" : "Pendente"}`,
      20,
      90
    );
    if (p.data_pagamento) {
      doc.text(`Data do pagamento: ${formatoData.format(new Date(p.data_pagamento))}`, 20, 98);
    }

    doc.setDrawColor(230, 230, 230);
    doc.line(20, 108, 190, 108);
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("Gerado automaticamente pelo Strix.", 20, 116);

    doc.save(`fatura-${aluno?.nome?.replace(/\s+/g, "-").toLowerCase() ?? "aluno"}-${p.data_vencimento}.pdf`);
  }

  const periodos: { value: Periodo; label: string }[] = [
    { value: "hoje", label: "Hoje" },
    { value: "semana", label: "Semana" },
    { value: "mes", label: "Mês" },
    { value: "ano", label: "Ano" },
  ];

  return (
    <div>
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Financeiro</h1>
          <p className="mt-0.5 text-[13.5px] text-black/55">
            Pagamentos, pendências e projeção de receita.
          </p>
        </div>
        <Button onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? "Cancelar" : "+ Adicionar pagamento"}
        </Button>
      </div>

      {mostrarForm && (
        <Card className="mb-6">
          <div className="mb-4 font-display text-[15px] font-bold">Novo pagamento</div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Aluno">
              <select
                className="input-field"
                value={novoAlunoId}
                onChange={(e) => setNovoAlunoId(e.target.value)}
              >
                {alunos.length === 0 && <option value="">Nenhum aluno cadastrado</option>}
                {alunos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Valor (R$)">
              <Input
                placeholder="150,00"
                value={novoValor}
                onChange={(e) => setNovoValor(e.target.value)}
              />
            </Field>
            <Field label="Vencimento">
              <Input
                type="date"
                value={novoVencimento}
                onChange={(e) => setNovoVencimento(e.target.value)}
              />
            </Field>
          </div>
          {erro && <p className="mb-3 text-xs text-danger">{erro}</p>}
          <Button onClick={adicionarPagamento} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar pagamento"}
          </Button>
        </Card>
      )}

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="RECEITA DO MÊS" value={formatoMoeda.format(receitaDoMes)} deltaTone="up" />
        <StatCard
          label="PENDENTES"
          value={formatoMoeda.format(valorPendente)}
          delta={`${pendentes.length} pagamento(s)`}
          deltaTone="neutral"
        />
        <StatCard
          label="INADIMPLENTES"
          value={formatoMoeda.format(valorAtrasado)}
          delta={`${atrasados.length} aluno(s) em atraso`}
          deltaTone={atrasados.length > 0 ? "warn" : "neutral"}
        />
        <StatCard label="PROJEÇÃO DO MÊS" value={formatoMoeda.format(projecaoMes)} deltaTone="neutral" />
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div className="font-display text-[15px] font-bold">Pagamentos</div>
          <div className="flex gap-1 rounded-lg bg-gray-light p-1">
            {periodos.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriodo(p.value)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold text-black/55 transition-colors",
                  periodo === p.value && "bg-white text-black shadow-sm"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {listaFiltrada.length === 0 ? (
          <p className="py-6 text-center text-sm text-black/45">
            Nenhum pagamento nesse período. Use "Adicionar pagamento" para lançar a mensalidade de
            um aluno.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-semibold text-black/45">
                  <th className="py-2 pr-4">Aluno</th>
                  <th className="py-2 pr-4">Valor</th>
                  <th className="py-2 pr-4">Vencimento</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {listaFiltrada.map((p) => {
                  const aluno = alunoPorId.get(p.aluno_id);
                  const badgeClass =
                    p.statusEfetivo === "pago"
                      ? "bg-success/10 text-success"
                      : p.statusEfetivo === "atrasado"
                        ? "bg-danger/10 text-danger"
                        : "bg-warning/10 text-warning";
                  const badgeLabel =
                    p.statusEfetivo === "pago"
                      ? "Pago"
                      : p.statusEfetivo === "atrasado"
                        ? "Atrasado"
                        : "Pendente";
                  return (
                    <tr key={p.id} className="border-b border-border last:border-none">
                      <td className="py-2.5 pr-4 font-medium">{aluno?.nome ?? "—"}</td>
                      <td className="py-2.5 pr-4 font-mono">{formatoMoeda.format(Number(p.valor))}</td>
                      <td className="py-2.5 pr-4 text-black/60">
                        {formatoData.format(new Date(p.data_vencimento))}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-[11px] font-bold",
                            badgeClass
                          )}
                        >
                          {badgeLabel}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">
                        <div className="flex gap-2">
                          {p.statusEfetivo !== "pago" && (
                            <button
                              onClick={() => marcarComoPago(p.id)}
                              className="text-xs font-semibold text-purple hover:underline"
                            >
                              Marcar como pago
                            </button>
                          )}
                          <button
                            onClick={() => gerarFatura(p)}
                            className="text-xs font-semibold text-black/55 hover:text-black hover:underline"
                          >
                            Gerar fatura
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
