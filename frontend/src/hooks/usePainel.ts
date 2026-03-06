import { useAuth } from '@/contexts';
import { FinanceSummary, HistoricoScoreItem, FinanceiroService } from '../services/financeiroService';
import { Transacao, AnaliseIA, TipoTransacao } from '../types/index';
import { useState, useMemo, useEffect, useCallback } from 'react';

export const usePainel = () => {
  const { usuario, logout } = useAuth();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [resumo, setResumo] = useState({ receitaTotal: 0, despesaTotal: 0, saldoTotal: 0 });
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [historicoScore, setHistoricoScore] = useState<HistoricoScoreItem[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');
  const [analiseIA, setAnaliseIA] = useState<AnaliseIA | null>(null);
  const [carregandoIA, setCarregandoIA] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const carregarDados = useCallback(async () => {
    if (!usuario) return;
    try {
      const [t, r, s, h] = await Promise.all([
        FinanceiroService.listar(),
        FinanceiroService.resumo(),
        FinanceiroService.getSummary().catch(() => null),
        FinanceiroService.getHistoricoScore().catch(() => []),
      ]);
      setTransacoes(t);
      setResumo(r);
      setSummary(s ? { ...s, alertas: s.alertas ?? [] } : null);
      setHistoricoScore(h);
    } catch (error) {
      console.error(error);
    } finally {
      setCarregando(false);
    }

  }, [usuario]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const adicionarTransacao = async (dados: any) => {
    await FinanceiroService.adicionar(dados);
    await carregarDados();
  };

  const removerTransacao = async (id: string) => {
    await FinanceiroService.remover(id);
    await carregarDados();
  };

  const gerarAnaliseIA = async () => {
    setCarregandoIA(true);
    try {
      const resultado = await FinanceiroService.analisar();
      setAnaliseIA(resultado);
    } catch (error) {
      console.error(error);
    } finally {
      setCarregandoIA(false);
    }
  };

  const transacoesFiltradas = useMemo(() => {
    if (filtroCategoria === 'TODAS') return transacoes;
    return transacoes.filter(t => t.categoria === filtroCategoria);
  }, [transacoes, filtroCategoria]);

  const dadosGraficoPizza = useMemo(() => {
    const agrupado = transacoes
      .filter(t => t.tipo === TipoTransacao.DESPESA)
      .reduce((acc, curr) => {
        acc[curr.categoria] = (acc[curr.categoria] || 0) + curr.valor;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(agrupado).map(([name, value]) => ({ name, value }));
  }, [transacoes]);

  const dadosGraficoHistorico = useMemo(() => {
    const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return [...historicoScore]
      .sort((a, b) => a.ano !== b.ano ? a.ano - b.ano : a.mes - b.mes)
      .map(item => ({
        label: `${MESES[item.mes - 1]}/${String(item.ano).slice(2)}`,
        score: item.score,
        saldo: item.saldo_previsto,
      }));
  }, [historicoScore]);

  return {
    usuario,
    logout,
    transacoesFiltradas,
    adicionarTransacao,
    removerTransacao,
    saldoTotal: resumo.saldoTotal,
    receitaTotal: resumo.receitaTotal,
    despesaTotal: resumo.despesaTotal,
    filtroCategoria,
    setFiltroCategoria,
    analiseIA,
    carregandoIA,
    gerarAnaliseIA,
    dadosGraficoPizza,
    dadosGraficoHistorico,
    summary,
    carregando,
  };
};