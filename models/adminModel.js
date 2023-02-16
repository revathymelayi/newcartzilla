const mongoose      = require('mongoose')
const adminSchema   = new mongoose.Schema({
    first_name  : {
        type    : String,
        required: true,
    },
    last_name  : {
        type    : String,
        required: true,
    },
    email  : {
        type    : String,
        required: true,
    },
    password  : {
        type    : String,
        required: true,
    },
    status  : {
        type    : String,
        required: true,
    }
})

module.exports  = mongoose.model('admin',adminSchema)