/**
 * financeEngine.test.ts
 * Testa a lógica pura do FinanceEngine — sem banco, sem rede.
 * Padrão: mesma estrutura dos testes existentes (budgeService, goalsService).
 */
import { EngineTransaction, FinanceEngine } from '@/engine/financeEngine';
import { describe, it, expect } from 'vitest';

// ─── Helper ───────────────────────────────────────────────────────────────────

function tx(tipo: 'RECEITA' | 'DESPESA', valor: number): EngineTransaction {
  return { tipo, valor, data: new Date() };
}

// ─── Somas básicas ────────────────────────────────────────────────────────────

describe('FinanceEngine.calculate — somas', () => {

  it('totalReceita soma apenas RECEITAs', () => {
    const r = FinanceEngine.calculate(5000, [tx('RECEITA', 1000), tx('DESPESA', 500)]);
    expect(r.totalReceita).toBe(1000);
  });

  it('totalDespesa soma apenas DESPESAs', () => {
    const r = FinanceEngine.calculate(5000, [tx('RECEITA', 1000), tx('DESPESA', 500)]);
    expect(r.totalDespesa).toBe(500);
  });

  it('saldoAtual = salario + totalReceita - totalDespesa', () => {
    const r = FinanceEngine.calculate(5000, [tx('RECEITA', 500), tx('DESPESA', 2000)]);
    expect(r.saldoAtual).toBe(3500);
  });

  it('zeros quando sem transações', () => {
    const r = FinanceEngine.calculate(5000, []);
    expect(r.totalReceita).toBe(0);
    expect(r.totalDespesa).toBe(0);
    expect(r.saldoAtual).toBe(5000);
  });
});

// ─── baseDeRenda e percentualComprometido ─────────────────────────────────────
// ESTES TESTES cobrem o bug histórico da barra "Renda comprometida"

describe('FinanceEngine.calculate — baseDeRenda (fix barra "Renda comprometida")', () => {

  it('baseDeRenda = salario + totalReceita', () => {
    const r = FinanceEngine.calculate(4000, [tx('RECEITA', 1000), tx('DESPESA', 500)]);
    expect(r.baseDeRenda).toBe(5000);
  });

  it('baseDeRenda sem receitas extras = salário apenas', () => {
    const r = FinanceEngine.calculate(3000, [tx('DESPESA', 500)]);
    expect(r.baseDeRenda).toBe(3000);
  });

  it('percentualComprometido usa baseDeRenda como denominador', () => {
    // salario=4000, receita=1000 → base=5000, despesa=2500 → 50%
    const r = FinanceEngine.calculate(4000, [tx('RECEITA', 1000), tx('DESPESA', 2500)]);
    expect(r.percentualComprometido).toBeCloseTo(0.5);
  });

  it('percentualComprometido zero quando sem despesas', () => {
    const r = FinanceEngine.calculate(5000, []);
    expect(r.percentualComprometido).toBe(0);
  });

  it('REGRESSÃO: barra não marca 100% quando receitas extras cobrem despesas', () => {
    // Cenário do bug: salario=3000, receita_extra=2000, despesa=3500
    // Bug antigo: frontend calculava 3500/3000 = 116% → clampado em 100%
    // Fix: frontend usa baseDeRenda=5000 → 3500/5000 = 70% ✓
    const r = FinanceEngine.calculate(3000, [tx('RECEITA', 2000), tx('DESPESA', 3500)]);
    expect(r.baseDeRenda).toBe(5000);
    expect(r.percentualComprometido).toBeCloseTo(0.7);
    // score não deve ser crítico mesmo com despesa maior que salário base
    expect(r.score).toBeGreaterThan(0);
  });

  it('percentualComprometido retornado é o mesmo usado no score', () => {
    // Garante consistência: barra e score usam o mesmo denominador
    const r = FinanceEngine.calculate(5000, [tx('DESPESA', 2000)]);
    const scoreEsperadoManual = Math.max(0, Math.round(100 - (r.percentualComprometido * 50)));
    // Com saldoPrevisto positivo e percentual <= 0.8, score = 100 - pct*50
    expect(r.score).toBe(scoreEsperadoManual);
  });
});

// ─── score e riskLevel ────────────────────────────────────────────────────────

