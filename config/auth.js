const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')
const bcrypt = require('bcryptjs')

module.exports = passport => {
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'}, (email, senha, done) => {
        Usuario.findOne({email: email}).then(usuario => {
            if(!usuario)
                return done(null, false, {message: 'Usuário não existe'})
            bcrypt.compare(senha, usuario.senha, (erro, batem) => {
                if(batem)
                    return done(null, usuario)
                else
                    return done(null, false, {message: 'Senha incorreta'})
            })
        })
    }))

    passport.serializeUser((usuario, done) => done(null, usuario._id))
    passport.deserializeUser((id, done) => {
        Usuario.findById(id, (err, usuario) => done(err, usuario))
    })
}