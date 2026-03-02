import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Botao } from './Botao';
import { Input } from './Input';
import { TipoTransacao, Categoria, Transacao } from '../types';

interface FormularioTransacaoProps {
  onAdicionar: (transacao: Omit<Transacao, 'id'>) => void;
}

export const FormularioTransacao: React.FC<FormularioTransacaoProps> = ({ onAdicionar }) => {
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<TipoTransacao>(TipoTransacao.DESPESA);
  const [categoria, setCategoria] = useState<Categoria>(Categoria.ALIMENTACAO);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valor || !descricao) return;

    onAdicionar({
      valor: parseFloat(valor),
      descricao,
      tipo,
      categoria,
      data: new Date().toISOString()
    });

    setValor('');
    setDescricao('');
  };

  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 h-fit">
      <h3 className="text-lg font-semibold text-white mb-4">Nova Transação</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="Descrição" 
          value={descricao} 
          onChange={e => setDescricao(e.target.value)} 
          placeholder="Ex: Mercado, Uber..."
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Valor (R$)" 
            type="number" 
            value={valor} 
            onChange={e => setValor(e.target.value)} 
            placeholder="0.00"
            step="0.01"
            required
            min="0.01"
          />
          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium text-slate-300">Tipo</label>
            <select 
              className="bg-slate-950 border border-slate-800 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoTransacao)}
            >
              <option value={TipoTransacao.DESPESA}>Despesa</option>
              <option value={TipoTransacao.RECEITA}>Receita</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm font-medium text-slate-300">Categoria</label>
          <select 
            className="bg-slate-950 border border-slate-800 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as Categoria)}
          >
            {Object.values(Categoria).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <Botao type="submit" className="w-full mt-2">
          <Plus className="w-4 h-4 mr-1" /> Adicionar
        </Botao>
      </form>
    </div>
  );
};
