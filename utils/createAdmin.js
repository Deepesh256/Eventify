import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";

try {
  await mongoose.connect(process.env.MONGO_URI);

  console.log("✅ MongoDB Connected");

  const existing = await Admin.findOne({
    username: process.env.ADMIN_USERNAME,
  });

  if (existing) {
    console.log("⚠️ Admin already exists");
  } else {
    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD,
      10
    );

    await Admin.create({
      username: process.env.ADMIN_USERNAME,
      password: hashedPassword,
    });

    console.log("✅ Admin created successfully");
  }
} catch (error) {
  console.error("❌ Error creating admin:", error);
} finally {
  await mongoose.disconnect();
}