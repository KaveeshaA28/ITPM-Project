import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    firstname: {
      type: String,
      required: true,
    },

    lastname: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "lecturer", "admin"],
      default: "student",
    },

    department: {
      type: String,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    profilePicture: {
      type: String,
      default:
        "https://res.cloudinary.com/dz1qj3x4h/image/upload/v1735681234/DefaultProfilePicture.png",
    },

    profilePicturePublicId: {
      type: String, // for deleting old image from Cloudinary
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
