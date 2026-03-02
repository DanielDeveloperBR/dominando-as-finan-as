import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CartaoResumoProps {
  titulo: string;
  valor: number;
  icone: LucideIcon;
  tipo: 'neutro' | 'sucesso' | 'perigo' | 'info';
}

export const CartaoResumo: React.FC<CartaoResumoProps> = ({ titulo, valor, icone: Icone, tipo }) => {
  const cores = {
    neutro: "text-slate-100",
    sucesso: "text-emerald-400",
    perigo: "text-rose-400",
    info: "text-blue-400"
  };

  const bgIcone = {
    neutro: "bg-slate-500/10",
    sucesso: "bg-emerald-500/10",
    perigo: "bg-rose-500/10",
    info: "bg-blue-500/10"
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-400">{titulo}</p>
        <h3 className={`text-2xl font-bold mt-1 ${cores[tipo]}`}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)}
        </h3>
      </div>
      <div className={`p-3 rounded-full ${bgIcone[tipo]}`}>
        <Icone className={`w-6 h-6 ${cores[tipo]}`} />
      </div>
    </div>
  );
};