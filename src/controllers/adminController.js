import User from "../models/User.js";

// @desc    Get pending users (admin)
export const getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ approvalStatus: "pending" }).select(
      "-password"
    );
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or reject a user (admin)
export const approveUser = async (req, res) => {
  try {
    const { status } = req.body; // "approved" or "rejected"
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "status must be 'approved' or 'rejected'",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { approvalStatus: status },
      { new: true }
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};