const mongoose = require("mongoose");
const Data = require("../../model/data.model");
const News = require("../../model/news.model");
const Enquiry = require("../../model/enquiry.model");
const Contact = require("../../model/contact.model");
const baseURL = require("../../common/common");
const nodemailer = require("nodemailer");
const fs = require("fs");

exports.uploadNewsletter = async (req, res) => {
  try {
    const email = req.body.email;
    if (email) {
      const EmailData = {
        email: email,
      };

      await new News(EmailData).save();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: `${baseURL.Email.EMAIL}`,
          pass: `${baseURL.Email.PASSWORD}`,
        },
      });

      const mailOptions = {
        from: `${baseURL.Email.EMAIL}`,
        to: email,
        subject: "Thank You for Subscribing",
        text: "Thank you for subscribing to our newsletter!",
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          res
            .status(500)
            .json({ message: "Error sending confirmation email." });
        } else {
          res
            .status(200)
            .json({ message: "Email and confirmation sent successfully." });
        }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.getAllNewsLetter = async (req, res) => {
  try {
    const allData = await News.find();

    res.status(200).json({ data: allData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.deleteEmail = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);

    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Only admin users can delete Email." });
    }

    const deletedEmail = await News.findByIdAndDelete(id);

    if (!deletedEmail) {
      return res.status(404).json({ message: "Email not found." });
    }

    res.status(200).json({ message: "Deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.uploadProduct = async (req, res) => {
  try {
    const newDataString = req.body.body;

    const newData = JSON.parse(newDataString);

    console.log(req);

    console.log(req.files);

    if (req.files) {
      const imagePaths = req.files.image.map((file) => file.path);
      const fullImageUrls = imagePaths.map(
        (path) => `${baseURL.BaseURL.URL}/${path}`
      );

      newData.image = fullImageUrls;
    }

    const data = new Data(newData);

    await data.save();

    res.status(200).json({ message: "Data uploaded successfully.", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.getAllData = async (req, res) => {
  try {
    const allData = await Data.find();

    res.status(200).json({ data: allData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.editData = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = JSON.parse(req.body.body);
    console.log(id, updatedData);

    const data = await Data.findByIdAndUpdate(id, updatedData, { new: true });

    if (!data) {
      return res.status(404).json({ message: "Data not found." });
    }

    if (updatedData.imagesToDelete && updatedData.imagesToDelete.length > 0) {
      updatedData.imagesToDelete.forEach((deletedImage) => {
        const filename = deletedImage.substring(
          deletedImage.lastIndexOf("/") + 1
        );

        const imagePath = filename;
        console.log(imagePath);

        fs.unlinkSync(imagePath);

        const index = data.image.indexOf(deletedImage);
        if (index !== -1) {
          data.image.splice(index, 1);
        }
      });
    }

    if (req.files && req.files.newImages) {
      const newImages = req.files.newImages.map((file) => file.path);
      const fullImageUrls = newImages.map(
        (path) => `${baseURL.BaseURL.URL}/${path}`
      );
      data.image = data.image.concat(fullImageUrls);
    }

    await data.save();

    res.status(200).json({ message: "Data updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.removeData = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Data.findById(id);

    if (!data) {
      return res.status(404).json({ message: "Data not found." });
    }

    if (data.image && data.image.length > 0) {
      data.image.forEach((imagePath) => {
        const filename = imagePath.substring(imagePath.lastIndexOf("/") + 1);

        const imagePathToDelete = `${filename}`;

        if (fs.existsSync(imagePathToDelete)) {
          fs.unlinkSync(imagePathToDelete);
        }
      });
    }

    await Data.findByIdAndRemove(id);

    res.status(200).json({ message: "Data removed successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.sendEnquiry = async (req, res) => {
  try {
    const { name, phoneNumber, email, message, productId, productName } =
      req.body;

    const enquiry = new Enquiry({
      name,
      phoneNumber,
      email,
      message,
      productId,
      productName,
    });

    await enquiry.save();

    res.status(200).json({ message: "Enquiry sent successfully.", enquiry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.allEnquiry = async (req, res) => {
  try {
    const allData = await Enquiry.find();

    res.status(200).json({ data: allData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.deleteEnquiry = async (req, res) => {
  try {
    const id = req.params.id;

    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Only admin users can delete Enquiry." });
    }

    const deleteEnquiry = await Enquiry.findByIdAndDelete(id);

    if (!deleteEnquiry) {
      return res.status(404).json({ message: "Enquiry not found." });
    }

    res.status(200).json({ message: "Deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const { searchTerm } = req.query;
    let products;

    if (mongoose.Types.ObjectId.isValid(searchTerm)) {
      products = await Data.find({ _id: searchTerm });
    } else {
      const regex = new RegExp(searchTerm, "i");
      products = await Data.find({ name: { $regex: regex } });
    }

    res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.storeContactData = async (req, res) => {
  try {
    const { name, subject, email, message } = req.body;
    const contact = new Contact({ name, subject, email, message });
    await contact.save();
    res.status(200).json({ message: "Contact data saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getContactData = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
