import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  name: String,
  email: String,
  movie_id: mongoose.Schema.Types.ObjectId,
  text: String,
  date: Date,
}, { timestamps: true });

export default ReviewSchema;
