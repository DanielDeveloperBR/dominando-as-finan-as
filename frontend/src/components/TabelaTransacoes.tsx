import React from 'react';
import { Trash2, Filter } from 'lucide-react';
import { Transacao, TipoTransacao, Categoria } from '../types';

interface TabelaTransacoesProps {
  transacoes: Transacao[];
  filtroCategoria: string;
  onFiltroChange: (categoria: string) => void;
  onRemover: (id: string) => void;
}

export const TabelaTransacoes: React.FC<TabelaTransacoesProps> = ({ 
  transacoes, 
  filtroCategoria, 
  onFiltroChange, 
  onRemover 
}) => {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
      <div className="p-6 border-b border-slate-800 flex flex-wrap gap-4 justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Histórico de Transações</h3>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 p-2"
            value={filtroCategoria}
            onChange={(e) => onFiltroChange(e.target.value)}
          >
            <option value="TODAS">Todas Categorias</option>
            {Object.values(Categoria).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-400">
          <thead className="text-xs text-slate-400 uppercase bg-slate-950/50">
            <tr>
              <th scope="col" className="px-6 py-3">Descrição</th>
              <th scope="col" className="px-6 py-3">Categoria</th>
              <th scope="col" className="px-6 py-3">Data</th>
              <th scope="col" className="px-6 py-3">Valor</th>
              <th scope="col" className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {transacoes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  Nenhuma transação encontrada.
                </td>
              </tr>
            ) : (
              transacoes.map((transacao) => (
                <tr key={transacao.id} className="bg-slate-900 border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{transacao.descricao}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-800 text-slate-300 text-xs font-medium px-2.5 py-0.5 rounded border border-slate-700">
                      {transacao.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4">{new Date(transacao.data).toLocaleDateString()}</td>
                  <td className={`px-6 py-4 font-bold ${
                    transacao.tipo === TipoTransacao.RECEITA ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {transacao.tipo === TipoTransacao.DESPESA ? '-' : '+'} 
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transacao.valor)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onRemover(transacao.id)}
                      className="text-slate-500 hover:text-rose-500 transition-colors p-1"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
