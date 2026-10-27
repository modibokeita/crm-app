import mongoose from "mongoose";

export const maliRegions = [
  "Bamako",
  "Kayes",
  "Koulikoro",
  "Sikasso",
  "Ségou",
  "Mopti",
  "Tombouctou",
  "Gao",
  "Kidal",
  "Ménaka",
  "Taoudénit",
];

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      maxlength: 15,
    },

    address: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    region: {
      type: String,
      required: [true, "Region is required"],
      enum: {
        values: maliRegions,
        message: "Please select a valid region in Mali",
      },
    },

    companyName: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    // The user who created/owns this client.
    // The backend assigns this from req.user.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Client owner is required"],
      index: true,
    },

    objections: {
      type: String,
      enum: ["interesse", "pasinteresse", "logicieldispo", "montanteleve"],
      default: "interesse",
    },

    produits: {
      type: String,
      enum: ["gclinic", "gboutique", "csdss"],
      default: "gclinic",
    },
    image: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Client = mongoose.model("Client", clientSchema);

export default Client;