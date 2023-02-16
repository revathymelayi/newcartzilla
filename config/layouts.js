const hbs     = require('express-handlebars')
const express = require("express")
const app     = express()

const layouts = app.engine('hbs',hbs.engine({
    extname: 'hbs',
    defaultLayout:'layout',
    layoutsDir:__dirname +'../../views/layouts/',
    partialsDir : __dirname + '../../views/partials/'

}))
module.exports = layouts