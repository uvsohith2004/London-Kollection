import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { sendAdminPaymentSuccessEmail } from "../services/mailService.js";
import { constructWebhookEvent } from "../services/stripeService.js";

const resolveUserEmail = async (order) => {
  if (order.userEmail) {
    return order.userEmail;
  }

  if (order.shippingAddress?.email) {
    return order.shippingAddress.email;
  }

  const user = await User.findById(order.userId).select("email").lean();
  return user?.email || "";
};

export async function createCheckoutSession(req, res, next) {
  try {
    const error = new Error(
      "Stripe Checkout is disabled for this store. Use the PaymentIntent flow so customers only see KWD."
    );
    error.statusCode = 410;
    error.code = "STRIPE_CHECKOUT_DISABLED";
    throw error;
  } catch (error) {
    next(error);
  }
}

export async function handleStripeWebhook(req, res, next) {
  try {
    const signature = req.headers["stripe-signature"];

    if (!signature) {
      const error = new Error("Stripe signature is missing");
      error.statusCode = 400;
      error.code = "STRIPE_SIGNATURE_MISSING";
      throw error;
    }

    const event = constructWebhookEvent(req.body, signature);

    console.log("[WEBHOOK] Stripe event received", {
      eventId: event.id,
      type: event.type,
    });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session?.metadata?.orderId;

      if (orderId) {
        const order = await Order.findById(orderId);

        if (order) {
          if (order.paymentStatus === "paid") {
            console.log("[WEBHOOK] Order already paid, ignoring duplicate event", {
              orderId,
              sessionId: session.id,
            });
          } else {
            order.paymentStatus = "paid";
            order.paymentMethod = "online";
            order.paymentProviderStatus = session.payment_status || "paid";
            order.stripeSessionId = session.id || order.stripeSessionId;
            order.stripePaymentIntentId =
              String(session.payment_intent || order.stripePaymentIntentId || "");
            order.paymentFailureReason = "";
            order.paidAt = order.paidAt || new Date();

            if (!order.stockDeductedAt) {
              for (const item of order.products) {
                await Product.decrementStock(item.productId, item.quantity);
              }

              order.stockDeductedAt = new Date();
            }

            if (!order.adminPaymentSuccessEmailSentAt) {
              const userEmail = await resolveUserEmail(order);
              const emailSent = await sendAdminPaymentSuccessEmail({
                ...order.toObject(),
                userEmail,
              });

              if (emailSent) {
                order.adminPaymentSuccessEmailSentAt = new Date();
              }
            }

            await order.save();

            console.log("[WEBHOOK] Payment marked as paid", {
              orderId,
              paymentIntentId: order.stripePaymentIntentId,
            });
          }
        }
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;

      const order = await Order.findOne({
        $or: [
          { stripePaymentIntentId: String(paymentIntent.id) },
          { _id: String(paymentIntent.metadata?.orderId || "") },
        ],
      });

      if (order && order.paymentStatus !== "paid") {
        order.paymentStatus = "failed";
        order.paymentProviderStatus = paymentIntent.status || "payment_failed";
        order.stripePaymentIntentId = String(paymentIntent.id || order.stripePaymentIntentId || "");
        order.paymentFailureReason =
          paymentIntent.last_payment_error?.message || order.paymentFailureReason || "Payment failed";
        await order.save();

        console.log("[WEBHOOK] Payment marked as failed", {
          orderId: order._id.toString(),
          paymentIntentId: paymentIntent.id,
        });
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
}

export default {
  createCheckoutSession,
  handleStripeWebhook,
};
