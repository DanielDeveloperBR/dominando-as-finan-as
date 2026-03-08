import { useEffect, useState } from 'react';
import { useGoals } from '@/hooks/useGoals';
import {
  Target, Plus, Trash2, ChevronDown, ChevronUp,
  Loader2, AlertCircle, CheckCircle2, Clock, TrendingUp,
} from 'lucide-react';
import { Meta } from '@/services/goalsService';

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

// ─── Badge de status da projeção ─────────────────────────────────────────────

function BadgeProjecao({ meta }: { meta: Meta }) {
  if (meta.status === 'CONCLUIDA') {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
        <CheckCircle2 className="w-3 h-3" /> Concluída
      </span>
    );
  }
  if (meta.status_projecao === 'ATRASADO') {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
        <AlertCircle className="w-3 h-3" /> Atrasado
      </span>
    );
  }
  if (meta.status_projecao === 'NO_PRAZO') {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
        <Clock className="w-3 h-3" /> No prazo
      </span>
    );
  }
  return null;
}

// ─── Card individual de meta ─────────────────────────────────────────────────

function CartaoMeta({
  meta,
  onDepositar,
  onExcluir,
}: {
  meta: Meta;
  onDepositar: (id: string, valor: number) => Promise<void>;
  onExcluir: (id: string) => Promise<void>;
}) {
  const [expandido, setExpandido] = useState(false);
  const [valorDeposito, setValorDeposito] = useState('');
  const [depositando, setDepositando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const corBarra = meta.status === 'CONCLUIDA'
    ? 'bg-emerald-500'
    : meta.percentual_concluido >= 75
    ? 'bg-emerald-500'
    : meta.percentual_concluido >= 40
    ? 'bg-yellow-500'
    : 'bg-blue-500';

  const handleDepositar = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseFloat(valorDeposito.replace(',', '.'));
    if (isNaN(v) || v <= 0) {
      setErro('Informe um valor válido.');
      return;
    }
    setDepositando(true);
    setErro(null);
    try {
      await onDepositar(meta.id, v);
      setValorDeposito('');
      setExpandido(false);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao depositar');
    } finally {
      setDepositando(false);
    }
  };

  const handleExcluir = async () => {
    setExcluindo(true);
    try {
      await onExcluir(meta.id);
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <div className={`bg-slate-800/50 rounded-xl border transition-colors ${
      meta.status === 'CONCLUIDA' ? 'border-emerald-500/30' : 'border-slate-700/50'
    }`}>
      {/* Header do card */}
      <div className="px-4 pt-4 pb-3 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-white text-sm font-semibold truncate">{meta.titulo}</p>
              <BadgeProjecao meta={meta} />
            </div>
            {meta.descricao && (
              <p className="text-slate-500 text-xs mt-0.5 truncate">{meta.descricao}</p>
            )}
          </div>
          <button
            onClick={handleExcluir}
            disabled={excluindo}
            title="Excluir meta"
            className="text-slate-600 hover:text-rose-400 transition-colors p-1 shrink-0"
          >
            {excluindo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Barra de progresso */}
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>{formatBRL(meta.valor_atual)} guardados</span>
            <span className="font-medium text-white">{meta.percentual_concluido.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${corBarra}`}
              style={{ width: `${meta.percentual_concluido}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Meta: {formatBRL(meta.valor_meta)}</span>
            {meta.status !== 'CONCLUIDA' && (
              <span>Faltam: {formatBRL(meta.valor_restante)}</span>
            )}
          </div>
        </div>

        {/* Projeção */}
        {meta.status !== 'CONCLUIDA' && meta.meses_estimados !== null && (
          <p className="flex items-center gap-1 text-xs text-slate-400">
            <TrendingUp className="w-3 h-3 shrink-0" />
            Estimativa: <span className="text-white font-medium ml-0.5">{meta.meses_estimados} {meta.meses_estimados === 1 ? 'mês' : 'meses'}</span>
            {meta.prazo_meses && (
              <span className="ml-1 text-slate-600">· Prazo: {meta.prazo_meses} meses</span>
            )}
          </p>
        )}
      </div>

      {/* Botão depositar */}
      {meta.status === 'ATIVA' && (
        <div className="px-4 pb-4">
          <button
            onClick={() => setExpandido(!expandido)}
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            {expandido ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expandido ? 'Cancelar' : 'Depositar valor'}
          </button>

          {expandido && (
            <form onSubmit={handleDepositar} className="flex gap-2 mt-2">
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={valorDeposito}
                onChange={e => { setValorDeposito(e.target.value); setErro(null); }}
                placeholder="R$ 0,00"
                className={`flex-1 bg-slate-900 border text-white text-sm rounded-lg px-3 py-2 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  erro ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              <button
                type="submit"
                disabled={depositando || !valorDeposito}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors shrink-0"
              >
                {depositando ? <Loader2 className="w-4 h-4 animate-spin" /> : 'OK'}
              </button>
            </form>
          )}
          {erro && (
            <p className="flex items-center gap-1 text-xs text-rose-400 mt-1">
              <AlertCircle className="w-3 h-3" />{erro}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Formulário criar meta ────────────────────────────────────────────────────

function FormCriarMeta({ onSalvar, onCancelar }: {
  onSalvar: (dados: { titulo: string; valor_meta: number; descricao?: string; prazo_meses?: number }) => Promise<void>;
  onCancelar: () => void;
}) {
  const [titulo, setTitulo] = useState('');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prazo, setPrazo] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseFloat(valor.replace(',', '.'));
    if (!titulo.trim() || isNaN(v) || v <= 0) {
      setErro('Título e valor da meta são obrigatórios.');
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      await onSalvar({
        titulo: titulo.trim(),
        valor_meta: v,
        descricao: descricao.trim() || undefined,
        prazo_meses: prazo ? parseInt(prazo) : undefined,
      });
      onCancelar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao criar meta');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 flex flex-col gap-3">
      <p className="text-sm font-medium text-slate-300">Nova meta de poupança</p>

      <input
        value={titulo}
        onChange={e => setTitulo(e.target.value)}
        placeholder="Ex: Reserva de emergência, Viagem..."
        maxLength={255}
        className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <input
        type="number"
        min="1"
        step="0.01"
        value={valor}
        onChange={e => setValor(e.target.value)}
        placeholder="Valor da meta (R$)"
        className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <input
        value={descricao}
        onChange={e => setDescricao(e.target.value)}
        placeholder="Descrição (opcional)"
        maxLength={500}
        className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <input
        type="number"
        min="1"
        max="600"
        value={prazo}
        onChange={e => setPrazo(e.target.value)}
        placeholder="Prazo em meses (opcional)"
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
          disabled={salvando || !titulo || !valor}
          className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors"
        >
          {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar meta'}
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

export function SecaoMetas() {
  const { metas, carregando, erro, carregarMetas, criarMeta, depositar, excluirMeta } = useGoals();
  const [mostrarForm, setMostrarForm] = useState(false);

  useEffect(() => {
    carregarMetas();
  }, [carregarMetas]);

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Metas de Poupança</h3>
        </div>
        {!mostrarForm && (
          <button
            onClick={() => setMostrarForm(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Nova meta
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
          {metas.length === 0 && !mostrarForm && (
            <div className="flex flex-col items-center gap-3 py-6 text-slate-500">
              <Target className="w-8 h-8 opacity-30" />
              <p className="text-sm text-center">
                Defina metas de poupança para visualizar seu progresso e projeção de conclusão.
              </p>
              <button
                onClick={() => setMostrarForm(true)}
                className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <Plus className="w-4 h-4" /> Criar primeira meta
              </button>
            </div>
          )}

          {mostrarForm && (
            <FormCriarMeta
              onSalvar={criarMeta}
              onCancelar={() => setMostrarForm(false)}
            />
          )}

          {metas.map(meta => (
            <CartaoMeta
              key={meta.id}
              meta={meta}
              onDepositar={depositar}
              onExcluir={excluirMeta}
            />
          ))}
        </div>
      )}
    </div>
  );
}