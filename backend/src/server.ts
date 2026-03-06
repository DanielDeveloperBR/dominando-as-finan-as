import express from "express";
import cors from "cors";
import session from "express-session";
import connectPg from "connect-pg-simple";
import dotenv from "dotenv";
import { initDb } from "./config/db";
import pool from "./config/db";
import authRoutes from "./routes/authRoutes";
import financeiroRoutes from "./routes/financeiroRoutes";
import rateLimit from 'express-rate-limit';
import groupRoutes from "./routes/groupRoutes";

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20
});

dotenv.config();

const PgSession = connectPg(session);

async function startServer() {
  const app = express();
  const PORT = 3001;

  // Inicializar Banco de Dados
  await initDb();

  app.use(cors({
    origin: true, // Em produção, especifique o domínio
    credentials: true
  }));

  app.use(express.json());
  // Configuração de Sessão
  app.use(session({
    store: new PgSession({
      pool: pool,
      tableName: 'session'
    }),
    secret: process.env.SESSION_SECRET || 'fallback_secret_para_desenvolvimento',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }
  }));
  
  app.use("/api/auth", authRoutes);
  app.use('/finance/analisar', limiter);
  app.use("/api/financeiro", financeiroRoutes);
  app.use('/api/groups', groupRoutes)

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.listen(PORT, () => {
    console.log(`Backend server running on http://::${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Erro ao iniciar servidor backend:", err);
});
