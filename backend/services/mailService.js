import nodemailer from "nodemailer";

const hasMailConfig = () =>
  Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.ADMIN_EMAIL);

const createTransporter = () => {
  if (!hasMailConfig()) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const buildOrderEmailText = (order) => {
  const itemsText = (order.products || [])
    .map(
      (item, index) =>
        `${index + 1}. ${item.title}\n   Quantity: ${item.quantity}\n   Price: INR ${Number(item.price || 0).toFixed(2)}`
    )
    .join("\n\n");

  return [
    "New Order Received",
    "",
    `Order ID: ${order._id}`,
    `User Email: ${order.userEmail || "N/A"}`,
    `Customer Name: ${order.shippingAddress?.name || "N/A"}`,
    `Mobile Number: ${order.shippingAddress?.phone || "N/A"}`,
    `Address: ${order.shippingAddress?.address || "N/A"}`,
    `City: ${order.shippingAddress?.city || "N/A"}`,
    `Postal Code: ${order.shippingAddress?.pincode || "N/A"}`,
    `Country: ${order.shippingAddress?.country || "N/A"}`,
    `Total Amount: INR ${Number(order.totalPrice || 0).toFixed(2)}`,
    `Payment Status: ${order.paymentStatus || "pending"}`,
    `Order Time: ${order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString()}`,
    "",
    "Items:",
    itemsText || "No items found",
  ].join("\n");
};

export async function sendOrderEmail(order) {
  if (!hasMailConfig()) {
    console.warn("[MAIL] Email config missing. Skipping admin email.");
    return;
  }

  try {
    console.log("[MAIL] Sending order email", {
      orderId: order?._id?.toString?.() || order?.id,
    });

    const transporter = createTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New Order Received - ${order?._id?.toString?.() || "Unknown Order"}`,
      text: buildOrderEmailText(order),
    });

    console.log("[MAIL] Email sent successfully");
  } catch (error) {
    console.error("[MAIL] Email send failed", error.message);
  }
}

export default {
  sendOrderEmail,
};
