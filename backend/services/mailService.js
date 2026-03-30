import nodemailer from "nodemailer";
import { getDisplayCurrency } from "../utils/currency.js";
import { getPaymentMethodLabel, normalizePaymentMethod } from "../utils/paymentMethod.js";

const hasMailConfig = () =>
  Boolean(
    (process.env.SMTP_HOST || process.env.EMAIL_USER) &&
      (process.env.SMTP_USER || process.env.EMAIL_USER) &&
      (process.env.SMTP_PASS || process.env.EMAIL_PASS)
  );

const createTransporter = () => {
  if (!hasMailConfig()) {
    return null;
  }

  return nodemailer.createTransport({
    ...(process.env.SMTP_HOST
      ? {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: Number(process.env.SMTP_PORT || 587) === 465,
        }
      : {
          service: "gmail",
        }),
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
    },
  });
};

const getMailFrom = () => process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;

const formatAmount = (amount, currencyCode) =>
  `${currencyCode} ${Number(amount || 0).toFixed(currencyCode === "KWD" ? 3 : 2)}`;

const buildItemsText = (order) =>
  (order.products || [])
    .map(
      (item, index) =>
        `${index + 1}. ${item.title}\n   Quantity: ${item.quantity}\n   Price: ${formatAmount(
          item.price || 0,
          order.displayCurrency || order.currency || getDisplayCurrency()
        )}`
    )
    .join("\n\n");

const getResolvedPaymentMethodLabel = (order) => {
  if (order.paymentProviderMethod) {
    return String(order.paymentProviderMethod).toUpperCase();
  }

  return getPaymentMethodLabel(order.paymentMethod);
};

const buildOrderEmailText = (order, heading = "Order Received") => {
  const displayCurrency = order.displayCurrency || order.currency || getDisplayCurrency();
  const paymentMethodLabel = getResolvedPaymentMethodLabel(order);

  return [
    heading,
    "",
    `Order ID: ${order._id}`,
    `User Email: ${order.userEmail || order.shippingAddress?.email || "N/A"}`,
    `Customer Name: ${order.shippingAddress?.name || "N/A"}`,
    `Mobile Number: ${order.shippingAddress?.phone || "N/A"}`,
    `Address: ${order.shippingAddress?.address || "N/A"}`,
    `City: ${order.shippingAddress?.city || "N/A"}`,
    `Postal Code: ${order.shippingAddress?.pincode || "N/A"}`,
    `Country: ${order.shippingAddress?.country || "N/A"}`,
    `Total Amount: ${formatAmount(order.totalPrice || 0, displayCurrency)}`,
    `Payment Amount: ${formatAmount(order.totalPrice || order.amount || 0, displayCurrency)}`,
    `Payment Method: ${paymentMethodLabel}`,
    `Payment Status: ${order.paymentStatus || "pending"}`,
    `Order Time: ${order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString()}`,
    "",
    "Items:",
    buildItemsText(order) || "No items found",
  ].join("\n");
};

const buildOrderEmailHtml = (order, heading = "Order Received") => {
  const displayCurrency = order.displayCurrency || order.currency || getDisplayCurrency();
  const paymentMethodLabel = getResolvedPaymentMethodLabel(order);
  const shippingAddressLines = [
    order.shippingAddress?.address,
    order.shippingAddress?.city,
    order.shippingAddress?.state,
    order.shippingAddress?.pincode,
    order.shippingAddress?.country,
  ].filter(Boolean).join(", ");

  return `
    <div style="font-family:Arial,sans-serif;background:#f5f5f4;padding:24px;color:#1c1917;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e7e5e4;border-radius:24px;overflow:hidden;">
        <div style="background:#111827;color:#ffffff;padding:24px 32px;">
          <p style="margin:0;font-size:12px;letter-spacing:0.3em;text-transform:uppercase;opacity:0.8;">London Kollection</p>
          <h2 style="margin:12px 0 0;font-size:28px;">${heading}</h2>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 16px;">Order ID: <strong>${order._id}</strong></p>
          <p style="margin:0 0 8px;">Customer: ${order.shippingAddress?.name || "N/A"} (${order.userEmail || order.shippingAddress?.email || "N/A"})</p>
          <p style="margin:0 0 8px;">Mobile Number: ${order.shippingAddress?.phone || "N/A"}</p>
          <p style="margin:0 0 16px;">Shipping Address: ${shippingAddressLines || "N/A"}</p>
          <p style="margin:0 0 8px;">Payment Method: ${paymentMethodLabel}</p>
          <p style="margin:0 0 8px;">Payment Status: ${order.paymentStatus || "pending"}</p>
          <p style="margin:0 0 8px;">Display Total: <strong>${formatAmount(order.totalPrice || 0, displayCurrency)}</strong></p>
          <p style="margin:0 0 24px;">Payment Total: <strong>${formatAmount(order.totalPrice || order.amount || 0, displayCurrency)}</strong></p>
          <div style="padding:20px;border:1px solid #e7e5e4;border-radius:20px;background:#fafaf9;">
            ${(order.products || [])
              .map(
                (item, index, items) => `
                  <div style="padding:12px 0;${index < items.length - 1 ? "border-bottom:1px solid #e7e5e4;" : ""}">
                    <div style="font-weight:600;">${item.title}</div>
                    <div style="font-size:14px;color:#57534e;">Qty: ${item.quantity} | Price: ${formatAmount(item.price || 0, displayCurrency)}</div>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
      </div>
    </div>
  `;
};

export async function sendOrderEmail(order) {
  if (!hasMailConfig()) {
    console.warn("[MAIL] Email config missing. Skipping order emails.");
    return false;
  }

  try {
    console.log("[MAIL] Sending order email", {
      orderId: order?._id?.toString?.() || order?.id,
    });

    const transporter = createTransporter();
    const from = getMailFrom();
    const recipients = [...new Set([order.userEmail || order.shippingAddress?.email, process.env.ADMIN_EMAIL].filter(Boolean))];

    if (recipients.length === 0) {
      console.warn("[MAIL] No order email recipients configured.");
      return false;
    }

    await Promise.all(
      recipients.map((recipient) =>
        transporter.sendMail({
          from,
          to: recipient,
          subject: `Order Received - ${order?._id?.toString?.() || "Unknown Order"}`,
          text: buildOrderEmailText(order),
          html: buildOrderEmailHtml(order),
        })
      )
    );

    console.log("[MAIL] Order email sent successfully");
    return true;
  } catch (error) {
    console.error("[MAIL] Order email send failed", error.message);
    return false;
  }
}

export async function sendAdminPaymentSuccessEmail(order) {
  if (!hasMailConfig() || !process.env.ADMIN_EMAIL) {
    console.warn("[MAIL] Email config missing. Skipping admin payment success email.");
    return false;
  }

  try {
    const transporter = createTransporter();
    const emailOrder = {
      ...order,
      paymentMethod: normalizePaymentMethod(order.paymentMethod),
      paymentStatus: "SUCCESS",
    };

    await transporter.sendMail({
      from: getMailFrom(),
      to: process.env.ADMIN_EMAIL,
      subject: `Payment Successful - ${order?._id?.toString?.() || "Unknown Order"}`,
      text: buildOrderEmailText(emailOrder, "Payment Successful"),
      html: buildOrderEmailHtml(emailOrder, "Payment Successful"),
    });

    console.log("[MAIL] Admin payment success email sent");
    return true;
  } catch (error) {
    console.error("[MAIL] Admin payment success email failed", error.message);
    return false;
  }
}

export default {
  sendOrderEmail,
  sendAdminPaymentSuccessEmail,
};