describe('FinanceEngine.calculate — score', () => {

  it('score 100 quando sem despesas', () => {
    expect(FinanceEngine.calculate(5000, []).score).toBe(100);
  });

  it('score nunca negativo', () => {
    expect(FinanceEngine.calculate(100, [tx('DESPESA', 999999)]).score).toBeGreaterThanOrEqual(0);
  });

  it('score nunca acima de 100', () => {
    expect(FinanceEngine.calculate(10000, []).score).toBeLessThanOrEqual(100);
  });

  it('score é inteiro (Math.round aplicado)', () => {
    const r = FinanceEngine.calculate(5000, [tx('DESPESA', 1333)]);
    expect(Number.isInteger(r.score)).toBe(true);
  });

  it('riskLevel ESTAVEL quando score >= 80', () => {
    // despesa mínima → score alto
    const r = FinanceEngine.calculate(10000, [tx('DESPESA', 100)]);
    expect(r.riskLevel).toBe('ESTAVEL');
    expect(r.score).toBeGreaterThanOrEqual(80);
  });

  it('riskLevel ATENCAO quando score entre 60 e 79', () => {
    // base=5000, despesa=3000 → pct=60% → score = 100 - 30 = 70
    const r = FinanceEngine.calculate(5000, [tx('DESPESA', 3000)]);
    expect(r.score).toBe(70);
    expect(r.riskLevel).toBe('ATENCAO');
  });

  it('riskLevel CRITICO quando score < 40', () => {
    const r = FinanceEngine.calculate(100, [tx('DESPESA', 999999)]);
    expect(r.riskLevel).toBe('CRITICO');
  });
});

// ─── alertas ─────────────────────────────────────────────────────────────────

describe('FinanceEngine.calculate — alertas', () => {

  it('alerta de 70% emitido quando percentual > 0.7', () => {
    const r = FinanceEngine.calculate(5000, [tx('DESPESA', 4000)]); // 80%
    expect(r.alertas.some(a => a.includes('70%'))).toBe(true);
  });

  it('alerta de 90% emitido quando percentual > 0.9', () => {
    const r = FinanceEngine.calculate(5000, [tx('DESPESA', 4800)]); // 96%
    expect(r.alertas.some(a => a.includes('90%'))).toBe(true);
  });

  it('sem alertas com finanças saudáveis', () => {
    const r = FinanceEngine.calculate(10000, [tx('DESPESA', 500)]); // 5%
    expect(r.alertas).toHaveLength(0);
  });
});

// ─── segurança numérica ───────────────────────────────────────────────────────

describe('FinanceEngine.calculate — segurança numérica (Postgres retorna string)', () => {

  it('converte string para number sem concatenar', () => {
    const r = FinanceEngine.calculate(5000, [
      { tipo: 'DESPESA', valor: '100' as any, data: new Date() },
      { tipo: 'DESPESA', valor: '200' as any, data: new Date() },
    ]);
    expect(r.totalDespesa).toBe(300); // não '100200'
  });

  it('não lança com lista vazia', () => {
    expect(() => FinanceEngine.calculate(5000, [])).not.toThrow();
  });

  it('retorna todos os campos da interface EngineResult', () => {
    const r = FinanceEngine.calculate(5000, [tx('DESPESA', 1000)]);
    const campos: (keyof typeof r)[] = [
      'totalReceita', 'totalDespesa', 'saldoAtual', 'saldoPrevisto',
      'gastoMedioDiario', 'baseDeRenda', 'percentualComprometido',
      'score', 'riskLevel', 'alertas',
    ];
    campos.forEach(c => expect(r).toHaveProperty(c));
  });
});

// ─── calculateGoalProjection ─────────────────────────────────────────────────

describe('FinanceEngine.calculateGoalProjection', () => {

  it('SEM_CAPACIDADE quando sobra negativa', () => {
    // salario=1000, despesa=2000 → sobra=-1000
    const r = FinanceEngine.calculateGoalProjection(1000, 2000, 5000, 0);
    expect(r.status).toBe('SEM_CAPACIDADE');
    expect(r.mesesEstimados).toBeNull();
  });

  it('SEM_CAPACIDADE quando sobra zero', () => {
    const r = FinanceEngine.calculateGoalProjection(2000, 2000, 5000, 0);
    expect(r.status).toBe('SEM_CAPACIDADE');
  });

  it('calcula meses corretamente', () => {
    // sobra=500, restante=2500 → ceil(5)=5
    const r = FinanceEngine.calculateGoalProjection(3000, 2500, 5000, 2500);
    expect(r.mesesEstimados).toBe(5);
    expect(r.status).toBe('PROGRESSO');
  });

  it('arredonda para cima com Math.ceil', () => {
    // sobra=300, restante=500 → ceil(1.67)=2
    const r = FinanceEngine.calculateGoalProjection(800, 500, 500, 0);
    expect(r.mesesEstimados).toBe(2);
  });

  it('meta já concluída retorna 0 meses', () => {
    const r = FinanceEngine.calculateGoalProjection(3000, 1000, 1000, 1000);
    expect(r.mesesEstimados).toBe(0);
  });
});