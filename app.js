const express = require('express')
const app = express()
const pgp = require('pg-promise')()
const mustacheExpress = require('mustache-express')
require('dotenv').config()
const connectionString = process.env.CONNECTION_STRING
const db = pgp(connectionString)
const bcrypt = require('bcryptjs')

app.engine('mustache', mustacheExpress())
app.set('views', './views')
app.set('view engine', 'mustache')
app.use(express.urlencoded())

// add item to Master List
app.post('/add-item', (req, res) => {
    const { name, category } = req.body
    const quantity = parseInt(req.body.quantity)
    db.none('INSERT INTO items(name, category) VALUES($1, $2)', [name, category])
    .then(() => {
        res.redirect('/master-list')
    })
})

// Copy all items from Master List to individual list for a particular trip
app.post('/all-to-my-list', (req, res) => {
    let isOnList = true;
    db.none('UPDATE items SET is_on_list = $1', [isOnList])
    .then(() => {
        res.redirect('/')
    })
})

// Move all items on 'Already Packed' list back to Master List
app.post('/all-to-master-list', (req, res) => {
    let isPacked = false;
    let isOnList = false;
    let isCurrentlyPacked = true;
    db.none('UPDATE items SET is_packed = $1, is_on_list =$2 WHERE is_packed = $3', [isPacked, isOnList, isCurrentlyPacked])
    .then(() => {
        res.redirect('/')
    })
})

// Move individual item from current list to "Already Packed"
app.post('/pack-item', (req,res) => {
    let itemId = parseInt(req.body.item_id)
    let isPacked = true
    
    db.none('UPDATE items SET is_packed = $1 WHERE item_id = $2', [isPacked, itemId])
    .then(() => {
        res.redirect('/')
    })
})

// Move individual item from Master List to individual list for a particular trip
app.post('/update-list', (req,res) => {
    let itemId = parseInt(req.body.item_id)
    let isOnList = true
    
    db.none('UPDATE items SET is_on_list = $1 WHERE item_id = $2', [isOnList, itemId])
    .then(() => {
        res.redirect('master-list')
    })
})

// Move single item from "Already Packed" List back to individual list for a particular trip (the 'whoops, didn't mean to hit that button' button)
app.post('/unpack', (req,res) => {
    let itemId = parseInt(req.body.item_id)
    let isPacked = false
    
    db.none('UPDATE items SET is_packed = $1 WHERE item_id = $2', [isPacked, itemId])
    .then(() => {
        res.redirect('already-packed')
    })
})

// Move single item from "Already Packed" list back to Master List
app.post('/de-list-from-packed', (req,res) => {
    let itemId = parseInt(req.body.item_id)
    let isOnList = false
    let isPacked = false
    
    db.none('UPDATE items SET is_on_list = $1, is_packed = $2 WHERE item_id = $3', [isOnList, isPacked, itemId])
    .then(() => {
        res.redirect('already-packed')
    })
})

// Move single item from current-trip list back to Master List
app.post('/de-list-from-my-list', (req,res) => {
    let itemId = parseInt(req.body.item_id)
    let isOnList = false
    let isPacked = false
    
    db.none('UPDATE items SET is_on_list = $1, is_packed = $2 WHERE item_id = $3', [isOnList, isPacked, itemId])
    .then(() => {
        res.redirect('/')
    })
})

// Front page displays in-progress list for current trip
app.get('/', (req, res) => {
    db.any('SELECT item_id, name, category, is_on_list, is_packed, quantity FROM items WHERE is_on_list = true AND is_packed = false')
    .then((items) => {
        res.render('index', { items: items })
    })
})

// Get registration/login page
app.get('/auth', (req, res) => {
    res.render('auth')
})

// Register new user and store their password as a hash
app.post('/register', (req, res) => {
    const username = req.body.username
    const password = req.body.password

    bcrypt.genSalt(10, function (error, salt) {
        bcrypt.hash(password, salt, function (error, hash) {
            if(!error) {
                db.none('INSERT INTO users(username, password) VALUES($1, $2)', [username, hash])
                .then(() => {
                    const success = "User registered successfully!"
                    res.render('register', { success: success })
                })
            }
        })
    })
})

// Display of every item in DB
app.get('/master-list', (req, res) => {
    db.any('SELECT item_id, name, category, is_on_list, quantity FROM items')
    .then((items) => {
        res.render('master-list', { items: items })
    })
})


// Display of all items where is_packed = true
app.get('/already-packed', (req, res) => {
    db.any('SELECT item_id, name, category, is_on_list, quantity FROM items WHERE is_packed = true')
    .then((items) => {
        res.render('already-packed', { items: items })
    })
})


// Add new item to DB/Master List
app.get('/add-item', (req, res) => {
    res.render('add-item')
  })


// Server Listener
app.listen(3000,() => {
    console.log('Server is running...')
})