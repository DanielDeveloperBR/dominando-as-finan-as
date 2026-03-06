export type RiskLevel = 'ESTAVEL' | 'ATENCAO' | 'RISCO' | 'CRITICO';

interface Transaction {
  valor: number;
  tipo: 'RECEITA' | 'DESPESA';
  data: Date;
}

export class FinanceEngine {

  static calculate(salarioMensal: number, transacoes: Transaction[]) {

    const now = new Date();
    const diasNoMes = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const diaAtual = now.getDate();

    const totalReceita = transacoes.filter(t => t.tipo === 'RECEITA').reduce((acc, t) => acc + Number(t.valor), 0);

    const totalDespesa = transacoes.filter(t => t.tipo === 'DESPESA').reduce((acc, t) => acc + Number(t.valor), 0);

    const saldoAtual = salarioMensal + totalReceita - totalDespesa;

    const gastoMedioDiario = diaAtual > 0 ? totalDespesa / diaAtual : 0;

    const saldoPrevisto = salarioMensal + totalReceita - (gastoMedioDiario * diasNoMes);

    const percentualComprometido = salarioMensal > 0 ? totalDespesa / salarioMensal : 0;

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
      alertas.push('Você já comprometeu mais de 70% do salário.');

    if (percentualComprometido > 0.9)
      alertas.push('Comprometimento crítico.');

    return {
      totalReceita,
      totalDespesa,
      saldoAtual,
      saldoPrevisto,
      gastoMedioDiario,
      score,
      riskLevel,
      alertas
    };
  }

  static calculateGoalProjection(salarioMensal: number, totalDespesa: number, valorMeta: number, valorAtual: number) {

    const sobraMensal = salarioMensal - totalDespesa;

    if (sobraMensal <= 0) {
      return {mesesEstimados: null, status: 'SEM_CAPACIDADE'}
    }

    const restante = valorMeta - valorAtual;

    const meses = Math.ceil(restante / sobraMensal);

    return {mesesEstimados: meses, status: 'PROGRESSO'}
  }
}