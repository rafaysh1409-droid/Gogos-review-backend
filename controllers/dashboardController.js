const Review = require("../models/Review");

// @desc    Get dashboard summary counts
// @route   GET /api/dashboard
const getDashboardStats = async (req, res) => {
  try {
    // Total number of reviews submitted
    const totalReviews = await Review.countDocuments();

    // Use MongoDB aggregation to compute averages per rating field
    const aggregation = await Review.aggregate([
      {
        $group: {
          _id: null,
          avgOverallExperience: { $avg: "$overallExperience" },
          avgFoodQuality:       { $avg: "$ratings.foodQuality" },
          avgService:           { $avg: "$ratings.service" },
          avgAmbiance:          { $avg: "$ratings.ambiance" },
          avgEnvironment:       { $avg: "$ratings.environment" },
        },
      },
    ]);

    let overallAverageRating = 0;
    let averageRatingBreakdown = {
      overallExperience: 0,
      foodQuality: 0,
      service: 0,
      ambiance: 0,
      environment: 0,
    };

    if (aggregation.length > 0) {
      const agg = aggregation[0];

      averageRatingBreakdown = {
        overallExperience: Number((agg.avgOverallExperience ?? 0).toFixed(2)),
        foodQuality:       Number((agg.avgFoodQuality ?? 0).toFixed(2)),
        service:           Number((agg.avgService ?? 0).toFixed(2)),
        ambiance:          Number((agg.avgAmbiance ?? 0).toFixed(2)),
        environment:       Number((agg.avgEnvironment ?? 0).toFixed(2)),
      };

      const fieldValues = Object.values(averageRatingBreakdown);
      overallAverageRating = Number(
        (fieldValues.reduce((sum, val) => sum + val, 0) / fieldValues.length).toFixed(2)
      );
    }

    return res.status(200).json({
      success: true,
      data: {
        totalReviews,
        overallAverageRating,
        averageRatingBreakdown,
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

module.exports = { getDashboardStats };
