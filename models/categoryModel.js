const mongoose        = require('mongoose')
const categorySchema  = new mongoose.Schema({
    name    :{
        type     : String,
        required :true
    },
    image    :{
        type     : String,
        required :true
    },
    offer    :{
        type     : Number,
        
    },
    status    :{
        type     : Boolean,
        required :true
    },
})

module.exports  = mongoose.model('category',categorySchema)
