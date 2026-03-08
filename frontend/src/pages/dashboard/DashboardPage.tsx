import React, { useState } from 'react';
import { usePainel } from '../../hooks/usePainel';
import { Botao } from '../../components/Botao';
import { CartaoResumo } from '../../components/CartaoResumo';
import { SecaoIA } from '../../components/SecaoIA';
import { FormularioTransacao } from '../../components/FormularioTransacao';
import { TabelaTransacoes } from '../../components/TabelaTransacoes';
import { DrawerGrupo } from '../CriarGrupo';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  Legend, LineChart, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, LogOut,
  ShieldCheck, ShieldAlert, ShieldX, AlertTriangle, Activity, Users,
} from 'lucide-react';
import { RiskLevel } from '@/services/financeiroService';
import { SecaoMetas } from '../secaoMetas';
import { SecaoOrcamento } from '../secaoOrcamento';

// ─── Constantes de cor ───────────────────────────────────────────────────────

const CORES_PIZZA = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const RISK_CONFIG: Record<RiskLevel, { label: string; cor: string; bg: string; border: string; Icone: React.ElementType }> = {
  ESTAVEL: { label: 'Estável', cor: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', Icone: ShieldCheck },
  ATENCAO: { label: 'Atenção', cor: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', Icone: ShieldAlert },
  RISCO: { label: 'Risco', cor: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', Icone: ShieldAlert },
  CRITICO: { label: 'Crítico', cor: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', Icone: ShieldX },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

// ─── Tooltip customizado do PieChart ─────────────────────────────────────────

const TooltipPizza = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-slate-300 text-xs font-medium">{payload[0].name}</p>
      <p className="text-white text-sm font-bold">{formatBRL(payload[0].value)}</p>
      <p className="text-slate-400 text-xs">{(payload[0].percent * 100).toFixed(1)}%</p>
    </div>
  );
};

// ─── Tooltip customizado do LineChart ────────────────────────────────────────

const TooltipHistorico = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-xl min-w-[140px]">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-sm font-bold" style={{ color: p.color }}>
          {p.dataKey === 'score' ? `Score: ${p.value}` : `Saldo Prev.: ${formatBRL(p.value)}`}
        </p>
      ))}
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const {
    usuario, logout, transacoesFiltradas,
    adicionarTransacao, removerTransacao,
    saldoTotal, receitaTotal, despesaTotal,
    filtroCategoria, setFiltroCategoria,
    analiseIA, carregandoIA, gerarAnaliseIA,
    dadosGraficoPizza, dadosGraficoHistorico,
    summary, carregando,
  } = usePainel();

  const [drawerGrupoAberto, setDrawerGrupoAberto] = useState(false);

  if (carregando) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-emerald-500 animate-pulse font-bold">Carregando seus dados...</div>
      </div>
    );
  }

  const riskCfg = summary ? RISK_CONFIG[summary.riskLevel] : null;

  return (
    <div className="min-h-screen bg-slate-950 pb-20">

      <DrawerGrupo
        aberto={drawerGrupoAberto}
        onFechar={() => setDrawerGrupoAberto(false)}
        usuarioLogadoId={usuario?.id ?? ''}
      />

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-emerald-500/20 p-2 rounded-lg shrink-0">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white truncate">Olá, {usuario?.nome}</h1>
              <p className="text-xs text-slate-400">Salário Base: {formatBRL(usuario?.salarioMensal ?? 0)}</p>
            </div>
          </div>
          {summary && riskCfg && (
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border ${riskCfg.bg} ${riskCfg.border} shrink-0`}>
              <riskCfg.Icone className={`w-4 h-4 ${riskCfg.cor}`} />
              <span className={`text-lg font-extrabold leading-none ${riskCfg.cor}`}>{summary.score}</span>
              <span className="text-slate-500 text-xs">/100</span>
              <span className={`text-xs font-semibold ${riskCfg.cor} hidden md:inline`}>{riskCfg.label}</span>
            </div>
          )}
          <div className="flex items-center gap-2 shrink-0">
            <Botao
              variante="secundario"
              onClick={() => setDrawerGrupoAberto(true)}
              className="text-sm"
            >
              <Users className="w-4 h-4 mr-1.5" /> Grupos
            </Botao>
            <Botao variante="fantasma" onClick={logout} className="text-sm text-slate-400 hover:text-white">
              <LogOut className="w-4 h-4 mr-2" /> Sair
            </Botao>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Cartões de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CartaoResumo titulo="Saldo Atual" valor={saldoTotal} tipo={saldoTotal >= 0 ? 'sucesso' : 'perigo'} icone={DollarSign} />
          <CartaoResumo titulo="Receitas Totais" valor={receitaTotal} tipo="info" icone={TrendingUp} />
          <CartaoResumo titulo="Despesas Totais" valor={despesaTotal} tipo="perigo" icone={TrendingDown} />
        </div>

        {/* Alertas do summary — renderizados inline sem seção própria */}
        {(summary?.alertas?.length ?? 0) > 0 && (
          <div className="flex flex-col gap-2">
            {summary?.alertas?.map((alerta, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-yellow-300 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {alerta}
              </div>
            ))}
          </div>
        )}

        {/* SecaoIA */}
        <SecaoIA analise={analiseIA} carregando={carregandoIA} onGerar={gerarAnaliseIA} />

        {/* ── Histórico de Score (LineChart) + Distribuição de Despesas (PieChart) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LineChart — histórico de score */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">Evolução do Score</h3>
            </div>

            {dadosGraficoHistorico.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center text-slate-500 gap-2">
                <Activity className="w-8 h-8 opacity-30" />
                <p className="text-sm">Histórico disponível após o 1º mês completo</p>
              </div>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dadosGraficoHistorico} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip content={<TooltipHistorico />} cursor={{ stroke: '#334155' }} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* PieChart — distribuição de despesas */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingDown className="w-5 h-5 text-rose-400" />
              <h3 className="text-lg font-semibold text-white">Distribuição de Despesas</h3>
            </div>

            {dadosGraficoPizza.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center text-slate-500 gap-2">
                <TrendingDown className="w-8 h-8 opacity-30" />
                <p className="text-sm">Nenhuma despesa registrada ainda</p>
              </div>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosGraficoPizza}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {dadosGraficoPizza.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CORES_PIZZA[index % CORES_PIZZA.length]} stroke="transparent" />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<TooltipPizza />} />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* ── Orçamento por categoria + Metas de poupança ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SecaoOrcamento />
          <SecaoMetas />
        </div>

        {/* ── Formulário + área secundária ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <FormularioTransacao onAdicionar={adicionarTransacao} />

          {/* Saldo previsto vs atual — card complementar */}
          {summary && (
            <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-white">Projeção do Mês</h3>
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex justify-between items-center py-3 border-b border-slate-800">
                  <span className="text-slate-400 text-sm">Saldo atual</span>
                  <span className={`font-bold ${summary.saldoAtual >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatBRL(summary.saldoAtual)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-800">
                  <span className="text-slate-400 text-sm">Saldo previsto (fim do mês)</span>
                  <span className={`font-bold ${summary.saldoPrevisto >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatBRL(summary.saldoPrevisto)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-800">
                  <span className="text-slate-400 text-sm">Total de despesas</span>
                  <span className="text-rose-400 font-bold">{formatBRL(summary.totalDespesa)}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-slate-400 text-sm">Gasto médio diário</span>
                  <span className="text-white font-bold">{formatBRL(summary.gastoMedioDiario)}</span>
                </div>

                {/* Barra de comprometimento da renda — usa baseDeRenda do backend
                     (salario + receitas extras) como denominador para consistência com o score.
                     BUG ANTERIOR: usava apenas usuario.salarioMensal, ignorando receitas extras,
                     causando barra 100% mesmo com renda total suficiente. */}
                {summary.baseDeRenda > 0 && (() => {
                  // percentualComprometido já vem calculado pelo backend — mesmo valor do score
                  const pct = Math.min(summary.percentualComprometido * 100, 100);
                  const barCor = pct > 90 ? 'bg-rose-500' : pct > 70 ? 'bg-yellow-500' : 'bg-emerald-500';
                  return (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Renda comprometida</span>
                        <span>{pct.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${barCor}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        {/* ── Tabela de transações ── */}
        <TabelaTransacoes
          transacoes={transacoesFiltradas}
          filtroCategoria={filtroCategoria}
          onFiltroChange={setFiltroCategoria}
          onRemover={removerTransacao}
        />
      </main>
    </div>
  );
};