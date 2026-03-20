import User from "../models/User.js";

/**
 * GET /api/users/profile
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/profile
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      address,
      city,
      country,
      postalCode,
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
      name,
      phone,
      address,
      city,
      country,
      postalCode,
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};
