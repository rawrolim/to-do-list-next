import comentarioModel from "./comentarioModel";

interface itemModel{
    _id: string;
    titulo: string;
    descricao: string;
    tempo: number;
    createdAt: Date;
    updatedAt: Date;
    concluido: boolean;
    comentarios: comentarioModel[];
}

export default itemModel