const express = require("express");
const router = express.Router();
const dataController = require("./data_controller");
const verifyToken = require("../../middleware/authMiddleware");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueFilename = uuidv4();
    cb(null, Date.now() + "-" + uniqueFilename + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

//Newsletter upload
router.post("/uploadLetter", dataController.uploadNewsletter);

//Newsletter getall
router.get("/getAllNewsLetter", dataController.getAllNewsLetter);

//Newsletter Delete
router.delete("/deleteEmail/:id", verifyToken, dataController.deleteEmail);

// Data upload route
router.post(
  "/upload",
  upload.fields([{ name: "image" }, { name: "body" }]),
  verifyToken,
  dataController.uploadProduct
);

//Get ALl Data
router.get("/getAll", dataController.getAllData);

// Edit data
router.put(
  "/update/:id",
  upload.fields([{ name: "newImages" }, { name: "body" }]),
  verifyToken,
  dataController.editData
);

// Define data
router.delete("/delete/:id", verifyToken, dataController.removeData);

// Send enquiry route
router.post("/send-enquiry", dataController.sendEnquiry);

// Get enquiry route
router.get("/all-enquiry", verifyToken, dataController.allEnquiry);

//Newsletter Delete
router.delete("/deleteEnquiry/:id", verifyToken, dataController.deleteEnquiry);

// Search products route
router.get("/search-products", dataController.searchProducts);

// Store contact data
router.post("/contact", dataController.storeContactData);

// Retrieve contact data
router.get("/contact", dataController.getContactData);

module.exports = router;

//Accessing Images: To serve these images to clients when your backend is hosted, you'll need to set up a route that handles image requests and sends the corresponding image file from your server. You can use the Express.js express.static middleware for this.Here's an example of how you can set up a route to serve images stored in the 'uploads' directory:
//app.use('/uploads', express.static('uploads'));
