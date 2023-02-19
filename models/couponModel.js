const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;
const couponSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  user: [
    {
      userId: ObjectId,
      _id:false
    },

  ],
  status: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.model("coupon", couponSchema);
