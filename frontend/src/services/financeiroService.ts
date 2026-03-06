import { Transacao, AnaliseIA } from '../types';

const API_URL = '/api/financeiro';

export type RiskLevel = 'ESTAVEL' | 'ATENCAO' | 'RISCO' | 'CRITICO';

export interface FinanceSummary {
  totalReceita: number;
  totalDespesa: number;
  saldoAtual: number;
  saldoPrevisto: number;
  gastoMedioDiario: number;
  score: number;
  riskLevel: RiskLevel;
  alertas: string[]
}

export interface HistoricoScoreItem {
  ano: number;
  mes: number;
  score: number;
  saldo_previsto: number;
}

export class FinanceiroService {
  static async listar(): Promise<Transacao[]> {
    const res = await fetch(API_URL + '/listarFinanceiro', { credentials: 'include' });
    if (!res.ok) throw new Error('Erro ao listar transações');
    return res.json();
  }

  static async adicionar(dados: Omit<Transacao, 'id' | 'user_id' | 'data'>): Promise<Transacao> {
    const key = crypto.randomUUID()
    const res = await fetch(API_URL + '/adicionarFinanceiro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', "Idempotency-Key": key },
      credentials: 'include',
      body: JSON.stringify(dados),
    });

    if (!res.ok) throw new Error('Erro ao adicionar transação');
    return res.json();
  }

  static async remover(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) throw new Error('Erro ao remover transação');
  }

  static async resumo(): Promise<{ receitaTotal: number; despesaTotal: number; saldoTotal: number }> {
    const res = await fetch(`${API_URL}/resumo`, { credentials: 'include' });
    if (!res.ok) throw new Error('Erro ao buscar resumo');

    const data = await res.json();

    return {
      receitaTotal: Number(data.receitaTotal) || 0,
      despesaTotal: Number(data.despesaTotal) || 0,
      saldoTotal: Number(data.saldoTotal) || 0,
    };
  }
  static async analisar(): Promise<AnaliseIA> {
    const res = await fetch(`${API_URL}/analisar`, { method: 'POST', credentials: 'include' });
    if (!res.ok) throw new Error('Erro ao analisar finanças');
    return res.json();
  }

  static async getSummary(): Promise<FinanceSummary> {
    const res = await fetch(`${API_URL}/summary`, { credentials: 'include' });
    if (!res.ok) throw new Error('Erro ao buscar summary');
    return res.json();
  }

  static async getHistoricoScore(): Promise<HistoricoScoreItem[]> {
    const res = await fetch(`${API_URL}/historico-score`, { credentials: 'include' });
    if (!res.ok) throw new Error('Erro ao buscar histórico de score');
    return res.json();
  }
}