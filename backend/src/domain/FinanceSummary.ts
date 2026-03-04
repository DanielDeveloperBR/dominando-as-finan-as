export type RiskLevel = 'ESTAVEL' | 'ATENCAO' | 'RISCO' | 'CRITICO';

export interface FinanceSummary {
  totalReceita: number;
  totalDespesa: number;
  saldoAtual: number;
  saldoPrevisto: number;
  gastoMedioDiario: number;
  score: number;
  riskLevel: RiskLevel;
  alertas: string[];
}