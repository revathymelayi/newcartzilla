const mongoose = require("mongoose");
const Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;
const orderSchema = new Schema({
  userId: {
    type: ObjectId,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  product: [
    {
      id: { type: ObjectId },
      name: { type: String },
      image: { type: String },
      amount: { type: Number },
      quantity: { type: Number },
    },
  ],
  orderId: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },

  status: {
    //1-processing, 2-dispatched,3-out for delivery,3-delievered,4-failed,5-cancelled
    type: String,
    required: true,
  },

  payment_method: {
    //1-razorPay 2-Card, 3-Cash on delivery
    type: String,
    required: true,
  },
  addressId: {
    type: Number,
    required: true,
  },
  
  total:{
    type:Number,
    required:true,
  },
  couponAmount:{
    type:Number,
    required:true,
  },
  actualAmount:{
    type:Number,
    required:true,
  },
});
module.exports = mongoose.model("order", orderSchema);
