import { GoogleGenAI, Type } from "@google/genai";
import { Transacao, AnaliseIA } from "../types";

export class AIService {
  private static ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  static async analisarFinancas(transacoes: Transacao[], salario: number): Promise<AnaliseIA> {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY não configurada no servidor.");
    }

    const dadosFinanceiros = JSON.stringify({
      salario_mensal: salario,
      historico_transacoes: transacoes.map(t => ({
        ...t,
        valor: t.tipo === 'DESPESA' ? -t.valor : t.valor
      }))
    });

    const prompt = `
      Atue como um Consultor Financeiro Sênior e Auditor. Analise os seguintes dados financeiros brutos.
      Identifique padrões de gastos, desperdícios, e sugira otimizações agressivas para retorno financeiro.
      Calcule potenciais de investimento se o usuário seguir as dicas.
      
      Dados: ${dadosFinanceiros}
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
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

      if (response.text) {
        return JSON.parse(response.text) as AnaliseIA;
      }

      throw new Error("Resposta da IA vazia.");
    } catch (error) {
      console.error("Erro no AIService:", error);
      throw error;
    }
  }
}
