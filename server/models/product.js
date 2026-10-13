import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    image: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
    },
    price: {
      type: Number,
      required: true,
      min: 0.01,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    productDetail: {
      description: { type: String, default: "" },
      delivery: { type: String, default: "5-7 Days from order date." },
      shipping: { type: String, default: "On Orders above ₹100" },
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
