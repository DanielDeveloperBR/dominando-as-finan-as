import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FinanceiroService } from '../services/financeiroService';
import { Transacao, TipoTransacao, AnaliseIA } from '../types';

export const usePainel = () => {
  const { usuario, logout } = useAuth();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [resumo, setResumo] = useState({ receitaTotal: 0, despesaTotal: 0, saldoTotal: 0 });
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');
  const [analiseIA, setAnaliseIA] = useState<AnaliseIA | null>(null);
  const [carregandoIA, setCarregandoIA] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const carregarDados = async () => {
    if (!usuario) return;
    try {
      const [t, r] = await Promise.all([
        FinanceiroService.listar(),
        FinanceiroService.resumo()
      ]);
      setTransacoes(t);
      setResumo(r);
    } catch (error) {
      console.error(error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [usuario]);

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
    carregando
  };
};
