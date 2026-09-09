import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  userId: String,
  eventId: String
});

export default mongoose.model("Booking", bookingSchema);