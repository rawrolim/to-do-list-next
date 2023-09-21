import mongoose from '../database';

const ProjetoSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    concluido: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
});

const DB = mongoose.models.Projeto || mongoose.model('Projeto', ProjetoSchema);

export default { DB, ProjetoSchema };
