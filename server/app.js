const express = require('express')
const app = express()
const pgp = require('pg-promise')()
// const connectionString = 'postgres://localhost:5432/overpackersdb'
const mustacheExpress = require('mustache-express')
require('dotenv').config()
const connectionString = process.env.CONNECTION_STRING
const db = pgp(connectionString)

app.engine('mustache', mustacheExpress())
app.set('views', './views')
app.set('view engine', 'mustache')
app.use(express.urlencoded())

app.post('/add-item', (req, res) => {
    const { name, category } = req.body
    const quantity = parseInt(req.body.quantity)
    db.none('INSERT INTO items(name, category) VALUES($1, $2)', [name, category])
    .then(() => {
        res.redirect('/master-list')
    })
})

app.post('/update-item', (req,res) => {
    let itemId = parseInt(req.body.item_id)
    let isPacked = req.body.isPacked == "on" ? true : false
    
    db.none('UPDATE items SET is_packed = $1 WHERE item_id = $2', [isPacked, itemId])
    .then(() => {
        res.redirect('/')
    })
})

app.post('/pack-item', (req,res) => {
    let itemId = parseInt(req.body.item_id)
    let isPacked = true
    
    db.none('UPDATE items SET is_packed = $1 WHERE item_id = $2', [isPacked, itemId])
    .then(() => {
        res.redirect('/')
    })
})

app.post('/update-list', (req,res) => {
    let itemId = parseInt(req.body.item_id)
    let isOnList = true
    
    db.none('UPDATE items SET is_on_list = $1 WHERE item_id = $2', [isOnList, itemId])
    .then(() => {
        res.redirect('/master-list')
    })
})

app.post('/unpack', (req,res) => {
    let itemId = parseInt(req.body.item_id)
    let isPacked = false
    
    db.none('UPDATE items SET is_packed = $1 WHERE item_id = $2', [isPacked, itemId])
    .then(() => {
        res.redirect('/already-packed')
    })
})

app.post('/de-list', (req,res) => {
    let itemId = parseInt(req.body.item_id)
    let isOnList = false
    let isPacked = false
    
    db.none('UPDATE items SET is_on_list = $1, is_packed = $2 WHERE item_id = $3', [isOnList, isPacked, itemId])
    .then(() => {
        res.redirect('/already-packed')
    })
})

app.post('/delete-item', (req, res) => {
    const { itemId } = req.body
    db.none('DELETE FROM items WHERE item_id = $1;', [bookId])
    .then(() => {
        res.redirect('/')
    })
})

app.get('/', (req, res) => {
    db.any('SELECT item_id, name, category, is_on_list, is_packed, quantity FROM items WHERE is_on_list = true AND is_packed = false')
    .then((items) => {
        res.render('index', { items: items })
    })
})

app.get('/master-list', (req, res) => {
    db.any('SELECT item_id, name, category, is_on_list, quantity FROM items where is_on_list = false')
    .then((items) => {
        res.render('master-list', { items: items })
    })
})

app.get('/already-packed', (req, res) => {
    db.any('SELECT item_id, name, category, is_on_list, quantity FROM items where is_packed = true')
    .then((items) => {
        res.render('already-packed', { items: items })
    })
})

app.get('/add-item', (req, res) => {
    res.render('add-item')
  })



app.listen(3000,() => {
    console.log('Server is running...')
})