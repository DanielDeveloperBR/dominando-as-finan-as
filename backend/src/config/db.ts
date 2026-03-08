import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  password: process.env.PGPASSWORD,
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export const initDb = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        salario_mensal DECIMAL(12, 2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS analise_cache (
        hash TEXT PRIMARY KEY,
        resultado TEXT,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Tabela de Transações
    await query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        descricao VARCHAR(255) NOT NULL,
        valor DECIMAL(12, 2) NOT NULL,
        tipo VARCHAR(20) NOT NULL, -- 'RECEITA' ou 'DESPESA'
        categoria VARCHAR(50) NOT NULL,
        data TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
        idempotency_key VARCHAR(255) NULL
      );
    `);

    // Tabela de Sessões (exigida pelo connect-pg-simple)
    await query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      ) WITH (OIDS=FALSE);
        CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS monthly_summary (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        mes INT NOT NULL,
        ano INT NOT NULL,
        total_receita DECIMAL(12,2) DEFAULT 0,
        total_despesa DECIMAL(12,2) DEFAULT 0,
        saldo_previsto DECIMAL(12,2) DEFAULT 0,
        score_financeiro INT DEFAULT 100,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, mes, ano)
      );
    `)

    await query(`
      CREATE TABLE IF NOT EXISTS groups (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
         nome VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await query(`
      CREATE TABLE IF NOT EXISTS group_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) DEFAULT 'MEMBRO',
        UNIQUE(group_id, user_id)
      );
    `)

    await query(`
      CREATE TABLE IF NOT EXISTS monthly_scores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        ano INT NOT NULL,
        mes INT NOT NULL,
        score INT NOT NULL,
        saldo_previsto DECIMAL(12,2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, ano, mes)
      );
    `);

    // Limites de orçamento por categoria — um registro por categoria/mês/ano
    await query(`
      CREATE TABLE IF NOT EXISTS budget_limits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        categoria VARCHAR(50) NOT NULL,
        limite_mensal DECIMAL(12, 2) NOT NULL CHECK (limite_mensal > 0),
        mes INT NOT NULL CHECK (mes BETWEEN 1 AND 12),
        ano INT NOT NULL CHECK (ano >= 2020),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, categoria, mes, ano)
      );
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_budget_user_periodo
      ON budget_limits(user_id, mes, ano);
    `);

    // Metas de poupança — tabela já declarada mas garantindo estrutura completa
    await query(`
      CREATE TABLE IF NOT EXISTS goals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        titulo VARCHAR(255) NOT NULL,
        descricao VARCHAR(500),
        valor_meta DECIMAL(12,2) NOT NULL CHECK (valor_meta > 0),
        valor_atual DECIMAL(12,2) DEFAULT 0 CHECK (valor_atual >= 0),
        prazo_meses INT CHECK (prazo_meses > 0),
        status VARCHAR(20) DEFAULT 'ATIVA' CHECK (status IN ('ATIVA', 'CONCLUIDA', 'PAUSADA')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_goals_user
      ON goals(user_id, status);
    `);

    console.log('Banco de dados inicializado com sucesso.');
  } catch (err) {
    console.error('Erro ao inicializar banco de dados:', err);
    throw err;
  }
};

export default pool;