//Importando dependências
    const express = require('express')
    const app = express()
    const mongoose = require('mongoose')
    const handlebars = require('express-handlebars')
    const flash = require('connect-flash')
    const session = require('express-session')
    const path = require('path')
    const admin = require('./routes/admin')
    const usuario = require('./routes/usuario')
    require('./models/Postagem')
    const Postagem = mongoose.model('postagens')
    require('./models/Categoria')
    const Categoria = mongoose.model('categorias')
    require('./models/Comentario')
    const Comentario = mongoose.model('comentarios')
    const passport = require('passport')
    require('./config/auth')(passport)
    const db = require('./config/auth')

//Configurações
    //session
        app.use(session({
            secret: 'BlogNode',
            resave: true,
            saveUninitialized: true
        }))
        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())
    //Middlewares
        app.use((req, res, next) => {
            res.locals.error_msg = req.flash('error_msg')
            res.locals.success_msg = req.flash('success_msg')
            res.locals.error = req.flash('error')
            res.locals.user = req.user || null
            next()
        })
    //Capturar dados de formulários
        app.use(express.urlencoded({ extended: true }))
        app.use(express.json())
    //Handlebars
        app.engine('handlebars', handlebars({ defaultLayout: 'main' }))
        app.set('view engine', 'handlebars')
    //Mongoose
        mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(() => console.log('Conectado com sucesso')).catch(err => console.log('Erro ao se conectar: ' + err))
    //Public
        app.use(express.static(path.join(__dirname, 'public')))

//Rotas
    app.get('/', (req, res) => {
        Postagem.find().populate('categoria').sort({ data: 'desc' }).lean().then(postagens => {
            res.render('index', { postagens: postagens })
        }).catch(err => {
            console.log(err)
            res.redirect('/404')
        })
    })

    app.get('/postagem/:slug', (req, res) => {
        Postagem.findOne({ slug: req.params.slug }).populate('categoria').lean().then(postagem => {
            Comentario.find({postagem: postagem._id}).populate('usuario').sort({_id: 'desc'}).lean().then(comentario => {
                res.render('postagem/index', { postagem, comentario })
            }).catch(err => {
                req.flash('error_msg', 'Erro interno')
                res.redirect('/')
            })
        }).catch(err => {
            req.flash('error_msg', 'Essa postagem não existe')
            res.redirect('/')
        })
    })

    app.get('/categorias', (req, res) => {
        Categoria.find().sort({ nome: 'asc' }).lean().then(categorias => {
            res.render('categorias/index', { categorias: categorias })
        }).catch(err => {
            req.flash('error_msg', 'Erro interno')
            res.redirect('/')
        })
    })

    app.get('/categorias/postagens/:slug', (req, res) => {
        Categoria.findOne({ slug: req.params.slug }).lean().then(categoria => {
            Postagem.find({ categoria: categoria._id }).populate('categoria').sort({ data: 'desc' }).lean().then(postagens => {
                res.render('categorias/postagens', { postagens: postagens, categoria: categoria })
            }).catch(err => {
                req.flash('error_msg', 'Erro interno')
                res.redirect('/categorias')
            })
        }).catch(err => {
            req.flash('error_msg', 'Essa categoria não existe')
            res.redirect('/categorias')
        })
    })

    app.post('/coment/:id', (req, res) => {
        Postagem.findOne({_id: req.params.id}).then(postagem => {
            if(req.user == undefined){
                req.flash('error_msg', 'Você deve estar logado para comentar')
                res.redirect(`/postagem/${postagem.slug}`)
            }
            else{
                const novoComentario = {
                    usuario: req.user._id,
                    postagem: req.params.id,
                    conteudo: req.body.comentario
                }
                new Comentario(novoComentario).save().then(() => {
                    req.flash('success_msg', 'Comentário publicado com sucesso')
                    res.redirect(`/postagem/${postagem.slug}`)
                }).catch(err => {
                    req.flash('error_msg', 'Erro ao publicar comentário')
                    res.redirect(`/postagem/${postagem.slug}`)
                })
            }
        }).catch(err => {
            req.flash('error_msg', 'Erro interno')
            res.redirect('/')
        })
    })

    app.get('/404', (req, res) => {
        res.send('Erro 404')
    })

    app.use('/admin', admin)

    app.use('/usuario', usuario)

//Outros
    const PORT = process.env.PORT || 8000
    app.listen(PORT)