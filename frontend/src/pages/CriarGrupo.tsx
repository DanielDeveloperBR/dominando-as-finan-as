import { useState, useEffect, useRef } from 'react';
import { useGroups } from '@/hooks/useGroups';
import { MembroGrupo, Transacao, TipoTransacao, GrupoComRole } from '@/types';
import {
    Users, X, Plus, UserPlus, ArrowRight, ArrowLeft,
    Crown, Loader2, AlertCircle, TrendingUp, TrendingDown,
    UserMinus, ChevronRight, Trash2,
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatBRL = (valor: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

const formatData = (dataIso: string) =>
    new Date(dataIso).toLocaleDateString('pt-BR');

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function BadgeRole({ role }: { role: MembroGrupo['role'] }) {
    if (role === 'OWNER') {
        return (
            <span className="flex items-center gap-1 text-xs font-semibold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full">
                <Crown className="w-3 h-3" /> Dono
            </span>
        );
    }
    return (
        <span className="text-xs font-medium text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">
            Membro
        </span>
    );
}

// Transacao enriquecida com nome do membro (retornado pela query do grupo)
interface TransacaoGrupo extends Transacao {
    membro_nome?: string;
}

function LinhaTransacaoGrupo({ transacao }: { transacao: TransacaoGrupo }) {
    const ehReceita = transacao.tipo === TipoTransacao.RECEITA;
    return (
        <div className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
            <div className="flex items-center gap-3 min-w-0">
                <div className={`p-1.5 rounded-lg shrink-0 ${ehReceita ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                    {ehReceita
                        ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        : <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                    }
                </div>
                <div className="min-w-0">
                    <p className="text-sm text-white font-medium truncate">{transacao.descricao}</p>
                    <p className="text-xs text-slate-500 truncate">
                        {formatData(transacao.data)} · {transacao.categoria}
                        {transacao.membro_nome && (
                            <span className="ml-1 text-slate-600">· {transacao.membro_nome}</span>
                        )}
                    </p>
                </div>
            </div>
            <span className={`text-sm font-bold shrink-0 ml-4 ${ehReceita ? 'text-emerald-400' : 'text-rose-400'}`}>
                {ehReceita ? '+' : '-'}{formatBRL(Number(transacao.valor))}
            </span>
        </div>
    );
}

// ─── Modal de confirmação de exclusão ────────────────────────────────────────

interface ModalConfirmarExclusaoProps {
    nomeGrupo: string;
    excluindo: boolean;
    onConfirmar: () => void;
    onCancelar: () => void;
}

function ModalConfirmarExclusao({ nomeGrupo, excluindo, onConfirmar, onCancelar }: ModalConfirmarExclusaoProps) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancelar} />
            <div className="relative bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-sm w-full shadow-2xl">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-rose-500/10 p-2.5 rounded-lg shrink-0">
                            <Trash2 className="w-5 h-5 text-rose-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">Excluir grupo</h3>
                            <p className="text-slate-400 text-sm">Esta ação não pode ser desfeita.</p>
                        </div>
                    </div>
                    <p className="text-slate-300 text-sm">
                        O grupo <span className="text-white font-semibold">"{nomeGrupo}"</span> e todos os seus membros serão removidos.
                        As transações pessoais dos membros <span className="text-slate-400">não serão deletadas</span>.
                    </p>
                    <div className="flex gap-3 mt-1">
                        <button
                            onClick={onCancelar}
                            disabled={excluindo}
                            className="flex-1 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onConfirmar}
                            disabled={excluindo}
                            className="flex-1 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {excluindo
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Excluindo...</>
                                : 'Excluir grupo'
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Etapa: lista de grupos do usuário ───────────────────────────────────────

interface EtapaMeusGruposProps {
    onSelecionarGrupo: (grupo: GrupoComRole) => void;
    onCriarNovo: () => void;
}

function EtapaMeusGrupos({ onSelecionarGrupo, onCriarNovo }: EtapaMeusGruposProps) {
    const { meusGrupos, carregandoMeusGrupos, erroGrupo, carregarMeusGrupos } = useGroups();

    useEffect(() => {
        carregarMeusGrupos();
    }, []);

    return (
        <div className="flex flex-col gap-6">
            <p className="text-slate-400 text-sm">
                Selecione um grupo para gerenciar ou crie um novo.
            </p>

            {carregandoMeusGrupos ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                </div>
            ) : erroGrupo ? (
                <p className="flex items-center gap-1.5 text-xs text-rose-400">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {erroGrupo}
                </p>
            ) : meusGrupos.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8 text-slate-500">
                    <Users className="w-10 h-10 opacity-30" />
                    <p className="text-sm">Você ainda não participa de nenhum grupo.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {meusGrupos.map((grupo) => (
                        <button
                            key={grupo.id}
                            onClick={() => onSelecionarGrupo(grupo)}
                            className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 rounded-lg px-4 py-3 transition-colors text-left w-full"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="bg-emerald-500/10 p-1.5 rounded-md shrink-0">
                                    <Users className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-white text-sm font-medium truncate">{grupo.nome}</p>
                                    <p className="text-slate-500 text-xs">
                                        {grupo.role === 'OWNER' ? 'Você é o dono' : 'Você é membro'}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                        </button>
                    ))}
                </div>
            )}

            <button
                onClick={onCriarNovo}
                className="flex items-center justify-center gap-2 w-full border border-dashed border-slate-600 hover:border-emerald-500 hover:bg-emerald-500/5 text-slate-400 hover:text-emerald-400 font-medium text-sm px-4 py-2.5 rounded-lg transition-colors"
            >
                <Plus className="w-4 h-4" /> Criar novo grupo
            </button>
        </div>
    );
}

// ─── Etapa: formulário de criação ─────────────────────────────────────────────

interface EtapaCriarGrupoProps {
    onGrupoCriado: (id: string, nome: string) => void;
    onVoltar: () => void;
}

function EtapaCriarGrupo({ onGrupoCriado, onVoltar }: EtapaCriarGrupoProps) {
    const [nomeGrupo, setNomeGrupo] = useState('');
    const [erroLocal, setErroLocal] = useState<string | null>(null);
    const { criarGrupo, carregandoGrupo } = useGroups();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const nomeTrimado = nomeGrupo.trim();
        if (nomeTrimado.length < 3) {
            setErroLocal('Nome do grupo deve ter pelo menos 3 caracteres');
            return;
        }
        try {
            setErroLocal(null);
            const grupoCriado = await criarGrupo(nomeTrimado);
            onGrupoCriado(grupoCriado.id, grupoCriado.nome);
        } catch (erro) {
            setErroLocal(erro instanceof Error ? erro.message : 'Erro ao criar grupo');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <button
                type="button"
                onClick={onVoltar}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors w-fit"
            >
                <ArrowLeft className="w-4 h-4" /> Voltar para grupos
            </button>

            <p className="text-slate-400 text-sm leading-relaxed">
                Crie um grupo para gerenciar finanças compartilhadas com outras pessoas.
            </p>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">Nome do grupo</label>
                <input
                    ref={inputRef}
                    value={nomeGrupo}
                    onChange={(e) => { setNomeGrupo(e.target.value); setErroLocal(null); }}
                    placeholder="Ex: Casa, Viagem, Trabalho..."
                    maxLength={50}
                    className={`bg-slate-800 border text-white text-sm rounded-lg w-full px-3 py-2.5 placeholder-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${erroLocal ? 'border-rose-500' : 'border-slate-700'}`}
                />
                {erroLocal && (
                    <p className="flex items-center gap-1.5 text-xs text-rose-400">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {erroLocal}
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={carregandoGrupo || nomeGrupo.trim().length < 3}
                className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
            >
                {carregandoGrupo
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Criando...</>
                    : <><Plus className="w-4 h-4" /> Criar Grupo</>
                }
            </button>
        </form>
    );
}

// ─── Etapa: painel do grupo ativo ─────────────────────────────────────────────

interface EtapaGrupoAtivoProps {
    groupId: string;
    nomeGrupo: string;
    roleNoGrupo: 'OWNER' | 'MEMBER';
    usuarioLogadoId: string;
    onVoltar: () => void;
    onGrupoExcluido: () => void;
}

function EtapaGrupoAtivo({
    groupId,
    nomeGrupo,
    roleNoGrupo,
    usuarioLogadoId,
    onVoltar,
    onGrupoExcluido,
}: EtapaGrupoAtivoProps) {
    const {
        membros, transacoesDoGrupo, carregandoMembros, erroGrupo,
        carregarMembros, adicionarMembroPorEmail, removerMembro, excluirGrupo,
    } = useGroups();

    const [emailNovoMembro, setEmailNovoMembro] = useState('');
    const [adicionandoMembro, setAdicionandoMembro] = useState(false);
    const [removendoMembroId, setRemovendoMembroId] = useState<string | null>(null);
    const [erroAdicionarMembro, setErroAdicionarMembro] = useState<string | null>(null);
    const [sucessoAdicionarMembro, setSucessoAdicionarMembro] = useState(false);
    const [abaAtiva, setAbaAtiva] = useState<'membros' | 'transacoes'>('membros');
    const [confirmarExclusao, setConfirmarExclusao] = useState(false);
    const [excluindo, setExcluindo] = useState(false);
    const [erroExclusao, setErroExclusao] = useState<string | null>(null);
    const isOwner = roleNoGrupo === 'OWNER';

    useEffect(() => {
        carregarMembros(groupId);
    }, [groupId]);

    const handleAdicionarMembro = async (e: React.FormEvent) => {
        e.preventDefault();
        const emailTrimado = emailNovoMembro.trim();
        if (!emailTrimado) return;
        setAdicionandoMembro(true);
        setErroAdicionarMembro(null);
        setSucessoAdicionarMembro(false);
        try {
            await adicionarMembroPorEmail(groupId, emailTrimado);
            setEmailNovoMembro('');
            setSucessoAdicionarMembro(true);
            setTimeout(() => setSucessoAdicionarMembro(false), 3000);
        } catch (erro) {
            setErroAdicionarMembro(erro instanceof Error ? erro.message : 'Erro ao adicionar membro');
        } finally {
            setAdicionandoMembro(false);
        }
    };

    const handleRemoverMembro = async (membroId: string) => {
        setRemovendoMembroId(membroId);
        try {
            await removerMembro(groupId, membroId);
        } finally {
            setRemovendoMembroId(null);
        }
    };

    const handleExcluirGrupo = async () => {
        setExcluindo(true);
        setErroExclusao(null);
        try {
            await excluirGrupo(groupId);
            onGrupoExcluido();
        } catch (erro) {
            setErroExclusao(erro instanceof Error ? erro.message : 'Erro ao excluir grupo');
            setConfirmarExclusao(false);
        } finally {
            setExcluindo(false);
        }
    };

    const transacoesGrupo = transacoesDoGrupo as TransacaoGrupo[];

    return (
        <>
            {confirmarExclusao && (
                <ModalConfirmarExclusao
                    nomeGrupo={nomeGrupo}
                    excluindo={excluindo}
                    onConfirmar={handleExcluirGrupo}
                    onCancelar={() => setConfirmarExclusao(false)}
                />
            )}

            <div className="flex flex-col gap-6">
                {/* Header do grupo com botão voltar e excluir */}
                <div className="flex items-center gap-3">
                    <button onClick={onVoltar} className="text-slate-400 hover:text-white transition-colors p-1 rounded">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 flex items-center gap-2 flex-1 min-w-0">
                        <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                        <p className="text-emerald-400 text-sm font-semibold truncate">{nomeGrupo}</p>
                        {isOwner && (
                            <span className="ml-auto flex items-center gap-1 text-xs text-yellow-400 shrink-0">
                                <Crown className="w-3 h-3" /> Dono
                            </span>
                        )}
                    </div>
                    {/* Botão excluir grupo — apenas OWNER */}
                    {isOwner && (
                        <button
                            onClick={() => setConfirmarExclusao(true)}
                            title="Excluir grupo"
                            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors shrink-0"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {erroExclusao && (
                    <p className="flex items-center gap-1.5 text-xs text-rose-400">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />{erroExclusao}
                    </p>
                )}

                {/* Formulário adicionar membro — apenas OWNER */}
                {isOwner && (
                    <form onSubmit={handleAdicionarMembro} className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-300">Adicionar membro por email</label>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                value={emailNovoMembro}
                                onChange={(e) => { setEmailNovoMembro(e.target.value); setErroAdicionarMembro(null); }}
                                placeholder="email@exemplo.com"
                                className={`flex-1 bg-slate-800 border text-white text-sm rounded-lg px-3 py-2.5 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${erroAdicionarMembro ? 'border-rose-500' : 'border-slate-700'}`}
                            />
                            <button
                                type="submit"
                                disabled={adicionandoMembro || !emailNovoMembro.trim()}
                                className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-3 py-2.5 rounded-lg transition-colors shrink-0"
                            >
                                {adicionandoMembro ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                            </button>
                        </div>
                        {erroAdicionarMembro && (
                            <p className="flex items-center gap-1.5 text-xs text-rose-400">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />{erroAdicionarMembro}
                            </p>
                        )}
                        {sucessoAdicionarMembro && <p className="text-xs text-emerald-400">✓ Membro adicionado com sucesso</p>}
                        {erroGrupo && !erroAdicionarMembro && (
                            <p className="flex items-center gap-1.5 text-xs text-rose-400">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />{erroGrupo}
                            </p>
                        )}
                    </form>
                )}

                {/* Abas membros / transações */}
                <div>
                    <div className="flex gap-1 bg-slate-800 p-1 rounded-lg mb-4">
                        {(['membros', 'transacoes'] as const).map((aba) => (
                            <button
                                key={aba}
                                onClick={() => setAbaAtiva(aba)}
                                className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium py-1.5 rounded-md transition-colors ${abaAtiva === aba ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-300'}`}
                            >
                                {aba === 'membros' ? <Users className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                {aba === 'membros' ? 'Membros' : 'Transações'}
                                {aba === 'membros' && membros.length > 0 && <span className="text-xs text-slate-400">({membros.length})</span>}
                                {aba === 'transacoes' && transacoesGrupo.length > 0 && <span className="text-xs text-slate-400">({transacoesGrupo.length})</span>}
                            </button>
                        ))}
                    </div>

                    {carregandoMembros ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                        </div>
                    ) : (
                        <>
                            {abaAtiva === 'membros' && (
                                <div className="flex flex-col gap-2">
                                    {membros.length === 0 ? (
                                        <p className="text-center text-slate-500 text-sm py-6">Nenhum membro além de você ainda.</p>
                                    ) : (
                                        membros.map((membro) => {
                                            const ehOProprio = membro.id === usuarioLogadoId;
                                            const podeRemover = isOwner && !ehOProprio;
                                            return (
                                                <div key={membro.id} className="flex items-center justify-between bg-slate-800 rounded-lg px-4 py-3">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-white text-sm font-medium truncate">{membro.nome}</p>
                                                        <p className="text-slate-500 text-xs truncate">{membro.email}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                                        <BadgeRole role={membro.role} />
                                                        {podeRemover && (
                                                            <button
                                                                onClick={() => handleRemoverMembro(membro.id)}
                                                                disabled={removendoMembroId === membro.id}
                                                                title="Remover membro"
                                                                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-md transition-colors disabled:opacity-50"
                                                            >
                                                                {removendoMembroId === membro.id
                                                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                    : <UserMinus className="w-3.5 h-3.5" />
                                                                }
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}

                            {abaAtiva === 'transacoes' && (
                                <div>
                                    {transacoesGrupo.length === 0 ? (
                                        <p className="text-center text-slate-500 text-sm py-6">Nenhuma transação registrada pelos membros.</p>
                                    ) : (
                                        transacoesGrupo.map((transacao) => (
                                            <LinhaTransacaoGrupo key={transacao.id} transacao={transacao} />
                                        ))
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

// ─── Drawer principal ─────────────────────────────────────────────────────────

type Etapa = 'lista' | 'criar' | 'ativo';

interface DrawerGrupoProps {
    aberto: boolean;
    onFechar: () => void;
    usuarioLogadoId: string;
}

export function DrawerGrupo({ aberto, onFechar, usuarioLogadoId }: DrawerGrupoProps) {
    const [etapa, setEtapa] = useState<Etapa>('lista');
    const [grupoCriadoId, setGrupoCriadoId] = useState<string | null>(null);
    const [grupoCriadoNome, setGrupoCriadoNome] = useState('');
    const [roleNoGrupoAtivo, setRoleNoGrupoAtivo] = useState<'OWNER' | 'MEMBER'>('MEMBER');

    useEffect(() => {
        if (!aberto) {
            const timer = setTimeout(() => {
                setEtapa('lista');
                setGrupoCriadoId(null);
                setGrupoCriadoNome('');
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [aberto]);

    const handleGrupoCriado = (id: string, nome: string) => {
        setGrupoCriadoId(id);
        setGrupoCriadoNome(nome);
        setRoleNoGrupoAtivo('OWNER');
        setEtapa('ativo');
    };

    const handleSelecionarGrupo = (grupo: GrupoComRole) => {
        setGrupoCriadoId(grupo.id);
        setGrupoCriadoNome(grupo.nome);
        setRoleNoGrupoAtivo(grupo.role);
        setEtapa('ativo');
    };

    const handleGrupoExcluido = () => {
        // Volta para lista — a lista será recarregada pelo hook após a exclusão
        setEtapa('lista');
        setGrupoCriadoId(null);
        setGrupoCriadoNome('');
    };

    const tituloEtapa: Record<Etapa, string> = {
        lista: 'Meus Grupos',
        criar: 'Novo Grupo',
        ativo: grupoCriadoNome || 'Grupo',
    };

    return (
        <>
            <div
                onClick={onFechar}
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${aberto ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            />
            <aside className={`fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 z-50 flex flex-col transition-transform duration-300 ease-in-out ${aberto ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-500/10 p-2 rounded-lg">
                            <Users className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-white font-semibold text-base">{tituloEtapa[etapa]}</h2>
                            {etapa === 'ativo' && (
                                <div className="flex items-center gap-1 mt-0.5">
                                    <span className="text-xs text-slate-500">Grupos</span>
                                    <ArrowRight className="w-3 h-3 text-slate-600" />
                                    <span className="text-xs text-emerald-400 truncate max-w-[140px]">{grupoCriadoNome}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <button onClick={onFechar} className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6">
                    {etapa === 'lista' && (
                        <EtapaMeusGrupos
                            onSelecionarGrupo={handleSelecionarGrupo}
                            onCriarNovo={() => setEtapa('criar')}
                        />
                    )}
                    {etapa === 'criar' && (
                        <EtapaCriarGrupo
                            onGrupoCriado={handleGrupoCriado}
                            onVoltar={() => setEtapa('lista')}
                        />
                    )}
                    {etapa === 'ativo' && grupoCriadoId && (
                        <EtapaGrupoAtivo
                            groupId={grupoCriadoId}
                            nomeGrupo={grupoCriadoNome}
                            roleNoGrupo={roleNoGrupoAtivo}
                            usuarioLogadoId={usuarioLogadoId}
                            onVoltar={() => setEtapa('lista')}
                            onGrupoExcluido={handleGrupoExcluido}
                        />
                    )}
                </div>
            </aside>
        </>
    );
}

export function CriarGrupo() {
    const [drawerAberto, setDrawerAberto] = useState(true);
    return (
        <div className="min-h-screen bg-slate-950">
            <DrawerGrupo aberto={drawerAberto} onFechar={() => setDrawerAberto(false)} usuarioLogadoId="" />
        </div>
    );
}