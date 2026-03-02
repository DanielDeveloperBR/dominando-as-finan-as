import React from 'react';
import { usePainel } from '../hooks/usePainel';
import { Botao } from '../components/Botao';
import { CartaoResumo } from '../components/CartaoResumo';
import { SecaoIA } from '../components/SecaoIA';
import { FormularioTransacao } from '../components/FormularioTransacao';
import { TabelaTransacoes } from '../components/TabelaTransacoes';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as TooltipRecharts 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, LogOut 
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    usuario, logout, transacoesFiltradas, adicionarTransacao, removerTransacao,
    saldoTotal, receitaTotal, despesaTotal, filtroCategoria, setFiltroCategoria,
    analiseIA, carregandoIA, gerarAnaliseIA, dadosGraficoPizza, carregando
  } = usePainel();

  const CORES_GRAFICO = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (carregando) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-emerald-500 animate-pulse font-bold">Carregando seus dados...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Olá, {usuario?.nome}</h1>
              <p className="text-xs text-slate-400">Salário Base: R$ {usuario?.salarioMensal.toFixed(2)}</p>
            </div>
          </div>
          <Botao variante="fantasma" onClick={logout} className="text-sm text-slate-400 hover:text-white">
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Botao>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CartaoResumo 
            titulo="Saldo Atual" 
            valor={saldoTotal} 
            tipo={saldoTotal >= 0 ? "sucesso" : "perigo"} 
            icone={DollarSign} 
          />
          <CartaoResumo 
            titulo="Receitas Totais" 
            valor={receitaTotal} 
            tipo="info" 
            icone={TrendingUp} 
          />
          <CartaoResumo 
            titulo="Despesas Totais" 
            valor={despesaTotal} 
            tipo="perigo" 
            icone={TrendingDown} 
          />
        </div>

        <SecaoIA 
          analise={analiseIA} 
          carregando={carregandoIA} 
          onGerar={gerarAnaliseIA} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <FormularioTransacao onAdicionar={adicionarTransacao} />

          <div className="lg:col-span-2 bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col gap-8">
             <div>
               <h3 className="text-lg font-semibold text-white mb-4">Distribuição de Despesas</h3>
               <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={dadosGraficoPizza}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={80}
                       paddingAngle={5}
                       dataKey="value"
                     >
                       {dadosGraficoPizza.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={CORES_GRAFICO[index % CORES_GRAFICO.length]} />
                       ))}
                     </Pie>
                     <TooltipRecharts 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                        itemStyle={{ color: '#f8fafc' }}
                     />
                   </PieChart>
                 </ResponsiveContainer>
               </div>
             </div>
          </div>
        </div>

        <TabelaTransacoes 
          transacoes={transacoesFiltradas} 
          filtroCategoria={filtroCategoria} 
          onFiltroChange={setFiltroCategoria} 
          onRemover={removerTransacao} 
        />
      </main>
    </div>
  );
};
