const express = require("express");
const app = express();
const db = require('./config/database').connectDb()
const hbs = require('express-handlebars');
const path = require('path');

const userRoute = require('./routes/userRoute');
const logRoute =require('./routes/logRoute');
const adminloginRoute = require('./routes/adminloginRoute');
const adminRoute =require('./routes/adminRoute')
const nocache = require("nocache");

app.use(nocache());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs')
app.use(express.json()) //the data is converted into json and parsed
app.use(express.urlencoded({ extended: false })) //will convert the form data to json according to the data(if its string or an array)

app.use('/', userRoute);
app.use('/user',logRoute);
app.use('/admin/login',adminloginRoute);
app.use('/admin',adminRoute)







app.listen(3000, function () {
    console.log("Server is running...");
})



module.exports = app