import { describe, it, expect } from 'vitest';

// ─── Lógica pura extraída do BudgetService para teste unitário ────────────────
// Evita mockar o banco — testa apenas os cálculos derivados.

interface RowBudget {
  gasto_atual: number;
  limite_mensal: number;
  dia_atual: number;
  dias_no_mes: number;
}

function calcularConsumo(row: RowBudget) {
  const { gasto_atual, limite_mensal, dia_atual, dias_no_mes } = row;
  const percentual = limite_mensal > 0
    ? Math.min((gasto_atual / limite_mensal) * 100, 100)
    : 0;
  const valor_restante = Math.max(limite_mensal - gasto_atual, 0);
  const gastoDiario = dia_atual > 0 ? gasto_atual / dia_atual : 0;
  const ritmo_projetado = gastoDiario * dias_no_mes;
  const vai_estourar = ritmo_projetado > limite_mensal;

  return { percentual, valor_restante, ritmo_projetado, vai_estourar };
}

describe('BudgetService — cálculos de consumo', () => {

  it('calcula percentual corretamente', () => {
    const r = calcularConsumo({ gasto_atual: 250, limite_mensal: 500, dia_atual: 10, dias_no_mes: 30 });
    expect(r.percentual).toBe(50);
  });

  it('clamp percentual em 100 quando gasto excede limite', () => {
    const r = calcularConsumo({ gasto_atual: 700, limite_mensal: 500, dia_atual: 15, dias_no_mes: 30 });
    expect(r.percentual).toBe(100);
  });

  it('valor_restante nunca negativo', () => {
    const r = calcularConsumo({ gasto_atual: 600, limite_mensal: 500, dia_atual: 10, dias_no_mes: 30 });
    expect(r.valor_restante).toBe(0);
  });

  it('detecta que vai estourar no ritmo atual', () => {
    // R$300 gastos em 10 dias = R$30/dia → projetado R$900 > limite R$500
    const r = calcularConsumo({ gasto_atual: 300, limite_mensal: 500, dia_atual: 10, dias_no_mes: 30 });
    expect(r.vai_estourar).toBe(true);
    expect(r.ritmo_projetado).toBe(900);
  });

  it('não alerta se ritmo está dentro do limite', () => {
    // R$100 em 10 dias = R$10/dia → projetado R$300 < limite R$500
    const r = calcularConsumo({ gasto_atual: 100, limite_mensal: 500, dia_atual: 10, dias_no_mes: 30 });
    expect(r.vai_estourar).toBe(false);
  });

  it('ritmo_projetado zerado se dia_atual é 0', () => {
    const r = calcularConsumo({ gasto_atual: 0, limite_mensal: 500, dia_atual: 0, dias_no_mes: 30 });
    expect(r.ritmo_projetado).toBe(0);
    expect(r.vai_estourar).toBe(false);
  });
});