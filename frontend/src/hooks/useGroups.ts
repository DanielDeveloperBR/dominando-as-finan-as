import { useState } from "react";
import { GroupService } from "@/services/groupService";

export const useGroups = () => {

    const [loading, setLoading] = useState(false);

    const criarGrupo = async (nome: string) => {
        setLoading(true);
        try {
            return await GroupService.criarGrupo(nome);
            alert("Grupo criado com sucesso!");
        } finally {
            setLoading(false);
        }
    };

    const adicionarMembro = async (groupId: string, userId: string) => {

        return GroupService.adicionarMembro(groupId, userId);

    };

    return {
        criarGrupo,
        adicionarMembro,
        loading
    };
};