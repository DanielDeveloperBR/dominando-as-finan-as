import { Meta, GoalService, CriarMetaPayload } from '@/services/goalsService';
import { useState, useCallback } from 'react';

export const useGoals = () => {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarMetas = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await GoalService.listar();
      setMetas(dados);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar metas');
    } finally {
      setCarregando(false);
    }
  }, []);

  const criarMeta = async (payload: CriarMetaPayload): Promise<void> => {
    setErro(null);
    await GoalService.criar(payload);
    await carregarMetas();
  };

  const depositar = async (id: string, valor: number): Promise<void> => {
    setErro(null);
    const metaAtualizada = await GoalService.depositar(id, valor);
    setMetas(prev => prev.map(m => m.id === id ? metaAtualizada : m));
  };

  const excluirMeta = async (id: string): Promise<void> => {
    setErro(null);
    await GoalService.excluir(id);
    setMetas(prev => prev.filter(m => m.id !== id));
  };

  return {
    metas,
    carregando,
    erro,
    carregarMetas,
    criarMeta,
    depositar,
    excluirMeta,
  };
};