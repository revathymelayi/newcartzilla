const express =require('express')
const adminloginRoute =express()
const session = require('../config/session')
const logCheck =require('../middleware/adminLog')
adminloginRoute.use(session)

adminloginRoute.set('views','./views/admin')

const adminController = require('../controllers/adminController')

//Login

adminloginRoute.get('/',logCheck.isAdminLogin,adminController.adminLogin)
adminloginRoute.post('/',adminController.authenticate)

module.exports=adminloginRoute
