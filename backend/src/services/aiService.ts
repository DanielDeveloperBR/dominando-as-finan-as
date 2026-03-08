import { GoogleGenAI, Type } from "@google/genai";
import { Transacao, AnaliseIA } from "../types";

import crypto from "crypto";
import db from "@/config/db";

// Refatorar
function gerarHash(dados: any) {
  return crypto.createHash("sha256").update(JSON.stringify(dados)).digest("hex");
}

function gerarResumoFinanceiro(transacoes: any[], salario: number) {

  let totalReceita = 0;
  let totalDespesa = 0;
  const categorias: Record<string, number> = {};

  for (const t of transacoes) {

    if (t.tipo === "RECEITA") {
      totalReceita += Number(t.valor);
    } else {
      totalDespesa += Number(t.valor);
    }

    if (!categorias[t.categoria]) {
      categorias[t.categoria] = 0;
    }

    categorias[t.categoria] += Number(t.valor);
  }

  const saldo = totalReceita - totalDespesa;

  const maiorGasto = Object.entries(categorias)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  const percentualPoupanca =
    salario > 0 ? ((saldo / salario) * 100).toFixed(1) : 0;

  return {
    salario,
    totalReceita,
    totalDespesa,
    saldo,
    categorias,
    maiorGasto,
    percentualPoupanca
  };
}

export class AIService {
  private static ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  static async analisarFinancas(transacoes: Transacao[], salario: number): Promise<AnaliseIA> {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Chave de api não configurada.");
    }

    const ultimasTransacoes = transacoes.slice(-30).map(t => [
      t.tipo === 'DESPESA' ? 'D' : 'R',
      t.tipo === 'DESPESA' ? -t.valor : t.valor,
      t.categoria
    ]);


    const resumoBase = gerarResumoFinanceiro(transacoes, salario);

    const resumo = {
      s: resumoBase.salario,
      sd: resumoBase.saldo,
      tp: resumoBase.percentualPoupanca,
      mg: resumoBase.maiorGasto,
      r: resumoBase.saldo < 0 ? "ALTO" : "BAIXO",
      c: Object.entries(resumoBase.categorias)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
    };
    const hash = gerarHash(resumo);


    const result = await db.query("SELECT resultado FROM analise_cache WHERE hash = $1", [hash])

    if (result.rows.length > 0) {
      return JSON.parse(result.rows[0].resultado);
    }


    const prompt = `Analise a saúde financeira do usuário.
      Dados resumidos: ${JSON.stringify(resumo)}

      Retorne:
      - auditoria
      - sugestões práticas
      - projeção de investimento
      - risco financeiro
     `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          topK: 1,
          topP: 0.8,
          temperature: 0.1,
          maxOutputTokens: 290,
          thinkingConfig: {
            includeThoughts: false,
            thinkingBudget: 0,
          },

          systemInstruction: "Você é um especialista em finanças pessoais focado em acumulação de riqueza e eficiência. Seja direto e analítico.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sugestoes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Lista de 3 a 5 ações práticas para economizar ou investir."
              },
              auditoria: {
                type: Type.STRING,
                description: "Um resumo crítico sobre o comportamento financeiro atual."
              },
              projecaoInvestimento: {
                type: Type.STRING,
                description: "Projeção de quanto o usuário teria em 1 ano se aplicasse as economias sugeridas."
              },
              risco: {
                type: Type.STRING,
                enum: ["Baixo", "Médio", "Alto"],
                description: "Nível de risco da saúde financeira atual."
              }
            },
            required: ["sugestoes", "auditoria", "projecaoInvestimento", "risco"]
          }
        }
      });

      if (!response.text) {
        throw new Error("Resposta da IA vazia.");
      }

      const resultadoIa = JSON.parse(response.text) as AnaliseIA;
      await db.query(`INSERT INTO analise_cache (hash, resultado) VALUES ($1, $2) ON CONFLICT (hash) DO NOTHING`, [hash, response.text]);
      return resultadoIa;

    } catch (error) {
      console.error("Erro no AIService:", error);
      throw error;
    }
  }
}