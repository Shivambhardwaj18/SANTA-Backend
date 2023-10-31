const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String },
  message: { type: String },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
});

const Enquiry = mongoose.model("Enquiry", enquirySchema);

module.exports = Enquiry;
