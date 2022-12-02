const express = require('express')

const bodyParser = require('body-parser');
// const { getDate } = require('./date');
const date = require(__dirname + '/date.js')
const mongoose = require('mongoose')
const _ = require('lodash')
mongoose.connect('mongodb+srv://admin-jerry:test123@cluster0.awnf5og.mongodb.net/todoDB?retryWrites=true&w=majority')

const itemSchema = new mongoose.Schema({
    name: String
})

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
})

const Todo = mongoose.model('Todo', itemSchema)
const List = mongoose.model('List', listSchema)

const item1 = new Todo({
    name: 'Welcome to your Todo list'
})
const item2 = new Todo({
    name: 'Press the + button to add to list'
})
const item3 = new Todo({
    name: 'Press this button to delete'
})
const items = [item1, item2, item3]

// Todo.deleteMany({ name: 'Press the + button to add to list' }, err => console.log("deleted All"))

const app = express()


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/static'))
// let todos = []
let work = []
app.listen(process.env.PORT || 3000, () => console.log('Server running'))
app.get('/', (req, res) => {
    const day = date.getDate()
    Todo.find((err, records) => {
        if (err) { console.log(err) }
        else if (records.length === 0) {
            Todo.insertMany(items, err => {
                if (err) { console.log(err) }
                else { console.log('All items successfully added') }

            })
            res.redirect('/')
        }
        res.render('todo.ejs', { day: day, todo: records, type: 'normal' })
    })
})

app.post('/', (req, res) => {
    // console.log(req.body)
    // if (req.body.list === 'work') {


    //     if (req.body.newtodo.length > 0) {
    //         let workTodo = new Todo({
    //             name: req.body.newtodo
    //         })
    //         workTodo.save()

    //     }

    //     res.redirect('/work')
    // }
    // console.log(req.body)
    if (req.body.list === 'normal') {
        if (req.body.newtodo.length > 0) {
            let newTodo = new Todo({
                name: req.body.newtodo
            })
            newTodo.save()

        }

        res.redirect('/')
    }
    else if (req.body.newtodo.length > 0) {
        List.findOne({ name: req.body.list }, (err, record) => {
            // console.log(req.body.newtodo)
            // console.log(record)
            record.items.push({ name: req.body.newtodo })
            record.save()
            // console.log(record.items)
        })
        res.redirect(`/${req.body.list}`)
    }
    else { res.redirect(`/${req.body.list}`) }

})


app.get('/:list', (req, res) => {
    let todoList = _.capitalize(req.params.list)
    // console.log(todoList)
    List.findOne({ name: todoList }, (err, record) => {
        // console.log(record)
        // console.log(record.items)
        if (!record) {
            const list = new List({
                name: todoList,
                items: items
            })
            list.save()
            res.redirect(`/${req.params.list}`)
        }

        else { res.render('todo.ejs', { day: `${todoList} List`, todo: record.items, type: todoList }) }
    })

})
app.get('/about', (req, res) => {
    res.render('about')

})

app.post('/delete', (req, res) => {
    // console.log(req.body)
    if (req.body.listname === 'normal') {
        Todo.findByIdAndRemove(req.body.todo, err => console.log(err))
        res.redirect('/')
    }
    else {
        List.findOneAndUpdate({ name: req.body.listname }, { $pull: { items: { _id: req.body.todo } } }, (err, res) => console.log('Deleted '))
        res.redirect(`/${req.body.listname}`)
    }
})


