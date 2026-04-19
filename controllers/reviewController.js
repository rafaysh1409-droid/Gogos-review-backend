const Review = require("../models/Review");
const Waiter = require("../models/Waiter");
const mongoose = require("mongoose");

const calculateAverageRating = (overallExperience, ratings = {}) => {
  const ratingValues = [overallExperience, ...Object.values(ratings)].filter(
    (value) => typeof value === "number" && !Number.isNaN(value)
  );

  if (!ratingValues.length) {
    return 0;
  }

  const total = ratingValues.reduce((sum, value) => sum + value, 0);
  return Number((total / ratingValues.length).toFixed(2));
};

// @desc    Submit a new review
// @route   POST /api/reviews  (protected — customer only)
const submitReview = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      overallExperience,
      likedMost,
      ratings,
      waiterDetails,
      whatWentWrong,
      whatWentWrongDetails,
      whatDidYouLove,
      additionalComments,
    } = req.body;

    // Check if any rating is <= 3 to determine if whatWentWrong should be required
    const hasLowRating = Object.values(ratings).some((rating) => rating <= 3);

    if (hasLowRating && (!whatWentWrong || whatWentWrong.length === 0)) {
      return res.status(422).json({
        success: false,
        message: "Since at least one rating is 3 or below, 'What went wrong?' is required.",
      });
    }

    // If "Other" is selected in whatWentWrong, details are required
    if (whatWentWrong && whatWentWrong.includes("Other") && !whatWentWrongDetails) {
      return res.status(422).json({
        success: false,
        message: "Please provide details for 'Other' in 'What went wrong?'.",
      });
    }

    const review = await Review.create({
      name,
      email,
      phone,
      overallExperience,
      likedMost,
      ratings,
      waiterDetails,
      whatWentWrong: hasLowRating ? whatWentWrong : undefined,
      whatWentWrongDetails: whatWentWrongDetails || undefined,
      whatDidYouLove: !hasLowRating ? whatDidYouLove : undefined,
      additionalComments: additionalComments || undefined,
    });

    const waiterRatingSummary = waiterDetails.reduce((accumulator, item) => {
      const waiterId = String(item.servedBy);

      if (!accumulator[waiterId]) {
        accumulator[waiterId] = { score: 0, count: 0 };
      }

      accumulator[waiterId].score += item.rateWaiter;
      accumulator[waiterId].count += 1;
      return accumulator;
    }, {});

    const updateWaiterRatings = Object.entries(waiterRatingSummary).map(async ([waiterId, summary]) => {
      const waiter = await Waiter.findById(waiterId);
      if (!waiter) {
        return;
      }

      waiter.totalRatingScore += summary.score;
      waiter.totalRatingCount += summary.count;
      waiter.averageWaiterRating = Number(
        (waiter.totalRatingScore / waiter.totalRatingCount).toFixed(2)
      );

      await waiter.save();
    });

    await Promise.all(updateWaiterRatings);

    const reviewObject = review.toObject();
    const averageRating = calculateAverageRating(
      reviewObject.overallExperience,
      reviewObject.ratings
    );

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      data: {
        ...reviewObject,
        averageRating,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

// @desc    Get all reviews
// @route   GET /api/reviews
const getReviews = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const perPage = Math.min(Math.max(parseInt(req.query.per_page, 10) || 10, 1), 100);
    const skip = (page - 1) * perPage;
    const { fetchby } = req.query;

    const filter = {};
    if (fetchby) {
      if (!mongoose.Types.ObjectId.isValid(fetchby)) {
        return res.status(400).json({
          success: false,
          message: "Invalid fetchby waiter id.",
        });
      }

      filter["waiterDetails.servedBy"] = fetchby;
    }

    const totalRecords = await Review.countDocuments(filter);
    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage);
    const reviewsWithAverage = reviews.map((review) => {
      const reviewObject = review.toObject();
      return {
        ...reviewObject,
        averageRating: calculateAverageRating(
          reviewObject.overallExperience,
          reviewObject.ratings
        ),
      };
    });

    const overallAverageRating = reviewsWithAverage.length
      ? Number(
          (
            reviewsWithAverage.reduce(
              (sum, review) => sum + review.averageRating,
              0
            ) / reviewsWithAverage.length
          ).toFixed(2)
        )
      : 0;

    const totalPages = totalRecords ? Math.ceil(totalRecords / perPage) : 0;

    return res.status(200).json({
      success: true,
      count: reviewsWithAverage.length,
      total: totalRecords,
      page,
      per_page: perPage,
      total_pages: totalPages,
      has_next_page: page < totalPages,
      has_prev_page: page > 1,
      overallAverageRating,
      data: reviewsWithAverage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

// @desc    Get single review by id
// @route   GET /api/reviews/:id
const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review id.",
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    const reviewObject = review.toObject();
    const averageRating = calculateAverageRating(
      reviewObject.overallExperience,
      reviewObject.ratings
    );

    return res.status(200).json({
      success: true,
      data: {
        ...reviewObject,
        averageRating,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

// @desc    Delete review by id
// @route   DELETE /api/reviews/:id
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review id.",
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    await review.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

module.exports = { submitReview, getReviews, getReviewById, deleteReview };
