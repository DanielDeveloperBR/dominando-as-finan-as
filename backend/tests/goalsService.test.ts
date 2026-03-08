import { describe, it, expect } from 'vitest';

// ─── Lógica pura do GoalService para teste unitário ───────────────────────────

interface GoalRow {
  valor_meta: number;
  valor_atual: number;
  prazo_meses: number | null;
  status: 'ATIVA' | 'CONCLUIDA' | 'PAUSADA';
}

function enriquecerMeta(row: GoalRow, sobraMensal: number) {
  const valorMeta = row.valor_meta;
  const valorAtual = row.valor_atual;
  const percentualConcluido = valorMeta > 0
    ? Math.min(Math.round((valorAtual / valorMeta) * 1000) / 10, 100)
    : 0;
  const valorRestante = Math.max(valorMeta - valorAtual, 0);

  let mesesEstimados: number | null = null;
  let statusProjecao: 'NO_PRAZO' | 'ATRASADO' | 'SEM_PRAZO' | 'CONCLUIDA' = 'SEM_PRAZO';

  if (row.status === 'CONCLUIDA') {
    statusProjecao = 'CONCLUIDA';
  } else if (sobraMensal > 0 && valorRestante > 0) {
    mesesEstimados = Math.ceil(valorRestante / sobraMensal);
    if (row.prazo_meses) {
      statusProjecao = mesesEstimados <= row.prazo_meses ? 'NO_PRAZO' : 'ATRASADO';
    }
  }

  return { percentualConcluido, valorRestante, mesesEstimados, statusProjecao };
}

function calcularNovoDeposito(valorAtual: number, valorMeta: number, deposito: number) {
  const novoValor = Math.min(valorAtual + deposito, valorMeta);
  const status = novoValor >= valorMeta ? 'CONCLUIDA' : 'ATIVA';
  return { novoValor, status };
}

describe('GoalService — enriquecimento de meta', () => {

  it('calcula percentual corretamente', () => {
    const { percentualConcluido } = enriquecerMeta(
      { valor_meta: 1000, valor_atual: 500, prazo_meses: null, status: 'ATIVA' },
      200
    );
    expect(percentualConcluido).toBe(50);
  });

  it('percentual 100 quando meta atingida', () => {
    const { percentualConcluido } = enriquecerMeta(
      { valor_meta: 1000, valor_atual: 1000, prazo_meses: null, status: 'CONCLUIDA' },
      0
    );
    expect(percentualConcluido).toBe(100);
  });

  it('calcula meses estimados corretamente', () => {
    // R$500 restantes, sobra R$100/mês → 5 meses
    const { mesesEstimados } = enriquecerMeta(
      { valor_meta: 1000, valor_atual: 500, prazo_meses: null, status: 'ATIVA' },
      100
    );
    expect(mesesEstimados).toBe(5);
  });

  it('statusProjecao NO_PRAZO quando meses estimados <= prazo', () => {
    const { statusProjecao } = enriquecerMeta(
      { valor_meta: 1000, valor_atual: 500, prazo_meses: 6, status: 'ATIVA' },
      100 // 5 meses estimados, prazo 6 → NO_PRAZO
    );
    expect(statusProjecao).toBe('NO_PRAZO');
  });

  it('statusProjecao ATRASADO quando meses estimados > prazo', () => {
    const { statusProjecao } = enriquecerMeta(
      { valor_meta: 1000, valor_atual: 500, prazo_meses: 3, status: 'ATIVA' },
      100 // 5 meses estimados, prazo 3 → ATRASADO
    );
    expect(statusProjecao).toBe('ATRASADO');
  });

  it('mesesEstimados null quando sobra mensal é zero', () => {
    const { mesesEstimados } = enriquecerMeta(
      { valor_meta: 1000, valor_atual: 0, prazo_meses: null, status: 'ATIVA' },
      0
    );
    expect(mesesEstimados).toBeNull();
  });

  it('statusProjecao CONCLUIDA quando status é CONCLUIDA', () => {
    const { statusProjecao } = enriquecerMeta(
      { valor_meta: 1000, valor_atual: 1000, prazo_meses: 12, status: 'CONCLUIDA' },
      500
    );
    expect(statusProjecao).toBe('CONCLUIDA');
  });
});

describe('GoalService — cálculo de depósito', () => {

  it('deposita corretamente sem atingir a meta', () => {
    const { novoValor, status } = calcularNovoDeposito(500, 1000, 200);
    expect(novoValor).toBe(700);
    expect(status).toBe('ATIVA');
  });

  it('marca como CONCLUIDA ao atingir o valor exato', () => {
    const { novoValor, status } = calcularNovoDeposito(800, 1000, 200);
    expect(novoValor).toBe(1000);
    expect(status).toBe('CONCLUIDA');
  });

  it('clamp em valor_meta — não ultrapassa o alvo', () => {
    const { novoValor, status } = calcularNovoDeposito(900, 1000, 500);
    expect(novoValor).toBe(1000);
    expect(status).toBe('CONCLUIDA');
  });
});