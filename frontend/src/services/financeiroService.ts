import { Transacao, AnaliseIA } from '../types';

const API_URL = '/api/financeiro';

export class FinanceiroService {
  static async listar(): Promise<Transacao[]> {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Erro ao listar transações');
    return res.json();
  }

  static async adicionar(dados: Omit<Transacao, 'id' | 'user_id' | 'data'>): Promise<Transacao> {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });

    if (!res.ok) throw new Error('Erro ao adicionar transação');
    return res.json();
  }

  static async remover(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao remover transação');
  }

  static async resumo(): Promise<{ receitaTotal: number; despesaTotal: number; saldoTotal: number }> {
    const res = await fetch(`${API_URL}/resumo`);
    if (!res.ok) throw new Error('Erro ao buscar resumo');
    return res.json();
  }

  static async analisar(): Promise<AnaliseIA> {
    const res = await fetch(`${API_URL}/analisar`, { method: 'POST' });
    if (!res.ok) throw new Error('Erro ao analisar finanças');
    return res.json();
  }
}
