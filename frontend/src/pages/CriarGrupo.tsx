import { useState } from "react";
import { useGroups } from "@/hooks/useGroups";

export function CriarGrupo() {

    const [nome, setNome] = useState("");

    const { criarGrupo, loading } = useGroups();

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        await criarGrupo(nome);
        setNome("");

    };

    return (

        <form onSubmit={handleSubmit}>

            <h2>Criar grupo</h2>

            <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome do grupo"
            />

            <button disabled={loading}>
                Criar
            </button>
            <a href="/dashboard">Voltar</a>

        </form>


    );

}