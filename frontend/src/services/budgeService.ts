const API_URL = '/api/budget';

export interface ConsumoOrcamento {
  id: string;
  categoria: string;
  limite_mensal: number;
  mes: number;
  ano: number;
  gasto_atual: number;
  percentual: number;
  valor_restante: number;
  dias_no_mes: number;
  dia_atual: number;
  ritmo_projetado: number;
  vai_estourar: boolean;
}

export interface DefinirLimitePayload {
  categoria: string;
  limite_mensal: number;
}

export class BudgetService {

  private static async handleResponse<T>(res: Response, fallback: string): Promise<T> {
    if (!res.ok) {
      const corpo = await res.json().catch(() => ({}));
      throw new Error(corpo.error || fallback);
    }
    return res.json() as Promise<T>;
  }

  static async listar(): Promise<ConsumoOrcamento[]> {
    const res = await fetch(API_URL, { credentials: 'include' });
    return this.handleResponse<ConsumoOrcamento[]>(res, 'Erro ao listar orçamentos');
  }

  static async definir(payload: DefinirLimitePayload): Promise<ConsumoOrcamento> {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return this.handleResponse<ConsumoOrcamento>(res, 'Erro ao definir orçamento');
  }

  static async remover(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) {
      const corpo = await res.json().catch(() => ({}));
      throw new Error(corpo.error || 'Erro ao remover orçamento');
    }
  }
}