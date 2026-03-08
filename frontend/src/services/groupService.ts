import { Grupo, GrupoComRole, MembroGrupo, Transacao, UsuarioBusca } from "@/types";

const API_GROUPS_URL = '/api/groups';
const API_AUTH_URL = '/api/auth';

export class GroupService {

    private static async handleResponse<T>(res: Response, mensagemFallback: string): Promise<T> {
        if (!res.ok) {
            const corpo = await res.json().catch(() => ({}));
            throw new Error(corpo.error || mensagemFallback);
        }
        return res.json() as Promise<T>;
    }

    static async criarGrupo(nome: string): Promise<Grupo> {
        const res = await fetch(`${API_GROUPS_URL}/criar-grupo`, {
            method: 'POST',
            body: JSON.stringify({ nome }),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });
        return this.handleResponse<Grupo>(res, 'Erro ao criar grupo');
    }

    static async adicionarMembro(groupId: string, userId: string): Promise<MembroGrupo> {
        const res = await fetch(`${API_GROUPS_URL}/${groupId}/adicionar-membro`, {
            method: 'POST',
            body: JSON.stringify({ userId }),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });
        return this.handleResponse<MembroGrupo>(res, 'Erro ao adicionar membro ao grupo');
    }

    static async listarMembros(groupId: string): Promise<MembroGrupo[]> {
        const res = await fetch(`${API_GROUPS_URL}/${groupId}/listar-membros`, {
            credentials: 'include',
        });
        return this.handleResponse<MembroGrupo[]>(res, 'Erro ao listar membros');
    }

    static async listarTransacoes(groupId: string): Promise<Transacao[]> {
        const res = await fetch(`${API_GROUPS_URL}/${groupId}/listar-transacoes`, {
            credentials: 'include',
        });
        return this.handleResponse<Transacao[]>(res, 'Erro ao listar transações do grupo');
    }

    static async buscarUsuarioPorEmail(email: string): Promise<UsuarioBusca> {
        const emailCodificado = encodeURIComponent(email.trim());
        const res = await fetch(`${API_AUTH_URL}/buscar?email=${emailCodificado}`, {
            credentials: 'include',
        });
        return this.handleResponse<UsuarioBusca>(res, 'Usuário não encontrado');
    }

    static async listarMeusGrupos(): Promise<GrupoComRole[]> {
        const res = await fetch(`${API_GROUPS_URL}/meus-grupos`, {
            credentials: 'include',
        });
        return this.handleResponse<GrupoComRole[]>(res, 'Erro ao listar grupos');
    }

    static async removerMembro(groupId: string, membroId: string): Promise<void> {
        const res = await fetch(`${API_GROUPS_URL}/${groupId}/membros/${membroId}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!res.ok) {
            const corpo = await res.json().catch(() => ({}));
            throw new Error(corpo.error || 'Erro ao remover membro');
        }
    }

    static async excluirGrupo(groupId: string): Promise<void> {
        const res = await fetch(`${API_GROUPS_URL}/${groupId}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!res.ok) {
            const corpo = await res.json().catch(() => ({}));
            throw new Error(corpo.error || 'Erro ao excluir grupo');
        }
    }
}