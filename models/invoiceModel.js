const mongoose = require('mongoose')
const Schema = mongoose.Schema;

ObjectId = Schema.ObjectId

const invoiceSchema = new Schema({
    invoiceId        :{
        type    : String,
        required:true
    },
    userId        :{
        type    : ObjectId,
        required:true
    },
    orderId        :{
        type    : ObjectId,
        required:true
    },
    date        :{
        type    : String,
        required:true
    },
    status        :{  
        type    : String, 
        required:true
    },   
}) 

const invoice = mongoose.model('invoice',invoiceSchema)

async function invoiceGeneration(userId,orderId) {
    const invoiceNumber = 'FRHCRT-'+Math.floor(Math.random()*(9999-1000+1)+1000);
    const data = {
        invoiceId : invoiceNumber,
        userId : userId,
        orderId : orderId,
        date : new Date().toISOString(),
        status : true,
    }
    const insertData = await invoice.insertMany(data)
    if(insertData)
        return insertData
    else
        return 'error'
}
module.exports = {
    invoice,
    invoiceGeneration
}
