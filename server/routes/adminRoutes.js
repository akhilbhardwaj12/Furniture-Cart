import express from "express";
import Order from "../models/order.js";
import Product from "../models/product.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

router.get("/overview", requireAdmin, async (req, res) => {
  try {
    const [productCount, orderCount, customerCount, orderTotals, recentOrders] =
      await Promise.all([
        Product.countDocuments(),
        Order.countDocuments(),
        Order.distinct("customer.email").then((emails) => emails.length),
        Order.aggregate([
          { $match: { status: { $ne: "cancelled" } } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]),
        Order.find().sort({ createdAt: -1 }).limit(5).lean(),
      ]);

    return res.json({
      success: true,
      overview: {
        productCount,
        orderCount,
        customerCount,
        salesValue: orderTotals[0]?.total ?? 0,
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Admin overview error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to load the admin dashboard.",
    });
  }
});

export default router;
