import express from "express";
import Order from "../models/order.js";
import Product from "../models/product.js";
import requireAdmin from "../middleware/requireAdmin.js";
import {
  getRazorpayCredentials,
  razorpayRequest,
  verifyRazorpaySignature,
} from "../services/razorpay.js";
import { randomUUID } from "node:crypto";

const router = express.Router();
const orderStatuses = new Set([
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

const getOrderDetails = async (body) => {
  const { customer, items } = body ?? {};
  const email =
    typeof customer?.email === "string" ? customer.email.trim().toLowerCase() : "";

  if (
    typeof customer?.fullName !== "string" ||
    !customer.fullName.trim() ||
    customer.fullName.trim().length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    typeof customer.address !== "string" ||
    !customer.address.trim() ||
    customer.address.trim().length > 300 ||
    typeof customer.city !== "string" ||
    !customer.city.trim() ||
    customer.city.trim().length > 100 ||
    typeof customer.postalCode !== "string" ||
    !customer.postalCode.trim() ||
    customer.postalCode.trim().length > 30 ||
    !Array.isArray(items) ||
    items.length === 0 ||
    items.length > 50 ||
    items.some(
      (item) =>
        !item ||
        !Number.isInteger(Number(item.productId)) ||
        Number(item.productId) > Number.MAX_SAFE_INTEGER ||
        Number(item.productId) < 1 ||
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) < 1 ||
        Number(item.quantity) > 99
    )
  ) {
    throw new Error("Enter valid delivery and item information.");
  }

  const productQuantities = new Map();
  items.forEach((item) => {
    const id = Number(item.productId);
    productQuantities.set(
      id,
      (productQuantities.get(id) ?? 0) + Number(item.quantity)
    );
  });
  if (Array.from(productQuantities.values()).some((quantity) => quantity > 99)) {
    throw new Error("The quantity for an item cannot exceed 99.");
  }

  const products = await Product.find({
    id: { $in: Array.from(productQuantities.keys()) },
  }).lean();
  if (products.length !== productQuantities.size) {
    throw new Error("One or more items are no longer available. Refresh your bag.");
  }

  const orderItems = products.map((product) => ({
    productId: product.id,
    name: product.name,
    image: product.image,
    price: product.price,
    quantity: productQuantities.get(product.id),
  }));
  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal >= 100 ? 0 : 10;

  return {
    customer: {
      fullName: customer.fullName.trim(),
      email,
      address: customer.address.trim(),
      city: customer.city.trim(),
      postalCode: customer.postalCode.trim(),
    },
    items: orderItems,
    subtotal,
    shipping,
    total: subtotal + shipping,
    currency: "INR",
  };
};

router.post("/", async (req, res) => {
  const { paymentMethod } = req.body ?? {};
  if (paymentMethod !== "cod") {
    return res.status(400).json({
      success: false,
      message: "Use the Razorpay checkout to place an online payment.",
    });
  }

  try {
    const orderDetails = await getOrderDetails(req.body);
    const order = await Order.create({
      ...orderDetails,
      paymentMethod: "cod",
      paymentStatus: "unpaid",
      status: "processing",
    });
    return res.status(201).json({
      success: true,
      order: { id: order._id, total: order.total },
    });
  } catch (error) {
    if (error.message.startsWith("Enter valid") ||
        error.message.startsWith("The quantity") ||
        error.message.startsWith("One or more")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error("Order creation error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to place your order. Please try again.",
    });
  }
});

router.post("/razorpay/create", async (req, res) => {
  const credentials = getRazorpayCredentials();
  if (!credentials) {
    return res.status(503).json({
      success: false,
      message: "Online payments are not configured yet. Please use Cash on Delivery.",
    });
  }

  try {
    const orderDetails = await getOrderDetails(req.body);
    const amount = Math.round(orderDetails.total * 100);
    if (!Number.isSafeInteger(amount) || amount < 100) {
      return res.status(400).json({
        success: false,
        message: "The order total is below Razorpay's minimum payment amount.",
      });
    }

    const receipt = randomUUID();
    const razorpayOrder = await razorpayRequest("/orders", {
      method: "POST",
      body: {
        amount,
        currency: "INR",
        receipt,
        notes: { store: "ARVE Furniture" },
      },
    });

    const order = await Order.create({
      ...orderDetails,
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      status: "processing",
      razorpayOrderId: razorpayOrder.id,
    });

    return res.status(201).json({
      success: true,
      key: credentials.keyId,
      order: {
        id: order._id,
        total: order.total,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        razorpayOrderId: razorpayOrder.id,
      },
    });
  } catch (error) {
    if (error.message.startsWith("Enter valid") ||
        error.message.startsWith("The quantity") ||
        error.message.startsWith("One or more")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error("Razorpay order creation error:", error.message);
    return res.status(502).json({
      success: false,
      message: "Unable to start Razorpay checkout. Please try again or use Cash on Delivery.",
    });
  }
});

router.post("/:id/razorpay/verify", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body ?? {};

  if (
    typeof razorpay_order_id !== "string" ||
    !/^order_[A-Za-z0-9]+$/.test(razorpay_order_id) ||
    typeof razorpay_payment_id !== "string" ||
    !/^pay_[A-Za-z0-9]+$/.test(razorpay_payment_id) ||
    typeof razorpay_signature !== "string" ||
    !/^[a-f0-9]{64}$/i.test(razorpay_signature)
  ) {
    return res.status(400).json({
      success: false,
      message: "Razorpay returned invalid payment details.",
    });
  }

  const credentials = getRazorpayCredentials();
  if (!credentials) {
    return res.status(503).json({
      success: false,
      message: "Online payments are not configured.",
    });
  }

  try {
    const order = await Order.findById(req.params.id);
    if (!order || order.razorpayOrderId !== razorpay_order_id) {
      return res.status(404).json({
        success: false,
        message: "The payment order could not be found.",
      });
    }

    const signatureIsValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      keySecret: credentials.keySecret,
    });
    if (!signatureIsValid) {
      return res.status(400).json({
        success: false,
        message: "Razorpay payment verification failed.",
      });
    }

    if (
      order.paymentStatus === "paid" &&
      order.razorpayPaymentId === razorpay_payment_id
    ) {
      return res.json({ success: true, order: { id: order._id } });
    }

    const payment = await razorpayRequest(
      `/payments/${encodeURIComponent(razorpay_payment_id)}`
    );
    if (
      payment.order_id !== razorpay_order_id ||
      payment.amount !== Math.round(order.total * 100) ||
      payment.currency !== order.currency
    ) {
      return res.status(400).json({
        success: false,
        message: "The payment amount or currency did not match the order.",
      });
    }

    let confirmedPayment = payment;
    if (payment.status === "authorized") {
      confirmedPayment = await razorpayRequest(
        `/payments/${encodeURIComponent(razorpay_payment_id)}/capture`,
        {
          method: "POST",
          body: {
            amount: payment.amount,
            currency: payment.currency,
          },
        }
      );
    }

    if (confirmedPayment.status !== "captured") {
      return res.status(409).json({
        success: false,
        message: "Razorpay has not confirmed this payment as captured.",
      });
    }

    order.paymentStatus = "paid";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    return res.json({ success: true, order: { id: order._id } });
  } catch (error) {
    console.error("Razorpay payment verification error:", error.message);
    return res.status(502).json({
      success: false,
      message: "Unable to verify the payment with Razorpay. Please contact support before retrying.",
    });
  }
});

router.get("/admin", requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, orders });
  } catch (error) {
    console.error("Admin order list error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to load orders.",
    });
  }
});

router.patch("/admin/:id/status", requireAdmin, async (req, res) => {
  const { status } = req.body ?? {};
  if (!orderStatuses.has(status)) {
    return res.status(400).json({
      success: false,
      message: "Choose a valid order status.",
    });
  }

  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }
    return res.json({ success: true, order });
  } catch (error) {
    console.error("Order status update error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to update the order status.",
    });
  }
});

router.get("/admin/customers", requireAdmin, async (req, res) => {
  try {
    const customers = await Order.aggregate([
      {
        $group: {
          _id: "$customer.email",
          fullName: { $first: "$customer.fullName" },
          email: { $first: "$customer.email" },
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$total" },
          lastOrder: { $max: "$createdAt" },
        },
      },
      { $sort: { lastOrder: -1 } },
    ]);
    return res.json({ success: true, customers });
  } catch (error) {
    console.error("Admin customer list error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to load customers.",
    });
  }
});

export default router;
