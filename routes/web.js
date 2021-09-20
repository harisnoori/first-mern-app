const express = require('express')
const router = express.Router()
const path = require('path')
const blogs = require('../data/blogs')

// default view
router.get('/', (req, res) => {
    res.render('home')
})

router.get('/home', (req, res) => {
    res.render('home')
})

router.get('/add-blog', (req, res) => {
    res.render('add_blog')
})

router.post('/add-blog', (req, res) => {
    // console.log(req)
    res.send('jnjknjn')
})

router.get('/blogs', (req, res) => {
    // res.sendFile(path.join(__dirname, '../public/blogs.html'))
    res.render('blogs', {
        blogs: blogs
    })
})

// router.get('/about', (req, res) => {
//     res.sendFile(path.join(__dirname, '../public/about.html'))
// })

router.get('/blog/:id', (req, res) => {
    blog = blogs.filter((e) => {
        return e.id == req.params.id
    })
    
    res.render('blog', {
        title: blog[0].title,
        content: blog[0].content,
    })
})

module.exports = router;