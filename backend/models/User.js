const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // password will not be returned in queries by default
    },
    avatar: {
      type: String,
      default: "",
    },
    coverPhoto: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      maxlength: 200,
    },
    followers: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
],
following: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
],

savedPosts: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
],
friends: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
],
isPrivate: {
  type: Boolean,
  default: false,
},
work: {
  type: String,
  default: "",
},
education: {
  type: String,
  default: "",
},
livesIn: {
  type: String,
  default: "",
},
from: {
  type: String,
  default: "",
},
relationshipStatus: {
  type: String,
  default: "",
},
phone: {
  type: String,
  default: "",
},


  },
  
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
