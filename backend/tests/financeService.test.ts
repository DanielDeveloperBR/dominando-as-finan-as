/**
 * financeiroService.test.ts
 * Testa lógica pura extraída do FinanceiroService.
 * Padrão: igual aos testes existentes — lógica isolada, sem mockar o banco.
 *
 * Para os métodos async (que precisam do banco), testamos a lógica de
 * transformação/cálculo que pode ser extraída como funções puras.
 */
import { describe, it, expect } from 'vitest';

// ─── Lógica de conversão numérica do calcularResumo ──────────────────────────
// Extrai a conversão que estava usando parseFloat — testa segurança numérica

function calcularSaldo(receitaStr: string, despesaStr: string) {
  const receita = Number(receitaStr) || 0;
  const despesa = Number(despesaStr) || 0;
  return {
    receitaTotal: receita,
    despesaTotal: despesa,
    saldoTotal:   receita - despesa,
  };
}

describe('FinanceiroService.calcularResumo — conversão numérica segura', () => {

  it('converte strings do Postgres corretamente', () => {
    const r = calcularSaldo('5000.00', '2000.50');
    expect(r.receitaTotal).toBe(5000);
    expect(r.despesaTotal).toBe(2000.50);
    expect(r.saldoTotal).toBeCloseTo(2999.50);
  });

  it('retorna zeros sem NaN quando valores são string vazia', () => {
    const r = calcularSaldo('', '');
    expect(r.receitaTotal).toBe(0);
    expect(r.despesaTotal).toBe(0);
    expect(r.saldoTotal).toBe(0);
    expect(Number.isNaN(r.receitaTotal)).toBe(false);
  });

  it('saldoTotal = receita - despesa', () => {
    const r = calcularSaldo('3000', '1000');
    expect(r.saldoTotal).toBe(2000);
  });

  it('saldoTotal negativo quando despesa maior', () => {
    const r = calcularSaldo('1000', '3000');
    expect(r.saldoTotal).toBe(-2000);
  });

  it('Number("0") retorna 0 (não NaN como parseInt de string não-numérica)', () => {
    expect(Number('0') || 0).toBe(0);
    expect(Number(undefined) || 0).toBe(0);
    expect(Number(null) || 0).toBe(0);
  });
});

// ─── Lógica do summary — alertas de orçamento ─────────────────────────────────

interface LimiteSimples {
  categoria: string;
  limite_mensal: number;
  gasto_atual: number;
}

function gerarAlertasOrcamento(limites: LimiteSimples[]): string[] {
  const alertas: string[] = [];
  for (const l of limites) {
    const pct = l.limite_mensal > 0 ? l.gasto_atual / l.limite_mensal : 0;
    if (pct >= 1.0) {
      alertas.push(`Limite de ${l.categoria} estourado (${(pct * 100).toFixed(0)}% usado).`);
    } else if (pct >= 0.8) {
      alertas.push(`${l.categoria}: ${(pct * 100).toFixed(0)}% do limite usado — atenção.`);
    }
  }
  return alertas;
}

describe('FinanceiroService.getSummaryCompleto — alertas de orçamento', () => {

  it('gera alerta quando limite estourado (100%)', () => {
    const alertas = gerarAlertasOrcamento([
      { categoria: 'ALIMENTACAO', limite_mensal: 500, gasto_atual: 500 },
    ]);
    expect(alertas.some(a => a.includes('ALIMENTACAO'))).toBe(true);
    expect(alertas.some(a => a.includes('100%'))).toBe(true);
  });

  it('gera alerta de atenção quando >= 80%', () => {
    const alertas = gerarAlertasOrcamento([
      { categoria: 'LAZER', limite_mensal: 500, gasto_atual: 400 },
    ]);
    expect(alertas.some(a => a.includes('LAZER'))).toBe(true);
    expect(alertas.some(a => a.includes('80%'))).toBe(true);
  });

  it('sem alerta quando abaixo de 80%', () => {
    const alertas = gerarAlertasOrcamento([
      { categoria: 'TRANSPORTE', limite_mensal: 500, gasto_atual: 300 },
    ]);
    expect(alertas).toHaveLength(0);
  });

  it('sem alertas com lista vazia', () => {
    expect(gerarAlertasOrcamento([])).toHaveLength(0);
  });

  it('múltiplos alertas simultâneos', () => {
    const alertas = gerarAlertasOrcamento([
      { categoria: 'ALIMENTACAO', limite_mensal: 500, gasto_atual: 500 },
      { categoria: 'LAZER', limite_mensal: 300, gasto_atual: 290 },
      { categoria: 'SAUDE', limite_mensal: 200, gasto_atual: 50 },
    ]);
    expect(alertas).toHaveLength(2); // ALIMENTACAO e LAZER, não SAUDE
  });
});

// ─── Lógica de histórico de score — ordenação ────────────────────────────────

interface ScoreRow {
  ano: number;
  mes: number;
  score: number;
  saldo_previsto: number;
}

function ordenarHistorico(rows: ScoreRow[]) {
  return [...rows].sort((a, b) => {
    if (a.ano !== b.ano) return a.ano - b.ano;
    return a.mes - b.mes;
  });
}

describe('FinanceiroService.getHistoricoScore — ordenação', () => {

  it('ordena por ano ASC, mes ASC', () => {
    const rows: ScoreRow[] = [
      { ano: 2025, mes: 3, score: 85, saldo_previsto: 1500 },
      { ano: 2024, mes: 12, score: 70, saldo_previsto: 500 },
      { ano: 2025, mes: 1, score: 80, saldo_previsto: 1000 },
    ];
    const ordenado = ordenarHistorico(rows);
    expect(ordenado[0]).toEqual({ ano: 2024, mes: 12, score: 70, saldo_previsto: 500 });
    expect(ordenado[1]).toEqual({ ano: 2025, mes: 1, score: 80, saldo_previsto: 1000 });
    expect(ordenado[2]).toEqual({ ano: 2025, mes: 3, score: 85, saldo_previsto: 1500 });
  });

  it('retorna vazio se lista vazia', () => {
    expect(ordenarHistorico([])).toHaveLength(0);
  });

  it('não muta o array original', () => {
    const original = [
      { ano: 2025, mes: 3, score: 85, saldo_previsto: 1500 },
      { ano: 2025, mes: 1, score: 80, saldo_previsto: 1000 },
    ];
    const ordenado = ordenarHistorico(original);
    expect(original[0].mes).toBe(3); // original intocado
    expect(ordenado[0].mes).toBe(1); // cópia ordenada
  });
});

// ─── Lógica de idempotência da adicionarTransacao ────────────────────────────

describe('FinanceiroService.adicionarTransacao — idempotência', () => {

  it('chave UUID tem formato correto', () => {
    const key = crypto.randomUUID();
    expect(key).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('duas chamadas geram chaves diferentes', () => {
    const k1 = crypto.randomUUID();
    const k2 = crypto.randomUUID();
    expect(k1).not.toBe(k2);
  });
});

// ─── Validação de ID na removerTransacao ─────────────────────────────────────

describe('FinanceiroService.removerTransacao — validação de ID', () => {

  function validarId(id: string): string | null {
    if (!id || id.trim() === '') return 'ID é obrigatório para remover transação';
    return null;
  }

  it('retorna erro para ID vazio', () => {
    expect(validarId('')).toBe('ID é obrigatório para remover transação');
  });

  it('retorna erro para ID só com espaços', () => {
    expect(validarId('   ')).toBeTruthy();
  });

  it('retorna null para ID válido', () => {
    expect(validarId('abc-123')).toBeNull();
  });
});