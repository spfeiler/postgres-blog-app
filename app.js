const express = require('express')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const pgp = require('pg-promise')()
const path = require('path')

const app = express()

const connectionString = "postgres://localhost:5434/blogdb"
const db = pgp(connectionString)

console.log(db)

const VIEWS_PATH = path.join(__dirname, '/views')

app.use(bodyParser.urlencoded({extended: false}))

app.engine('mustache', mustacheExpress(VIEWS_PATH + '/partials', '.mustache'))

app.set('views', './views')

app.set('view engine', 'mustache')

app.get('/view-posts', (req, res) => {

  db.any('SELECT postid, title, body FROM posts')
  .then((posts) => {
    res.render('view-posts', {posts: posts})
  })
})

app.post('/add-posts', (req, res) => {

  let title = req.body.title
  let body = req.body.body

  db.one('INSERT INTO posts(title, body) VALUES($1, $2) RETURNING postid;', [title, body])
  .then((data) => {
    console.log(data)
    console.log("SUCCESS")
  }).catch(error => console.log(error))
  res.redirect('/view-posts')
})

app.get('/add-posts', (req, res) => {
  res.render('add-posts')
})

app.post('/delete-post', (req, res) => {
  let postid = parseInt(req.body.postid)

  db.none('DELETE FROM posts WHERE postid = $1', [postid])
  .then(() => {
    res.redirect('/view-posts')
  })
})

app.post('/edit', (req, res) => {
  let editpostid = req.body.editpostid
  console.log(req.body.editpostid)
  res.redirect(`/edit-post/${editpostid}`)
})

app.get('/edit-post/:editpostid', (req, res) => {
  let postid = req.params.editpostid
  console.log(postid)

  db.any('SELECT postid, title, body FROM posts WHERE postid = $1', [postid])
  .then((post) => {
    res.render('edit-post', {post: post})
  })
})

app.post('/edit-post', (req, res) => {

  let postid = parseInt(req.body.editpostid)
  let title = req.body.title
  let body = req.body.body

  db.one('UPDATE posts SET title = $2, body = $3 WHERE postid = $1 RETURNING *', [postid, title, body])
  .then((data) => {
    res.redirect('/view-posts')
    console.log(data)
    console.log("SUCCESS")
  }).catch(error => console.log(error))
})

app.listen(3000, () => {
  console.log("Server is running...")
})
