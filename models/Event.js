import mongoose from "mongoose";

const winnerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: String,
      enum: ["1st", "2nd", "3rd"],
      required: true,
    },
    department: {
      type: String,
      default: "",
      trim: true,
    },
    year: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Start date and time of event
    date: {
      type: Date,
      required: true,
    },

    // Optional end date/time for ongoing/completed logic
    endDate: {
      type: Date,
      default: null,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    mainCategory: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "No description available",
    },

    department: {
      type: [String], // ["CSE", "EEE"] or ["ALL"]
      default: ["ALL"],
    },

    year: {
      type: [String], // ["1", "2"] or ["ALL"]
      default: ["ALL"],
    },

    resultStatus: {
      type: String,
      enum: ["pending", "announced"],
      default: "pending",
    },

    winners: {
      type: [winnerSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);