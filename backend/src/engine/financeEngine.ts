export type RiskLevel = 'ESTAVEL' | 'ATENCAO' | 'RISCO' | 'CRITICO';

export interface EngineTransaction {
  valor: number;
  tipo: 'RECEITA' | 'DESPESA';
  data: Date;
}

export interface EngineResult {
  totalReceita: number;
  totalDespesa: number;
  saldoAtual: number;
  saldoPrevisto: number;
  gastoMedioDiario: number;
  /** Base real de renda: salario + totalReceita (receitas extras incluídas).
   *  Usado como denominador da barra "Renda comprometida" no frontend.
   *  Exposto aqui para garantir que frontend e engine usem exatamente o mesmo valor. */
  baseDeRenda: number;
  /** Percentual de comprometimento calculado sobre baseDeRenda (0 a 1). */
  percentualComprometido: number;
  score: number;
  riskLevel: RiskLevel;
  alertas: string[];
}

export class FinanceEngine {

  static calculate(salarioMensal: number, transacoes: EngineTransaction[]): EngineResult {

    const now = new Date();
    const diasNoMes = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const diaAtual = now.getDate();

    const totalReceita = transacoes
      .filter(t => t.tipo === 'RECEITA')
      .reduce((acc, t) => acc + Number(t.valor), 0);

    const totalDespesa = transacoes
      .filter(t => t.tipo === 'DESPESA')
      .reduce((acc, t) => acc + Number(t.valor), 0);

    const saldoAtual = salarioMensal + totalReceita - totalDespesa;

    const gastoMedioDiario = diaAtual > 0 ? totalDespesa / diaAtual : 0;

    const saldoPrevisto = salarioMensal + totalReceita - (gastoMedioDiario * diasNoMes);

    // Base de cálculo inclui receitas extras além do salário fixo,
    // evitando score injusto quando o usuário tem renda variável complementar.
    // IMPORTANTE: este valor é retornado no payload para que o frontend
    // use EXATAMENTE o mesmo denominador — corrige barra "Renda comprometida".
    const baseDeRenda = salarioMensal + totalReceita;
    const percentualComprometido = baseDeRenda > 0 ? totalDespesa / baseDeRenda : 0;

    let score = 100;
    score -= percentualComprometido * 50;
    if (saldoPrevisto < 0) score -= 20;
    if (percentualComprometido > 0.8) score -= 20;

    score = Math.max(0, Math.round(score));

    let riskLevel: RiskLevel = 'ESTAVEL';
    if (score < 40) riskLevel = 'CRITICO';
    else if (score < 60) riskLevel = 'RISCO';
    else if (score < 80) riskLevel = 'ATENCAO';

    const alertas: string[] = [];

    if (saldoPrevisto < 0)
      alertas.push('Seu saldo ficará negativo antes do fim do mês.');

    if (percentualComprometido > 0.7)
      alertas.push('Você já comprometeu mais de 70% da sua renda total.');

    if (percentualComprometido > 0.9)
      alertas.push('Comprometimento crítico: mais de 90% da renda comprometida.');

    return {
      totalReceita,
      totalDespesa,
      saldoAtual,
      saldoPrevisto,
      gastoMedioDiario,
      baseDeRenda,
      percentualComprometido,
      score,
      riskLevel,
      alertas,
    };
  }

  static calculateGoalProjection(
    salarioMensal: number,
    totalDespesa: number,
    valorMeta: number,
    valorAtual: number
  ) {
    const sobraMensal = salarioMensal - totalDespesa;

    if (sobraMensal <= 0) {
      return { mesesEstimados: null, status: 'SEM_CAPACIDADE' };
    }

    const restante = valorMeta - valorAtual;

    if (restante <= 0) {
      return { mesesEstimados: 0, status: 'PROGRESSO' };
    }

    const meses = Math.ceil(restante / sobraMensal);

    return { mesesEstimados: meses, status: 'PROGRESSO' };
  }
}