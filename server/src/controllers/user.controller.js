import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";


const loginUser = async (req, res) => {
  const { email, password } = req.body ?? {};

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return res.status(400).json({
      message: "Email and password are required.",
    });
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not configured.");

    return res.status(500).json({
      message: "Server authentication is not configured.",
    });
  }

  try {
    // Password is select:false in the User model, so explicitly include it.
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    // Use the same response for an unknown email and a wrong password.
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const passwordIsValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
});

    return res.status(200).json({
      message: "Login successful.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "An internal server error occurred.",
    });
  }
};


const registerUser = async (req, res) => {
  const { name, email, password } = req.body ?? {};

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !password
  ) {
    return res.status(400).json({
      message: "Name, email, and password are required",
    });
  }

  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedName.length < 2 || normalizedName.length > 100) {
    return res.status(400).json({
      message: "Name must be between 2 and 100 characters",
    });
  }

  // Basic format check. Consider a dedicated email
  // validation library for production.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({
      message: "Please provide a valid email address",
    });
  }

  if (normalizedEmail.length > 254) {
    return res.status(400).json({
      message: "Email address is too long",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters",
    });
  }

  if (Buffer.byteLength(password, "utf8") > 72) {
    return res.status(400).json({
      message: "Password is too long",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    // MongoDB duplicate-key error
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    console.error("Registration error:", error);

    return res.status(500).json({
      message: "An internal server error occurred",
    });
  }
};
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body ?? {};
  
  if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
  }

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    !name.trim() ||
    !email.trim()
  ) {
    return res.status(400).json({
      message: "Name and email are required",
    });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.name = name.trim();
    user.email = email.trim().toLowerCase();

    if (password) {
      if (password.length < 8) {
        return res.status(400).json({
          message: "Password must be at least 8 characters",
        });
      }

      if (Buffer.byteLength(password, "utf8") > 72) {
        return res.status(400).json({
          message: "Password is too long",
        });
      }

      user.password = await bcrypt.hash(password, 12);
    }

    await user.save();

    return res.status(200).json({
      message: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Update error:", error);

    return res.status(500).json({
      message: "An internal server error occurred",
    });
  }
};
const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
  }
  try {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);

    return res.status(500).json({
      message: "An internal server error occurred",
    });
  }
};
const getUser = async (req, res) => {
  const { id } = req.params;

  // Validate the MongoDB ID before querying
  if (!mongoose.isObjectIdOrHexString(id)) {
    return res.status(400).json({
      message: "Invalid user ID",
    });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User retrieved successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);

    return res.status(500).json({
      message: "An internal server error occurred",
    });
  }
};

export { loginUser, registerUser, updateUser, deleteUser, getUser };
