import { createHmac, timingSafeEqual } from "node:crypto";

const RAZORPAY_API_URL = "https://api.razorpay.com/v1";

export const getRazorpayCredentials = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return { keyId, keySecret };
};

export const razorpayRequest = async (path, { method = "GET", body } = {}) => {
  const credentials = getRazorpayCredentials();
  if (!credentials) {
    throw new Error("Razorpay credentials are not configured.");
  }

  const authorization = Buffer.from(
    `${credentials.keyId}:${credentials.keySecret}`
  ).toString("base64");

  const response = await fetch(`${RAZORPAY_API_URL}${path}`, {
    method,
    headers: {
      Authorization: `Basic ${authorization}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json();

  if (!response.ok) {
    const description = result.error?.description;
    throw new Error(
      typeof description === "string"
        ? `Razorpay request failed: ${description}`
        : `Razorpay request failed with status ${response.status}.`
    );
  }

  return result;
};

export const verifyRazorpaySignature = ({
  orderId,
  paymentId,
  signature,
  keySecret,
}) => {
  const expected = createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest();

  let supplied;
  try {
    supplied = Buffer.from(signature, "hex");
  } catch {
    return false;
  }

  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
};
