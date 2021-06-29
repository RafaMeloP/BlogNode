//Importando dependências
    const express = require('express')
    const router = express.Router()
    const mongoose = require('mongoose')
    require('../models/Usuario')
    const Usuario = mongoose.model('usuarios')
    const bcrypt = require('bcryptjs')
    const passport = require('passport')

//Rotas
    router.get('/cadastro', (req,res) => {
        res.render('usuario/cadastro')
    })

    router.post('/cadastro', (req,res) => {
        erros = []
        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null)
            erros.push({texto: 'Nome inválido'})
        if(req.body.nome.length < 3)
            erros.push({texto: 'Nome muito curto'})
        if(!req.body.email || typeof req.body.email == undefined || req.body.email == null)
            erros.push({texto: 'E-mail inválido'})
        if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null)
            erros.push({texto: 'Senha inválida'})
        if(req.body.senha != req.body.senha2)
            erros.push({texto: 'As senhas estão diferentes'})
        if(erros.length > 0)
            res.render('usuario/cadastro', {erros: erros})
        else{
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(req.body.senha, salt, (err, hash) => {
                    if(err){
                        req.flash('error_msg', 'Não foi possível realizar o cadastro')
                        res.redirect('/')
                    }
                    else{
                        const novoUsuario = {
                            nome: req.body.nome,
                            email: req.body.email,
                            senha: hash
                        }
                        new Usuario(novoUsuario).save().then(() => {
                            req.flash('success_msg', 'Cadastrado com sucesso')
                            res.redirect('/')
                        }).catch(err => {
                            req.flash('error_msg', 'Erro interno')
                            res.redirect('/')
                        })
                    }
                })
            })
        }
    })

    router.get('/login', (req,res) => {
        res.render('usuario/login')
    })

    router.post('/login', (req,res, next) => {
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/usuario/login',
            failureFlash: true
        })(req,res,next)
    })

    router.get('/logout', (req, res) => {
        req.logout()
        req.flash('success_msg', 'Deslogado com sucesso')
        res.redirect('/')
    })

module.exports = router