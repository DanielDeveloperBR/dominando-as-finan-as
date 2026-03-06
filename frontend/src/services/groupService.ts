const API_URL = '/api/groups';

export class GroupService {

    private static async handleResponse(res: Response, fallbackMsg: string) {
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || fallbackMsg);
        }
        return await res.json();
    }

    static async criarGrupo(nome: string) {
        const res = await fetch(`${API_URL}/criar-grupo`, {
            method: 'POST',
            body: JSON.stringify({ nome }),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        console.log(res.status)
        return this.handleResponse(res, 'Erro ao criar grupo');
    }

    static async adicionarMembro(groupId: string, userId: string) {
        const res = await fetch(`${API_URL}/groups/${groupId}/members`, {
            method: 'POST',
            body: JSON.stringify({ userId }), 
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        return this.handleResponse(res, 'Erro ao adicionar membro ao grupo');
    }

    static async listarMembros(groupId: string) {
        const res = await fetch(`${API_URL}/groups/${groupId}/members`, {
            method: 'GET',
            credentials: 'include'
        });

        return this.handleResponse(res, 'Erro ao listar membros');
    }
}