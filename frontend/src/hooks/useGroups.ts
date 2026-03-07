import { useState } from 'react';
import { GroupService } from '@/services/groupService';
import { Grupo, GrupoComRole, MembroGrupo, Transacao, UsuarioBusca } from '@/types';

export const useGroups = () => {
    const [grupoAtivo, setGrupoAtivo] = useState<Grupo | null>(null);
    const [meusGrupos, setMeusGrupos] = useState<GrupoComRole[]>([]);
    const [membros, setMembros] = useState<MembroGrupo[]>([]);
    const [transacoesDoGrupo, setTransacoesDoGrupo] = useState<Transacao[]>([]);
    const [carregandoGrupo, setCarregandoGrupo] = useState(false);
    const [carregandoMembros, setCarregandoMembros] = useState(false);
    const [carregandoMeusGrupos, setCarregandoMeusGrupos] = useState(false);
    const [erroGrupo, setErroGrupo] = useState<string | null>(null);

    const carregarMeusGrupos = async (): Promise<void> => {
        setCarregandoMeusGrupos(true);
        setErroGrupo(null);
        try {
            const grupos = await GroupService.listarMeusGrupos();
            setMeusGrupos(grupos);
        } catch (erro) {
            const mensagem = erro instanceof Error ? erro.message : 'Erro ao carregar grupos';
            setErroGrupo(mensagem);
        } finally {
            setCarregandoMeusGrupos(false);
        }
    };

    const criarGrupo = async (nome: string): Promise<Grupo> => {
        setCarregandoGrupo(true);
        setErroGrupo(null);
        try {
            const grupoCriado = await GroupService.criarGrupo(nome);
            setGrupoAtivo(grupoCriado);
            // Atualiza a lista de grupos do usuário após criar
            await carregarMeusGrupos();
            return grupoCriado;
        } catch (erro) {
            const mensagem = erro instanceof Error ? erro.message : 'Erro ao criar grupo';
            setErroGrupo(mensagem);
            throw erro;
        } finally {
            setCarregandoGrupo(false);
        }
    };

    const carregarMembros = async (groupId: string): Promise<void> => {
        setCarregandoMembros(true);
        try {
            const [membrosCarregados, transacoesCarregadas] = await Promise.all([
                GroupService.listarMembros(groupId),
                GroupService.listarTransacoes(groupId),
            ]);
            setMembros(membrosCarregados);
            setTransacoesDoGrupo(transacoesCarregadas);
        } catch (erro) {
            const mensagem = erro instanceof Error ? erro.message : 'Erro ao carregar dados do grupo';
            setErroGrupo(mensagem);
        } finally {
            setCarregandoMembros(false);
        }
    };

    const adicionarMembroPorEmail = async (groupId: string, email: string): Promise<void> => {
        setErroGrupo(null);
        const usuarioEncontrado: UsuarioBusca = await GroupService.buscarUsuarioPorEmail(email);
        await GroupService.adicionarMembro(groupId, usuarioEncontrado.id);
        await carregarMembros(groupId);
    };

    const removerMembro = async (groupId: string, membroId: string): Promise<void> => {
        setErroGrupo(null);
        await GroupService.removerMembro(groupId, membroId);
        await carregarMembros(groupId);
    };

    const selecionarGrupoExistente = (grupo: GrupoComRole) => {
        setGrupoAtivo(grupo);
    };

    const limparGrupoAtivo = () => {
        setGrupoAtivo(null);
        setMembros([]);
        setTransacoesDoGrupo([]);
        setErroGrupo(null);
    };

    return {
        grupoAtivo,
        meusGrupos,
        membros,
        transacoesDoGrupo,
        carregandoGrupo,
        carregandoMembros,
        carregandoMeusGrupos,
        erroGrupo,
        carregarMeusGrupos,
        criarGrupo,
        carregarMembros,
        adicionarMembroPorEmail,
        removerMembro,
        selecionarGrupoExistente,
        limparGrupoAtivo,
    };
};