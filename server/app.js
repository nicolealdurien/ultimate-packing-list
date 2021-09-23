const express = require('express')
const app = express()
const pgp = require('pg-promise')()
const connectionString = 'postgres://localhost:5432/overpackersdb'
const db = pgp(connectionString)
const mustacheExpress = require('mustache-express')

app.engine('mustache', mustacheExpress())
app.set('views', './views')
app.set('view engine', 'mustache')
app.use(express.urlencoded())

// db.any('SELECT item_id, name, subcategory, is_on_list, quantity FROM items')
//     .then((items) => {
//         console.log(items)
//     })

app.get('/', (req, res) => {
    db.any('SELECT item_id, name, subcategory, is_on_list, quantity FROM items')
    .then((items) => {
        res.render('index', { items: items })
    })
})




app.listen(3000,() => {
    console.log('Server is running...')
})