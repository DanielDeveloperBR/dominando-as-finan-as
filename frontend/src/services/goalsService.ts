const API_URL = '/api/goals';

export interface Meta {
  id: string;
  titulo: string;
  descricao: string | null;
  valor_meta: number;
  valor_atual: number;
  prazo_meses: number | null;
  status: 'ATIVA' | 'CONCLUIDA' | 'PAUSADA';
  created_at: string;
  percentual_concluido: number;
  valor_restante: number;
  meses_estimados: number | null;
  status_projecao: 'NO_PRAZO' | 'ATRASADO' | 'SEM_PRAZO' | 'CONCLUIDA';
}

export interface CriarMetaPayload {
  titulo: string;
  valor_meta: number;
  descricao?: string;
  prazo_meses?: number;
}

export class GoalService {

  private static async handleResponse<T>(res: Response, fallback: string): Promise<T> {
    if (!res.ok) {
      const corpo = await res.json().catch(() => ({}));
      throw new Error(corpo.error || fallback);
    }
    return res.json() as Promise<T>;
  }

  static async listar(): Promise<Meta[]> {
    const res = await fetch(API_URL, { credentials: 'include' });
    return this.handleResponse<Meta[]>(res, 'Erro ao listar metas');
  }

  static async criar(payload: CriarMetaPayload): Promise<Meta> {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return this.handleResponse<Meta>(res, 'Erro ao criar meta');
  }

  static async depositar(id: string, valor: number): Promise<Meta> {
    const res = await fetch(`${API_URL}/${id}/depositar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ valor }),
    });
    return this.handleResponse<Meta>(res, 'Erro ao depositar na meta');
  }

  static async excluir(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) {
      const corpo = await res.json().catch(() => ({}));
      throw new Error(corpo.error || 'Erro ao excluir meta');
    }
  }
}