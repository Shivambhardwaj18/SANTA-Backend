const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema(
  {
    sku: { type: String },
    name: { type: String, required: [true, "Name field can't be empty"] },
    // price: { type: Number, required: [true, "Price field can't be empty"] },
    // discount: { type: Number },
    offerEnd: { type: Date },
    new: Boolean,
    rating: { type: Number },
    saleCount: { type: Number },
    category: [
      { type: String, required: [true, "Category field can't be empty"] },
    ],
    tag: [{ type: String, required: [true, "Tag field can't be empty"] }],
    image: [{ type: String, required: [true, "Image field can't be empty"] }],
    shortDescription: { type: String },
    fullDescription: { type: String },
  },
  {
    messages: {
      required: "{PATH} field can't be empty",
    },
  }
);

const Data = mongoose.model("Data", dataSchema);

module.exports = Data;
