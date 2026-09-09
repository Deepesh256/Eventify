import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import { sendMail } from "../services/mailer.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================================================
// HELPER - SAFE USER
// ======================================================

const createSafeUser = (user) => {
  const safeUser = user.toObject();

  delete safeUser.password;
  delete safeUser.resetOtpHash;
  delete safeUser.resetOtpExpiresAt;
  delete safeUser.resetOtpVerified;

  return safeUser;
};

// ======================================================
// REGISTER USER
// POST /api/users/register
// ======================================================

router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      interests,
      department,
      year,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message:
          "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,

      department:
        department || "ALL",

      year:
        year || "ALL",

      interests: Array.isArray(interests)
        ? interests
        : [],
    });

    await newUser.save();

    const safeUser = createSafeUser(newUser);

    return res.status(201).json({
      message:
        "User registered successfully",

      user: safeUser,
    });
  } catch (error) {
    console.error(
      "REGISTER ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Registration failed",

      error: error.message,
    });
  }
});

// ======================================================
// LOGIN
// POST /api/users/login
// ======================================================

router.post("/login", async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    let passwordMatches = false;

    // Check whether password is already bcrypt hashed
    const passwordIsHashed =
      typeof user.password === "string" &&
      user.password.startsWith("$2");

    if (passwordIsHashed) {
      passwordMatches =
        await bcrypt.compare(
          password,
          user.password
        );
    } else {
      // Support old plaintext accounts once
      passwordMatches =
        password === user.password;

      // Automatically migrate old password to bcrypt
      if (passwordMatches) {
        user.password =
          await bcrypt.hash(
            password,
            10
          );

        await user.save();
      }
    }

    if (!passwordMatches) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET is missing"
      );

      return res.status(500).json({
        message:
          "Server authentication configuration error",
      });
    }

    const token = jwt.sign(
      {
        userId:
          user._id.toString(),

        email:
          user.email,
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "7d",
      }
    );

    const safeUser = createSafeUser(user);

    return res.status(200).json({
      message:
        "Login successful",

      user: safeUser,

      token,
    });
  } catch (error) {
    console.error(
      "LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Login failed",

      error: error.message,
    });
  }
});

// ======================================================
// FORGOT PASSWORD - SEND OTP
// POST /api/users/forgot-password
// ======================================================

router.post(
  "/forgot-password",
  async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          message:
            "Email is required",
        });
      }

      const normalizedEmail = email
        .trim()
        .toLowerCase();

      const user = await User.findOne({
        email: normalizedEmail,
      });

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      // Generate secure 6-digit OTP
      const otp = crypto
        .randomInt(
          100000,
          1000000
        )
        .toString();

      // Never store plain OTP in MongoDB
      const hashedOtp =
        await bcrypt.hash(
          otp,
          10
        );

      // Save OTP information
      user.resetOtpHash =
        hashedOtp;

      user.resetOtpExpiresAt =
        new Date(
          Date.now() +
            10 * 60 * 1000
        );

      user.resetOtpVerified =
        false;

      await user.save();

      // Send OTP
      try {
        await sendMail({
          to: user.email,

          subject:
            "Eventify Password Reset OTP",

          text:
            `Hello ${user.name}, your Eventify password reset OTP is ${otp}. This OTP expires in 10 minutes.`,

          html: `
            <div
              style="
                max-width: 520px;
                margin: 30px auto;
                padding: 30px;
                font-family: Arial, sans-serif;
                background: #ffffff;
                border-radius: 14px;
                border: 1px solid #e5e7eb;
              "
            >
              <h1
                style="
                  margin: 0 0 20px;
                  color: #111827;
                  font-size: 24px;
                "
              >
                Eventify
              </h1>

              <h2
                style="
                  color: #111827;
                  margin-bottom: 10px;
                "
              >
                Password Reset
              </h2>

              <p
                style="
                  color: #4b5563;
                  line-height: 1.6;
                "
              >
                Hello ${user.name || "User"},
              </p>

              <p
                style="
                  color: #4b5563;
                  line-height: 1.6;
                "
              >
                We received a request to reset
                your Eventify password.
              </p>

              <p
                style="
                  color: #4b5563;
                "
              >
                Your verification code is:
              </p>

              <div
                style="
                  margin: 24px 0;
                  padding: 20px;
                  text-align: center;
                  background: #f5f3ff;
                  border-radius: 12px;
                  color: #6d28d9;
                  font-size: 32px;
                  font-weight: bold;
                  letter-spacing: 8px;
                "
              >
                ${otp}
              </div>

              <p
                style="
                  color: #4b5563;
                  line-height: 1.6;
                "
              >
                This OTP will expire in
                <strong>10 minutes</strong>.
              </p>

              <p
                style="
                  color: #6b7280;
                  line-height: 1.6;
                  font-size: 14px;
                "
              >
                If you did not request a password
                reset, you can safely ignore this
                email.
              </p>

              <hr
                style="
                  margin: 25px 0;
                  border: none;
                  border-top: 1px solid #e5e7eb;
                "
              />

              <p
                style="
                  margin: 0;
                  color: #9ca3af;
                  font-size: 13px;
                "
              >
                Team Eventify
              </p>
            </div>
          `,
        });
      } catch (mailError) {
        // Remove OTP because email was not delivered
        user.resetOtpHash = null;
        user.resetOtpExpiresAt = null;
        user.resetOtpVerified = false;

        await user.save();

        console.error(
          "OTP MAIL ERROR:",
          mailError
        );

        return res.status(500).json({
          message:
            "Failed to send OTP",

          error:
            mailError.message,
        });
      }

      console.log(
        "✅ Password reset OTP sent to:",
        user.email
      );

      return res.status(200).json({
        message:
          "OTP sent successfully",
      });
    } catch (error) {
      console.error(
        "FORGOT PASSWORD ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to send OTP",

        error:
          error.message,
      });
    }
  }
);

