export enum TipoTransacao {
  RECEITA = 'RECEITA',
  DESPESA = 'DESPESA'
}

export enum Categoria {
  MORADIA = 'MORADIA',
  ALIMENTACAO = 'ALIMENTACAO',
  TRANSPORTE = 'TRANSPORTE',
  LAZER = 'LAZER',
  SAUDE = 'SAUDE',
  SALARIO = 'SALARIO',
  OUTROS = 'OUTROS'
}

export interface Transacao {
  id: string;
  user_id: string;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  categoria: Categoria;
  data: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  salarioMensal: number;
  created_at?: string;
}

export interface AnaliseIA {
  sugestoes: string[];
  auditoria: string;
  projecaoInvestimento: string;
  risco: 'Baixo' | 'Médio' | 'Alto';
}
