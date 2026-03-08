import { useEffect, useState } from 'react';
import { Wallet, Plus, Trash2, AlertTriangle, TrendingUp, Loader2, AlertCircle, X } from 'lucide-react';
import { useBudget } from '@/hooks/useBudge';
import { ConsumoOrcamento } from '@/services/budgeService';

const CATEGORIAS = [
  'MORADIA', 'ALIMENTACAO', 'TRANSPORTE', 'LAZER', 'SAUDE', 'OUTROS',
] as const;

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

// ─── Barra de progresso individual ───────────────────────────────────────────

function BarraOrcamento({
  orcamento,
  onRemover,
}: {
  orcamento: ConsumoOrcamento;
  onRemover: (id: string) => void;
}) {
  const { percentual, gasto_atual, limite_mensal, valor_restante, vai_estourar, categoria } = orcamento;

  const corBarra = percentual >= 100
    ? 'bg-rose-500'
    : percentual >= 70
    ? 'bg-yellow-500'
    : 'bg-emerald-500';

  const corTexto = percentual >= 100
    ? 'text-rose-400'
    : percentual >= 70
    ? 'text-yellow-400'
    : 'text-emerald-400';

  return (
    <div className="bg-slate-800/50 rounded-lg px-4 py-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {vai_estourar && percentual < 100 && (
            <TrendingUp className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
          )}
          {percentual >= 100 && (
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          )}
          <span className="text-white text-sm font-medium truncate">{categoria}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className={`text-xs font-bold ${corTexto}`}>{percentual.toFixed(0)}%</span>
          <button
            onClick={() => onRemover(orcamento.id)}
            title="Remover limite"
            className="text-slate-600 hover:text-rose-400 transition-colors p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${corBarra}`}
          style={{ width: `${Math.min(percentual, 100)}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-slate-500">
        <span>{formatBRL(gasto_atual)} gastos</span>
        <span>
          {percentual >= 100
            ? 'Limite atingido'
            : `${formatBRL(valor_restante)} restante de ${formatBRL(limite_mensal)}`
          }
        </span>
      </div>

      {vai_estourar && percentual < 100 && (
        <p className="text-xs text-yellow-400/80">
          No ritmo atual, você vai ultrapassar o limite este mês.
        </p>
      )}
    </div>
  );
}

// ─── Formulário para adicionar limite ────────────────────────────────────────

function FormLimite({ onSalvar, onCancelar, categoriasUsadas }: {
  onSalvar: (categoria: string, valor: number) => Promise<void>;
  onCancelar: () => void;
  categoriasUsadas: string[];
}) {
  const [categoria, setCategoria] = useState('');
  const [valor, setValor] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const categoriasDisponiveis = CATEGORIAS.filter(c => !categoriasUsadas.includes(c));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseFloat(valor.replace(',', '.'));
    if (!categoria || isNaN(v) || v <= 0) {
      setErro('Escolha uma categoria e informe um valor válido.');
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      await onSalvar(categoria, v);
      onCancelar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-slate-800/50 rounded-lg p-4">
      <p className="text-sm font-medium text-slate-300">Novo limite de orçamento</p>

      <select
        value={categoria}
        onChange={e => setCategoria(e.target.value)}
        className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <option value="">Selecione uma categoria...</option>
        {categoriasDisponiveis.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <input
        type="number"
        min="1"
        step="0.01"
        value={valor}
        onChange={e => setValor(e.target.value)}
        placeholder="Limite mensal (R$)"
        className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />

      {erro && (
        <p className="flex items-center gap-1.5 text-xs text-rose-400">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />{erro}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={salvando || !categoria || !valor}
          className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors"
        >
          {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="flex-1 py-2 text-sm text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ─── Seção principal ──────────────────────────────────────────────────────────

export function SecaoOrcamento() {
  const { orcamentos, carregando, erro, carregarOrcamentos, definirLimite, removerLimite } = useBudget();
  const [mostrarForm, setMostrarForm] = useState(false);

  useEffect(() => {
    carregarOrcamentos();
  }, [carregarOrcamentos]);

  const categoriasUsadas = orcamentos.map(o => o.categoria);
  // CATEGORIAS já exclui SALARIO — não precisa de filter adicional
  const todasDefinidas = CATEGORIAS.every(c => categoriasUsadas.includes(c));

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Orçamento por Categoria</h3>
        </div>
        {!todasDefinidas && !mostrarForm && (
          <button
            onClick={() => setMostrarForm(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Definir limite
          </button>
        )}
      </div>

      {carregando ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
        </div>
      ) : erro ? (
        <p className="text-rose-400 text-sm">{erro}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orcamentos.length === 0 && !mostrarForm && (
            <div className="flex flex-col items-center gap-3 py-6 text-slate-500">
              <Wallet className="w-8 h-8 opacity-30" />
              <p className="text-sm text-center">
                Defina limites por categoria para receber alertas antes de estourar o orçamento.
              </p>
              <button
                onClick={() => setMostrarForm(true)}
                className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <Plus className="w-4 h-4" /> Criar primeiro limite
              </button>
            </div>
          )}

          {orcamentos.map(o => (
            <BarraOrcamento
              key={o.id}
              orcamento={o}
              onRemover={removerLimite}
            />
          ))}

          {mostrarForm && (
            <FormLimite
              onSalvar={(cat, val) => definirLimite({ categoria: cat, limite_mensal: val })}
              onCancelar={() => setMostrarForm(false)}
              categoriasUsadas={categoriasUsadas}
            />
          )}
        </div>
      )}
    </div>
  );
}