// ======================================================
// VERIFY OTP
// POST /api/users/verify-reset-otp
// ======================================================

router.post(
  "/verify-reset-otp",
  async (req, res) => {
    try {
      const {
        email,
        otp,
      } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          message:
            "Email and OTP are required",
        });
      }

      const normalizedEmail = email
        .trim()
        .toLowerCase();

      const user = await User.findOne({
        email: normalizedEmail,
      });

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      if (
        !user.resetOtpHash ||
        !user.resetOtpExpiresAt
      ) {
        return res.status(400).json({
          message:
            "Please request a new OTP",
        });
      }

      if (
        new Date() >
        new Date(
          user.resetOtpExpiresAt
        )
      ) {
        user.resetOtpHash = null;

        user.resetOtpExpiresAt =
          null;

        user.resetOtpVerified =
          false;

        await user.save();

        return res.status(400).json({
          message:
            "OTP expired. Please request a new OTP",
        });
      }

      const otpMatches =
        await bcrypt.compare(
          otp.toString(),
          user.resetOtpHash
        );

      if (!otpMatches) {
        return res.status(400).json({
          message:
            "Invalid OTP",
        });
      }

      user.resetOtpVerified =
        true;

      await user.save();

      return res.status(200).json({
        message:
          "OTP verified successfully",
      });
    } catch (error) {
      console.error(
        "VERIFY OTP ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "OTP verification failed",

        error:
          error.message,
      });
    }
  }
);

// ======================================================
// RESET PASSWORD
// POST /api/users/reset-password
// ======================================================

router.post(
  "/reset-password",
  async (req, res) => {
    try {
      const {
        email,
        newPassword,
      } = req.body;

      if (
        !email ||
        !newPassword
      ) {
        return res.status(400).json({
          message:
            "Email and new password are required",
        });
      }

      if (
        newPassword.length < 6
      ) {
        return res.status(400).json({
          message:
            "Password must be at least 6 characters",
        });
      }

      const normalizedEmail = email
        .trim()
        .toLowerCase();

      const user = await User.findOne({
        email: normalizedEmail,
      });

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      if (
        !user.resetOtpVerified
      ) {
        return res.status(403).json({
          message:
            "Please verify OTP first",
        });
      }

      // Extra expiry check before allowing reset
      if (
        !user.resetOtpExpiresAt ||
        new Date() >
          new Date(
            user.resetOtpExpiresAt
          )
      ) {
        user.resetOtpHash = null;
        user.resetOtpExpiresAt = null;
        user.resetOtpVerified = false;

        await user.save();

        return res.status(400).json({
          message:
            "Password reset session expired. Please request a new OTP",
        });
      }

      user.password =
        await bcrypt.hash(
          newPassword,
          10
        );

      // Clear OTP data after successful reset
      user.resetOtpHash =
        null;

      user.resetOtpExpiresAt =
        null;

      user.resetOtpVerified =
        false;

      await user.save();

      return res.status(200).json({
        message:
          "Password reset successfully",
      });
    } catch (error) {
      console.error(
        "RESET PASSWORD ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to reset password",

        error:
          error.message,
      });
    }
  }
);

