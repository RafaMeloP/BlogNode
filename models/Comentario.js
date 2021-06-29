const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Comentario = new Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'usuarios',
        required: true
    },
    postagem: {
        type: Schema.Types.ObjectId,
        ref: 'postagens',
        required: true
    },
    conteudo: {
        type: String,
        required: true
    }
})

mongoose.model('comentarios', Comentario)
