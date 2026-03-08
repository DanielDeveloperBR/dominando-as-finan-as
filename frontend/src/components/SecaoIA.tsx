import React from 'react';
import { BrainCircuit } from 'lucide-react';
import { Botao } from './Botao';
import { AnaliseIA } from '../types';

interface SecaoIAProps {
  analise: AnaliseIA | null;
  carregando: boolean;
  onGerar: () => void;
}

export const SecaoIA: React.FC<SecaoIAProps> = ({ analise, carregando, onGerar }) => {
  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <BrainCircuit className="w-64 h-64 text-emerald-400" />
      </div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <BrainCircuit className="text-emerald-400" /> Consultor IA
            </h2>
            <p className="text-slate-400 max-w-xl mt-1">
              Nossa IA analisa cada centavo gasto para encontrar oportunidades de investimento e cortes inteligentes.
            </p>
          </div>
          <Botao onClick={onGerar} carregando={carregando} variante="primario">
            Gerar Auditoria Avançada
          </Botao>
        </div>

        {analise && (
          <div className="mt-6 bg-slate-950/80 backdrop-blur rounded-xl p-6 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <div>
              <h3 className="text-emerald-400 font-semibold mb-2">💡 Sugestões de Otimização</h3>
              <ul className="space-y-2">
                {analise.sugestoes.map((sugestao, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-300 text-sm">
                    <span className="text-emerald-500 mt-1">•</span> {sugestao}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-blue-400 font-semibold mb-1">📊 Auditoria Rápida</h3>
                <p className="text-slate-300 text-sm">{analise.auditoria}</p>
              </div>
              <div className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800 gap-3">
                <span className="text-slate-400 text-sm">Projeção 1 Ano:</span>
                <span className="text-emerald-400 font-bold">{analise.projecaoInvestimento}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-sm">Risco Atual:</span>
                <span className={`font-bold ${
                  analise.risco === 'Alto' ? 'text-rose-500' : 
                  analise.risco === 'Médio' ? 'text-yellow-500' : 'text-emerald-500'
                }`}>{analise.risco}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
