//Importando dependências
    const express = require('express')
    const router = express.Router()
    const mongoose = require('mongoose')
    require('../models/Categoria')
    const Categoria = mongoose.model('categorias')
    require('../models/Postagem')
    const Postagem = mongoose.model('postagens')
    const {eAdmin} = require('../helpers/eAdmin')
    const multer = require('multer')
//Configurações
    //Multer
        let nomeImagem = ''

        const storage = multer.diskStorage(({
            destination: (req, file, cb) => {
                cb(null, 'public/uploads/')
            },
            filename: (req, file, cb) => {
                nomeImagem = Date.now() + file.originalname
                cb(null, nomeImagem) 
            }
        }))

        const upload = multer({storage})
//Rotas
    router.get('/', eAdmin, (req,res) => {
        res.redirect('/admin/postagens')
    })

    router.get('/categorias', eAdmin, (req,res) => {
        Categoria.find().sort({_id: 'desc'}).lean().then(categorias => {
            res.render('admin/categorias', {categorias: categorias})
        }).catch(err => {
            req.flash('error_msg', 'Erro interno ao acessar as categorias')
            res.redirect('/admin/')
        })
    })

    router.get('/categorias/addcategorias', eAdmin, (req,res) => {
        res.render('admin/addcategorias')
    })

    router.post('/categorias/addcategorias', eAdmin, (req,res) => {
        let erros =[]
        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null)
            erros.push({texto: 'Nome inválido'})
        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null)
            erros.push({texto: 'Slug inválido'})
        if(req.body.nome.length < 3)
            erros.push({texto: 'Nome muito curto'})
        if(erros.length > 0)
            res.render('admin/addcategorias', {erros: erros})
        else{
            const novaCategoria = {
                nome: req.body.nome,
                slug: req.body.slug
            }
            new Categoria(novaCategoria).save().then(() => {
                req.flash('success_msg', 'Categoria adicionada com sucesso')
                res.redirect('/admin/categorias')
            }).catch(err => {
                req.flash('error_msg', 'Erro ao adicionar a categoria')
            })
        }
    })

    router.get('/categorias/edit/:id', eAdmin, (req,res) => {
        Categoria.findOne({_id: req.params.id}).lean().then(categoria => {
            res.render('admin/editcategorias', {categoria: categoria})
        }).catch(err => {
            req.flash('error_msg', 'Essa categoria não existe')
            res.redirect('/admin/categorias')
        })
    })

    router.post('/categorias/edit', eAdmin, (req,res) => {
        erros = []
        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null)
            erros.push({texto: 'Nome inválido'})
        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null)
            erros.push({texto: 'Slug inválido'})
        if(req.body.nome.length < 3)
            erros.push({texto: 'Nome muito curto'})
        if(erros.length > 0)
            res.render('admin/editcategorias')
        else{
            Categoria.findOne({_id: req.body.id}).then(categoria => {
                categoria.nome = req.body.nome
                categoria.slug = req.body.slug

                categoria.save().then(() => {
                    req.flash('success_msg', 'Categoria editada com sucesso')
                    res.redirect('/admin/categorias')
                }).catch(err => {
                    req.flash('error_msg', 'Erro interno ao editar a categoria')
                    res.redirect('/admin/categorias')
                })
            }).catch(err => {
                req.flash('error_msg', 'Não foi possível editar a categoria')
                res.redirect('/admin/categorias')
            })
        }
    })

    router.post('/categorias/deletar', eAdmin, (req,res) => {
        Categoria.remove({_id: req.body.id}).then(() => {
            req.flash('success_msg', 'Categoria deletada com sucesso')
            res.redirect('/admin/categorias')
        }).catch(err => {
            req.flash('error_msg', 'Erro ao deletar a categoria')
            res.redirect('/admin/categorias')
        })
    })

    router.get('/postagens', eAdmin, (req,res) => {
        Postagem.find().sort({data: 'desc'}).populate('categoria').lean().then(postagens => {
            res.render('admin/postagens', {postagens:postagens})
        }).catch(err => {
            req.flash('error_msg', 'Erro ao listar as postagens')
            res.redirect('/admin')
        })
    })

    router.get('/postagens/add', eAdmin, (req,res) => {
        Categoria.find().lean().then(categorias => {
            res.render('admin/addpostagens', {categorias: categorias})
        }).catch(err => {
            req.flash('error_msg', 'Erro interno')
            res.redirect('/admin/postagens')
        })
    })

    router.post('/postagens/add', upload.single('img'), eAdmin, (req,res) => {
        erros = []
        if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null)
            erros.push({texto: 'Título inválido'})
        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null)
            erros.push({texto: 'Slug inválido'})
        if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null)
            erros.push({texto: 'Descrição inválida'})
        if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null)
            erros.push({texto: 'Conteúdo inválido'})
        if(req.body.categoria == 0)
            erros.push({texto: 'Nenhuma categoria criada'})
        if(erros.length > 0)
            res.render('admin/addpostagens', {erros: erros})
        else{
            const novaPostagem = {
                titulo: req.body.titulo,
                slug: req.body.slug,
                descricao: req.body.descricao,
                conteudo: req.body.conteudo,
                categoria: req.body.categoria,
                img: `/uploads/${nomeImagem}`
            }
            new Postagem(novaPostagem).save().then(() => {
                req.flash('success_msg', 'Categoria criada com sucesso')
                res.redirect('/admin/postagens')
            }).catch(err => {
                req.flash('error_msg', 'Erro interno')
                res.redirect('/admin/postagens')
            })
        }
    })

    router.get('/postagens/edit/:id', eAdmin, (req,res) => {
        Postagem.findOne({_id: req.params.id}).lean().then(postagem => {
            Categoria.find().lean().then(categorias => {
                res.render('admin/editpostagens', {postagem:postagem, categorias: categorias})
            }).catch(err => {
                req.flash('error_msg', 'Erro interno')
                res.redirect('/admin/postagens')
            })
        }).catch(err => {
            req.flash('error_msg', 'Essa postagem não existe')
            res.redirect('/admin/postagens')
        })
    })

    router.post('/postagens/edit', eAdmin, (req,res) => {
        erros = []
        if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null)
            erros.push({texto: 'Título inválido'})
        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null)
            erros.push({texto: 'Slug inválido'})
        if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null)
            erros.push({texto: 'Descrição inválida'})
        if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null)
            erros.push({texto: 'Conteúdo inválido'})
        if(req.body.categoria == 0)
            erros.push({texto: 'Nenhuma categoria criada'})
        if(erros.length > 0)
            res.render('admin/editpostagens', {erros: erros})
        else{
            Postagem.findOne({_id: req.body.id}).then(postagem => {
                postagem.titulo = req.body.titulo
                postagem.slug = req.body.slug
                postagem.descricao = req.body.descricao
                postagem.conteudo = req.body.conteudo
                postagem.categoria = req.body.categoria

                postagem.save().then(() => {
                    req.flash('success_msg', 'Categoria editada com sucesso')
                    res.redirect('/admin/postagens')
                }).catch(err => {
                    req.flash('error_msg', 'Erro interno')
                    res.redirect('/admin/postagens')
                })
            }).catch(err => {
                req.flash('error_msg', 'Houve um erro ao editar a postagem')
                res.redirect('/admin/postagens')
            })
        }
    })

    router.post('/postagens/deletar', eAdmin, (req,res) => {
        Postagem.remove({_id: req.body.id}).then(() => {
            req.flash('success_msg', 'Postagem deletada com sucesso')
            res.redirect('/admin/postagens')
        }).catch(err => {
            req.flash('error_msg', 'Erro ao deletar a postagem')
            res.redirect('/admin/postagens')
        })
    })

module.exports = router