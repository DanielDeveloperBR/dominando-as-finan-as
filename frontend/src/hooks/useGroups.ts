import { useState } from "react";
import { GroupService } from "@/services/groupService";

export const useGroups = () => {

    const [loading, setLoading] = useState(false);

    const criarGrupo = async (nome: string) => {
        setLoading(true);
        try {
            return await GroupService.criarGrupo(nome);
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