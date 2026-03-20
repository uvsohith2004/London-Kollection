import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        title: String,
        price: Number,
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        image: String,
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "KWD",
    },
    displayCurrency: {
      type: String,
      default: "KWD",
    },
    paymentCurrency: {
      type: String,
      default: "INR",
    },
    paymentAmount: {
      type: Number,
      default: null,
    },
    exchangeRate: {
      type: Number,
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "online", "razorpay"],
      default: "cod",
    },
    paymentProviderMethod: {
      type: String,
      default: "",
    },
    razorpayOrderId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      sparse: true,
      index: true,
    },
    razorpaySignature: {
      type: String,
      sparse: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled"],
      default: "pending",
      index: true,
    },
    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: "processing",
      index: true,
    },
    shippingAddress: {
      name: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
      country: {
        type: String,
        default: "India",
      },
    },
    notes: {
      type: String,
      default: "",
    },
    paymentFailureReason: {
      type: String,
      default: "",
    },
    adminPaymentSuccessEmailSentAt: {
      type: Date,
      default: null,
    },
    paidAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
