import { describe, it, expect } from 'vitest';
import { FinanceiroService } from '../services/financeiroService';
import { Transacao, TipoTransacao, Categoria } from '../types';

describe('FinanceiroService', () => {
  const transacoesMock: Transacao[] = [
    {
      id: '1',
      descricao: 'Salário',
      valor: 5000,
      tipo: TipoTransacao.RECEITA,
      categoria: Categoria.SALARIO,
      data: new Date().toISOString()
    },
    {
      id: '2',
      descricao: 'Aluguel',
      valor: 1500,
      tipo: TipoTransacao.DESPESA,
      categoria: Categoria.MORADIA,
      data: new Date().toISOString()
    },
    {
      id: '3',
      descricao: 'Mercado',
      valor: 500,
      tipo: TipoTransacao.DESPESA,
      categoria: Categoria.ALIMENTACAO,
      data: new Date().toISOString()
    }
  ];

  it('deve calcular o resumo corretamente', () => {
    const resumo = FinanceiroService.calcularResumo(transacoesMock);
    expect(resumo.receitaTotal).toBe(5000);
    expect(resumo.despesaTotal).toBe(2000);
    expect(resumo.saldoTotal).toBe(3000);
  });

  it('deve agrupar por categoria corretamente', () => {
    const agrupado = FinanceiroService.agruparPorCategoria(transacoesMock);
    expect(agrupado[Categoria.MORADIA]).toBe(1500);
    expect(agrupado[Categoria.ALIMENTACAO]).toBe(500);
    expect(agrupado[Categoria.SALARIO]).toBeUndefined(); // Receita não deve estar no agrupamento de despesas
  });
});
