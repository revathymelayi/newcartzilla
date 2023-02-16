const mongoose = require("mongoose");
const Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;
const userSchema = new Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    
    phone: {
        type: Number,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    },
    is_verified: {
        type: Boolean,
        required: true
    },
    address:[
        {
            id: { type: Number },
            firstName: { type: String },
            lastName:{type:String},
            address1:{type:String},
            country:{type:String},
            city:{type:String},
            state:{type:String},
            zipCode:{type:Number},
            addrname:{type:String},
            default:{type:Boolean},
            _id:false,

        },
    ],
    cart: [
        {
          productId: { type: ObjectId },
          _id:false,
        },
      ],
      token: {
        type: String,
        default:"",
      },
      wallet:{
        type: Number,
        
      }

    

});

module.exports = mongoose.model('User',userSchema);