const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../model/user.model");
const secretKey = require("../../common/common");

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Check if the user account is disabled
    if (user.disable) {
      return res.status(401).json({
        message: "User account is disabled. Please contact the admin.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      secretKey.JwtKey.JWTKEY,
      {
        expiresIn: "12h",
      }
    );

    // Send the token in the response
    res.status(200).json({ token, user: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.register = async (req, res) => {
  const { name, username, role } = req.body;

  const password = req.body.password ? req.body.password : "SANTA123";

  // Check if the request is coming from an admin user
  if (req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ message: "Only admin users can register new users." });
  }

  try {
    // Check if the username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username is already taken." });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with the provided role
    const user = new User({ name, username, password: hashedPassword, role });
    const result = await user.save();

    res
      .status(200)
      .json({ message: "User registered successfully.", user: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.modifyUser = async (req, res) => {
  const { userId } = req.params;
  const { disable } = req.body;

  // Check if the request is coming from an admin user
  if (req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ message: "Only admin users can modify users." });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    let message;

    if (disable) {
      // Disable the user
      if ((user.disable = true)) {
        await user.save();
        message = "User disabled successfully.";
      } else {
        user.disable = false;
        await user.save();
        message = "User Enabled successfully.";
      }
    } else {
      // Delete the user
      await User.findByIdAndDelete(userId);
      message = "User deleted successfully.";
    }

    res.status(200).json({ message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.getUserList = async (req, res) => {
  // Check if the request is coming from an admin user
  if (req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ message: "Only admin users can access the user list." });
  }

  try {
    // Retrieve the list of all users from the database
    const userList = await User.find({}, "-password"); // Exclude the password field

    res.status(200).json(userList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.changePassword = async (req, res) => {
  const { username } = req.params;
  const { newPassword, lastPassword } = req.body;

  try {
    const findUser = {
      username: username,
    };
    const user = await User.findOne(findUser);
    console.log(user);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the request is coming from an admin or an agent
    if (req.user.role === "ADMIN") {
      // Admin can change the password without providing the last password
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      return res
        .status(200)
        .json({ message: "Password changed successfully." });
    } else if (req.user.role === "AGENT") {
      // Agent needs to provide the last password for verification
      const isPasswordValid = await bcrypt.compare(lastPassword, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({ message: "Last password is incorrect." });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      return res
        .status(200)
        .json({ message: "Password changed successfully." });
    } else {
      return res.status(403).json({ message: "Access denied." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.agentChangePassword = async (req, res) => {
  const { username } = req.params;
  const { newPassword, lastPassword } = req.body;

  try {
    const findUser = {
      username: username,
    };
    const user = await User.findOne(findUser);
    console.log(user);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isPasswordValid = await bcrypt.compare(lastPassword, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Last password is incorrect." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

exports.editUserDetails = async (req, res) => {
  const { userId } = req.params;
  const { name, role } = req.body;

  // Check if the request is coming from an admin user
  if (req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ message: "Only admin users can edit user details." });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (name) {
      user.name = name;
    }
    if (role) {
      user.role = role;
    }
    await user.save();

    res.status(200).json({ message: "User details updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};
