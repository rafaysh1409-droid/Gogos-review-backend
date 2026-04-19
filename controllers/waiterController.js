const mongoose = require("mongoose");
const Waiter = require("../models/Waiter");

const getValidatedWaiterId = (id) => mongoose.Types.ObjectId.isValid(id);

const getWaiterNameIdList = async (req, res) => {
  try {
    const waiters = await Waiter.find()
      .select("_id fullName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: waiters.length,
      data: waiters,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

const getWaitersByName = async (req, res) => {
  try {
    const name = (req.query.name || "").trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'name' is required.",
      });
    }

    const waiters = await Waiter.find({
      fullName: { $regex: name, $options: "i" },
    })
      .select("_id fullName")
      .sort({ fullName: 1 });

    return res.status(200).json({
      success: true,
      count: waiters.length,
      data: waiters,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

const createWaiter = async (req, res) => {
  try {
    const { fullName, phone, isActive, leftOn } = req.body;

    const waiter = await Waiter.create({
      fullName,
      phone,
      isActive: typeof isActive === "boolean" ? isActive : true,
      leftOn: leftOn || null,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Waiter created successfully.",
      data: waiter,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

const getWaiters = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const perPage = Math.min(Math.max(parseInt(req.query.per_page, 10) || 10, 1), 100);
    const skip = (page - 1) * perPage;

    const totalRecords = await Waiter.countDocuments();
    const waiters = await Waiter.find()
      .populate("createdBy", "_id fullName email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage);

    const totalPages = totalRecords ? Math.ceil(totalRecords / perPage) : 0;

    return res.status(200).json({
      success: true,
      count: waiters.length,
      total: totalRecords,
      page,
      per_page: perPage,
      total_pages: totalPages,
      has_next_page: page < totalPages,
      has_prev_page: page > 1,
      data: waiters,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

const getWaiterById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!getValidatedWaiterId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid waiter id.",
      });
    }

    const waiter = await Waiter.findById(id).populate("createdBy", "_id fullName email role");

    if (!waiter) {
      return res.status(404).json({
        success: false,
        message: "Waiter not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: waiter,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

const updateWaiterFullName = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName } = req.body;

    if (!getValidatedWaiterId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid waiter id.",
      });
    }

    const waiter = await Waiter.findById(id);

    if (!waiter) {
      return res.status(404).json({
        success: false,
        message: "Waiter not found.",
      });
    }

    waiter.fullName = fullName;
    await waiter.save();

    return res.status(200).json({
      success: true,
      message: "Waiter full name updated successfully.",
      data: waiter,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

const deleteWaiterById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!getValidatedWaiterId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid waiter id.",
      });
    }

    const waiter = await Waiter.findById(id);

    if (!waiter) {
      return res.status(404).json({
        success: false,
        message: "Waiter not found.",
      });
    }

    await waiter.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Waiter deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

module.exports = {
  createWaiter,
  getWaiters,
  getWaiterNameIdList,
  getWaitersByName,
  getWaiterById,
  updateWaiterFullName,
  deleteWaiterById,
};
