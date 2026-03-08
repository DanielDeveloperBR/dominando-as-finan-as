import { ConsumoOrcamento, BudgetService, DefinirLimitePayload } from '@/services/budgeService';
import { useState, useCallback } from 'react';

export const useBudget = () => {
  const [orcamentos, setOrcamentos] = useState<ConsumoOrcamento[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarOrcamentos = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await BudgetService.listar();
      setOrcamentos(dados);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar orçamentos');
    } finally {
      setCarregando(false);
    }
  }, []);

  const definirLimite = async (payload: DefinirLimitePayload): Promise<void> => {
    setErro(null);
    await BudgetService.definir(payload);
    await carregarOrcamentos();
  };

  const removerLimite = async (id: string): Promise<void> => {
    setErro(null);
    await BudgetService.remover(id);
    setOrcamentos(prev => prev.filter(o => o.id !== id));
  };

  return {
    orcamentos,
    carregando,
    erro,
    carregarOrcamentos,
    definirLimite,
    removerLimite,
  };
};