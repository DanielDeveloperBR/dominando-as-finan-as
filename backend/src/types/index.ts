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

export interface Grupo {
  id: string;
  nome: string;
}

// Retornado por /meus-grupos — inclui o role do usuário logado naquele grupo
export interface GrupoComRole extends Grupo {
  role: 'OWNER' | 'MEMBER';
}

export interface MembroGrupo {
  id: string;
  nome: string;
  email: string;
  role: 'OWNER' | 'MEMBER';
}

export interface UsuarioBusca {
  id: string;
  nome: string;
}