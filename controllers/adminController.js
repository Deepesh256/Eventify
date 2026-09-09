import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(400).json({
        message: "Invalid username",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    // Generate Admin JWT
    const token = jwt.sign(
      {
        adminId: admin._id.toString(),
        username: admin.username,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      message: "Login successful",

      admin: {
        id: admin._id,
        username: admin.username,
      },

      token,
    });
  } catch (error) {
    console.error(
      "Admin login error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};