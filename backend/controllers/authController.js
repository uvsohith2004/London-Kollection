import User from "../models/User.js";
import { sendResetOtpEmail } from "../services/emailService.js";

const RESET_OTP_ERROR_MESSAGES = {
  USER_NOT_FOUND: "Invalid email or OTP",
  OTP_NOT_REQUESTED: "Please request an OTP first",
  OTP_ATTEMPTS_EXCEEDED: "Maximum OTP attempts exceeded. Please request a new OTP",
  OTP_EXPIRED: "OTP has expired. Please request a new OTP",
  OTP_INVALID: "Invalid email or OTP",
};

const buildAuthResponse = (user, accessToken) => ({
  success: true,
  data: {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
  },
});

/* ===========================
   REGISTER
=========================== */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = await User.create({ name, email, password });
    const accessToken = User.generateAccessToken(user);
    const refreshToken = User.generateRefreshToken(user);

    await User.saveRefreshToken(user.id, refreshToken);

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json(buildAuthResponse(user, accessToken));
  } catch (error) {
    next(error);
  }
};

/* ===========================
   LOGIN
=========================== */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isValid = await User.comparePassword(password, user.password);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const accessToken = User.generateAccessToken(user);
    const refreshToken = User.generateRefreshToken(user);

    await User.saveRefreshToken(user.id, refreshToken);

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json(buildAuthResponse(user, accessToken));
  } catch (error) {
    next(error);
  }
};

/* ===========================
   REFRESH TOKEN
=========================== */
export const refreshToken = async (req, res, next) => {
  try {
    const oldToken = req.refreshToken;
    const user = await User.findByRefreshToken(oldToken);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const newAccessToken = User.generateAccessToken(user);
    const newRefreshToken = User.generateRefreshToken(user);

    await User.saveRefreshToken(user.id, newRefreshToken);

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* ===========================
   LOGOUT
=========================== */
export const logout = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (userId) {
      await User.clearRefreshToken(userId);
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });

    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists for this email, an OTP has been sent",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryDate = new Date(Date.now() + 10 * 60 * 1000);

    await User.setResetPasswordOtp(email, otp, expiryDate);
    await sendResetOtpEmail({
      to: email,
      name: user.name,
      otp,
      expiresInMinutes: 10,
    });

    res.status(200).json({
      success: true,
      message: "If an account exists for this email, an OTP has been sent",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyResetOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const result = await User.verifyResetPasswordOtp(email, otp);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: RESET_OTP_ERROR_MESSAGES[result.reason] || "OTP verification failed",
        code: result.reason,
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    const existingUser = await User.findByEmail(email);

    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "Unable to reset password for this account",
      });
    }

    if (!existingUser.resetPasswordOtp || !existingUser.resetPasswordOtpExpiry) {
      return res.status(400).json({
        success: false,
        message: "Please verify your OTP before resetting your password",
      });
    }

    if (existingUser.resetPasswordOtpExpiry.getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP",
      });
    }

    if (!existingUser.resetPasswordOtpVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your OTP before resetting your password",
      });
    }

    await User.resetPassword(email, newPassword);

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};
