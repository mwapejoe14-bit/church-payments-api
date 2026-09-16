import Child from "../models/Child.js";
import User from "../models/User.js";

// @desc    Create a child (admin only)
export const createChild = async (req, res) => {
  try {
    const { name, studentNumber, grade, parentEmails } = req.body;

    if (!name || !studentNumber || !grade) {
      return res.status(400).json({
        success: false,
        message: "name, studentNumber, and grade are required",
      });
    }

    const child = await Child.create({
      name,
      studentNumber,
      grade,
      parents: [],
    });

    // Link parents by email if provided
    if (Array.isArray(parentEmails) && parentEmails.length > 0) {
      const parents = await User.find({ email: { $in: parentEmails } });
      child.parents = parents.map((p) => p._id);
      await child.save();

      // Also add child to each parent
      for (const parent of parents) {
        if (!parent.childrenIds.includes(child._id)) {
          parent.childrenIds.push(child._id);
          await parent.save();
        }
      }
    }

    res.status(201).json({ success: true, data: child });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all children (admin only)
export const getAllChildren = async (req, res) => {
  try {
    const children = await Child.find({}).populate(
      "parents",
      "name email phone"
    );
    res.status(200).json({
      success: true,
      count: children.length,
      data: children,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my children (parent)
export const getMyChildren = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("childrenIds");
    res.status(200).json({
      success: true,
      count: user.childrenIds.length,
      data: user.childrenIds,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get child by id (admin or linked parent)
export const getChild = async (req, res) => {
  try {
    const child = await Child.findById(req.params.id).populate(
      "parents",
      "name email phone"
    );
    if (!child) {
      return res
        .status(404)
        .json({ success: false, message: "Child not found" });
    }

    // If user is not admin and not a parent of this child, deny
    if (
      req.user.role !== "admin" &&
      !child.parents.some((p) => p._id.toString() === req.user.id)
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied" });
    }

    res.status(200).json({ success: true, data: child });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};