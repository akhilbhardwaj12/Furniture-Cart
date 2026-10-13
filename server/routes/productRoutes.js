import express from "express";
import Product from "../models/product.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

const isValidProduct = (product) =>
  product &&
  typeof product.name === "string" &&
  product.name.trim().length > 0 &&
  product.name.trim().length <= 160 &&
  typeof product.category === "string" &&
  product.category.trim().length > 0 &&
  product.category.trim().length <= 60 &&
  typeof product.image === "string" &&
  product.image.trim().length <= 2048 &&
  ((!product.image.startsWith("//") && product.image.startsWith("/")) ||
    /^https?:\/\/\S+$/i.test(product.image)) &&
  (typeof product.price === "number" || typeof product.price === "string") &&
  Number.isFinite(Number(product.price)) &&
  Number(product.price) > 0 &&
  Number(product.price) <= 10000000 &&
  (typeof product.productDetail?.description !== "string" ||
    product.productDetail.description.length <= 5000);

const productFields = (product) => ({
  name: product.name.trim(),
  category: product.category.trim(),
  image: product.image.trim(),
  price: Number(product.price),
  productDetail: {
    description:
      typeof product.productDetail?.description === "string"
        ? product.productDetail.description.trim()
        : "",
    delivery:
      typeof product.productDetail?.delivery === "string"
        ? product.productDetail.delivery.trim()
        : "5-7 Days from order date.",
    shipping:
      typeof product.productDetail?.shipping === "string"
        ? product.productDetail.shipping.trim()
        : "On Orders above ₹100",
  },
});

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ id: 1 }).lean();
    return res.json({ success: true, products });
  } catch (error) {
    console.error("Product list error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to load products.",
    });
  }
});

router.get("/admin", requireAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort({ id: 1 }).lean();
    return res.json({ success: true, products });
  } catch (error) {
    console.error("Admin product list error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to load products.",
    });
  }
});

router.post("/admin/seed", requireAdmin, async (req, res) => {
  const { products } = req.body ?? {};
  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({
      success: false,
      message: "A non-empty product list is required.",
    });
  }

  try {
    if (await Product.exists()) {
      return res.status(409).json({
        success: false,
        message: "The catalog already contains products.",
      });
    }

    const ids = products.map((product) => Number(product.id));
    if (
      products.some((product) => !isValidProduct(product)) ||
      ids.some((id) => !Number.isInteger(id) || id < 1) ||
      new Set(ids).size !== ids.length
    ) {
      return res.status(400).json({
        success: false,
        message: "The supplied catalog contains invalid products.",
      });
    }

    const createdProducts = await Product.insertMany(
      products.map((product, index) => ({
        id: ids[index],
        ...productFields(product),
      }))
    );

    return res.status(201).json({
      success: true,
      products: createdProducts,
    });
  } catch (error) {
    console.error("Catalog seed error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to initialize the product catalog.",
    });
  }
});

router.post("/admin", requireAdmin, async (req, res) => {
  const body = req.body ?? {};
  if (!isValidProduct(body)) {
    return res.status(400).json({
      success: false,
      message: "Enter a name, category, image URL, and valid price.",
    });
  }

  try {
    const latestProduct = await Product.findOne().sort({ id: -1 }).select("id");
    const product = await Product.create({
      id: (latestProduct?.id ?? 0) + 1,
      ...productFields(body),
    });
    return res.status(201).json({ success: true, product });
  } catch (error) {
    console.error("Product creation error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to create the product.",
    });
  }
});

router.put("/admin/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const body = req.body ?? {};
  if (!Number.isInteger(id) || id < 1 || !isValidProduct(body)) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid product and product ID.",
    });
  }

  try {
    const product = await Product.findOneAndUpdate(
      { id },
      productFields(body),
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }
    return res.json({ success: true, product });
  } catch (error) {
    console.error("Product update error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to update the product.",
    });
  }
});

router.delete("/admin/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      success: false,
      message: "A valid product ID is required.",
    });
  }

  try {
    const product = await Product.findOneAndDelete({ id });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }
    return res.json({ success: true });
  } catch (error) {
    console.error("Product deletion error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to delete the product.",
    });
  }
});

export default router;
