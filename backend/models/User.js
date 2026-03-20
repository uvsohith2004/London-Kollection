import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    refreshToken: { type: String, default: null, select: false },
    resetPasswordOtp: { type: String, default: null, select: false },
    resetPasswordOtpExpiry: { type: Date, default: null, select: false },
    resetPasswordOtpAttempts: { type: Number, default: 0, select: false },
    resetPasswordOtpVerified: { type: Boolean, default: false, select: false },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    country: { type: String, default: "" },
    postalCode: { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.refreshToken;
        delete ret.resetPasswordOtp;
        delete ret.resetPasswordOtpExpiry;
        delete ret.resetPasswordOtpAttempts;
        delete ret.resetPasswordOtpVerified;
        return ret;
      },
    },
  }
);

userSchema.index({ refreshToken: 1 });

const UserModel = mongoose.model("User", userSchema);

const toSafeUser = (user) => {
  if (!user) return null;

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address,
    city: user.city,
    country: user.country,
    postalCode: user.postalCode,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  };
};

class User {
  static async create(userData) {
    const { name, email, password, role = "user" } = userData;

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await UserModel.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
    });

    return user.toJSON();
  }

  static async findByEmail(email) {
    const user = await UserModel.findOne({
      email: email.toLowerCase().trim(),
    })
      .select("+password +refreshToken +resetPasswordOtp +resetPasswordOtpExpiry +resetPasswordOtpAttempts +resetPasswordOtpVerified")
      .lean();

    if (!user) return null;

    return {
      ...user,
      id: user._id.toString(),
    };
  }

  static async findById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    const user = await UserModel.findById(id)
      .select("-password -refreshToken -resetPasswordOtp -resetPasswordOtpExpiry -resetPasswordOtpAttempts -resetPasswordOtpVerified")
      .lean();

    return toSafeUser(user);
  }

  static async findByIdAndUpdate(id, update) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    const allowed = ["name", "phone", "address", "city", "country", "postalCode"];
    const filtered = Object.fromEntries(
      Object.entries(update).filter(([key]) => allowed.includes(key))
    );

    const user = await UserModel.findByIdAndUpdate(id, filtered, {
      new: true,
      runValidators: true,
    })
      .select("-password -refreshToken -resetPasswordOtp -resetPasswordOtpExpiry -resetPasswordOtpAttempts -resetPasswordOtpVerified")
      .lean();

    return toSafeUser(user);
  }

  static async findByRefreshToken(refreshToken) {
    if (!refreshToken) return null;

    const user = await UserModel.findOne({ refreshToken })
      .select("-password -refreshToken -resetPasswordOtp -resetPasswordOtpExpiry -resetPasswordOtpAttempts")
      .lean();

    return toSafeUser(user);
  }

  static async comparePassword(plain, hashed) {
    return bcrypt.compare(plain, hashed);
  }

  static generateAccessToken(payload) {
    return jwt.sign(
      { id: payload.id, email: payload.email, role: payload.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
  }

  static generateRefreshToken(payload) {
    return jwt.sign(
      { id: payload.id, email: payload.email },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
  }

  static async saveRefreshToken(userId, refreshToken) {
    if (!mongoose.Types.ObjectId.isValid(userId)) return;
    await UserModel.findByIdAndUpdate(userId, { refreshToken });
  }

  static async clearRefreshToken(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) return;
    await UserModel.findByIdAndUpdate(userId, { refreshToken: null });
  }

  static async setResetPasswordOtp(email, otp, expiryDate) {
    const user = await UserModel.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      {
        resetPasswordOtp: otp,
        resetPasswordOtpExpiry: expiryDate,
        resetPasswordOtpAttempts: 0,
        resetPasswordOtpVerified: false,
      },
      { new: true }
    ).lean();

    return user
      ? {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        }
      : null;
  }

  static async verifyResetPasswordOtp(email, otp) {
    const user = await UserModel.findOne({
      email: email.toLowerCase().trim(),
    }).select("+resetPasswordOtp +resetPasswordOtpExpiry +resetPasswordOtpAttempts +resetPasswordOtpVerified");

    if (!user) return { success: false, reason: "USER_NOT_FOUND" };
    if (!user.resetPasswordOtp || !user.resetPasswordOtpExpiry) {
      return { success: false, reason: "OTP_NOT_REQUESTED" };
    }
    if (user.resetPasswordOtpAttempts >= 5) {
      return { success: false, reason: "OTP_ATTEMPTS_EXCEEDED" };
    }
    if (user.resetPasswordOtpExpiry.getTime() < Date.now()) {
      return { success: false, reason: "OTP_EXPIRED" };
    }
    if (user.resetPasswordOtp !== otp) {
      user.resetPasswordOtpAttempts += 1;
      await user.save();
      return { success: false, reason: "OTP_INVALID" };
    }

    user.resetPasswordOtpVerified = true;
    await user.save();

    return {
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    };
  }

  static async resetPassword(email, newPassword) {
    const user = await UserModel.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password +resetPasswordOtp +resetPasswordOtpExpiry +resetPasswordOtpAttempts +resetPasswordOtpVerified");

    if (!user) return null;

    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpiry = null;
    user.resetPasswordOtpAttempts = 0;
    user.resetPasswordOtpVerified = false;
    await user.save();

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}

export default User;
