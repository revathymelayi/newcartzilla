const express = require("express")
const logRoute = express()
const logCheck = require('../middleware/userLog')
const session = require('../config/session')
logRoute.use(session)
const hbs = require('express-handlebars')
logRoute.engine('hbs',hbs.engine({
    extname:'hbs',
    defaultLayout:'layout',
    layoutsDir:__dirname+'../../views/layouts/',
    partialsDir:__dirname + '../../views/partials'

}))
logRoute.set('views','./views/user')

const loginController = require('../controllers/loginController')

//signup

logRoute.get('/signup', logCheck.isLogin, loginController.signUp)
logRoute.post('/signup', loginController.createUser)
logRoute.get('/verify', loginController.verifyMail)

//signin
logRoute.get('/signin', logCheck.isLogin, loginController.signin)
logRoute.post('/signin', loginController.authenticate)

//forgot password
logRoute.get('/forgot-password',loginController.passwordRecovery);


module.exports =logRoute
