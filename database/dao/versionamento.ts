import mongoose from '../database';

const VersionamentoSchema = new mongoose.Schema({
    versao: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const DB = mongoose.models.Versionamento || mongoose.model('Versionamento', VersionamentoSchema);

export default { DB, VersionamentoSchema };
