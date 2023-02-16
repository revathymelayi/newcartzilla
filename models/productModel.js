const mongoose = require("mongoose");
const Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;
const productSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  category_id: {
    type: ObjectId,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  unit: {
    type: Number,
    required: true,
  },
  images: {
    type: Array,
  },
  description: {
    type: String,
  },
  thumbnail_image: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    required: true,
  },
});
module.exports = mongoose.model("product", productSchema);
