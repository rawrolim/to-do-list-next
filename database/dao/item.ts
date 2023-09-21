import mongoose from '../database';

const ItemSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true
    },
    descricao: {
        type: String,
        required: false,
        defaul: ''
    },
    projetoId: {
        type: String,
        required: false,
        default: ''
    },
    comentarios: [],
    tempo: {
        type: Number,
        default: 0
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    concluido: {
        type: Boolean,
        default: false,
    }
});

const DB = mongoose.models.Item || mongoose.model('Item', ItemSchema);

export default { DB, ItemSchema };
