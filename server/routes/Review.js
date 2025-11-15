import express from "express";
import ReviewSchema from "../models/review.js";

const reviewsRouter = express.Router();

// GET /api/reviews
reviewsRouter.get("/", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const skip = parseInt(req.query.skip) || 0;
    const fields = req.query.fields
      ? req.query.fields.split(",").join(" ")
      : "_id name email movie_id text date";

    const reviews = await ReviewSchema.find()
      .select(fields)
      .sort({ date: -1 }) // เรียงตามวันที่ล่าสุด
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await ReviewSchema.countDocuments();

    res.json({
      ok: true,
      total,
      count: reviews.length,
      reviews,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

export default reviewsRouter;