// ======================================================
// UPDATE INTERESTS
// PUT /api/users/update-interests/:id
// ======================================================

router.put(
  "/update-interests/:id",
  authMiddleware,
  async (req, res) => {
    try {
      if (
        req.user.userId !==
        req.params.id
      ) {
        return res.status(403).json({
          message:
            "You are not allowed to update these interests",
        });
      }

      const interests =
        Array.isArray(
          req.body.interests
        )
          ? req.body.interests
          : [];

      const user =
        await User.findByIdAndUpdate(
          req.params.id,
          {
            interests,
          },
          {
            new: true,
            runValidators: true,
          }
        ).select(
          "-password -resetOtpHash -resetOtpExpiresAt -resetOtpVerified"
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      return res.status(200).json({
        message:
          "Interests updated successfully",

        user,
      });
    } catch (error) {
      console.error(
        "INTEREST UPDATE ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Update failed",

        error:
          error.message,
      });
    }
  }
);

// ======================================================
// TEST MAIL
// GET /api/users/test-mail
// ======================================================

router.get(
  "/test-mail",
  async (req, res) => {
    try {
      // Send test email to configured sender account
      const testRecipient =
        process.env.EMAIL_USER;

      if (!testRecipient) {
        return res.status(500).json({
          message:
            "EMAIL_USER is not configured",
        });
      }

      await sendMail({
        to: testRecipient,

        subject:
          "Eventify Test Mail",

        text:
          "Email is working successfully",

        html:
          "<h2>✅ Eventify email is working successfully</h2>",
      });

      return res.status(200).json({
        message:
          "Mail sent successfully",
      });
    } catch (error) {
      console.error(
        "MAIL ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Mail failed",

        error:
          error.message,
      });
    }
  }
);

// ======================================================
// GET PROFILE
// GET /api/users/:id
// ======================================================

router.get(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      if (
        req.user.userId !==
        req.params.id
      ) {
        return res.status(403).json({
          message:
            "You are not allowed to access this profile",
        });
      }

      const user =
        await User.findById(
          req.params.id
        ).select(
          "-password -resetOtpHash -resetOtpExpiresAt -resetOtpVerified"
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      return res.status(200).json({
        user,
      });
    } catch (error) {
      console.error(
        "GET PROFILE ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch profile",

        error:
          error.message,
      });
    }
  }
);

// ======================================================
// UPDATE PROFILE
// PUT /api/users/:id
// ======================================================

router.put(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      if (
        req.user.userId !==
        req.params.id
      ) {
        return res.status(403).json({
          message:
            "You are not allowed to update this profile",
        });
      }

      const {
        name,
        department,
        year,
        interests,
      } = req.body;

      if (
        !name ||
        !name.trim()
      ) {
        return res.status(400).json({
          message:
            "Name is required",
        });
      }

      if (!department) {
        return res.status(400).json({
          message:
            "Department is required",
        });
      }

      if (!year) {
        return res.status(400).json({
          message:
            "Year is required",
        });
      }

      if (
        interests !== undefined &&
        !Array.isArray(interests)
      ) {
        return res.status(400).json({
          message:
            "Interests must be an array",
        });
      }

      const updatedUser =
        await User.findByIdAndUpdate(
          req.params.id,
          {
            name:
              name.trim(),

            department,

            year,

            interests:
              interests || [],
          },
          {
            new: true,
            runValidators: true,
          }
        ).select(
          "-password -resetOtpHash -resetOtpExpiresAt -resetOtpVerified"
        );

      if (!updatedUser) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      return res.status(200).json({
        message:
          "Profile updated successfully",

        user:
          updatedUser,
      });
    } catch (error) {
      console.error(
        "PROFILE UPDATE ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to update profile",

        error:
          error.message,
      });
    }
  }
);

export default router;