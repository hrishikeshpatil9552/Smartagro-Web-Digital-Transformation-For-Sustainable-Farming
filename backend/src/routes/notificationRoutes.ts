// backend/src/routes/notificationRoutes.ts
import express from "express";
import Subscription from "../models/Subscription";

const router = express.Router();

/**
 * GET /api/notifications/vapid
 * Returns VAPID public key for frontend
 */
router.get("/vapid", (req, res) => {
  console.log("VAPID_PUBLIC_KEY in backend:", process.env.VAPID_PUBLIC_KEY);
  return res.json({
    publicKey: process.env.VAPID_PUBLIC_KEY,
  });
});

/**
 * POST /api/notifications/subscribe
 * body: { subscription: {endpoint, keys}, farmerId? }
 */
router.post("/subscribe", async (req, res) => {
  try {
    const { subscription, farmerId } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: "Subscription required" });
    }

    let doc = await Subscription.findOne({ endpoint: subscription.endpoint });

    if (doc) {
      doc.lastSeenAt = new Date();
      doc.active = true;
      if (farmerId) doc.farmer = farmerId;
      await doc.save();
    } else {
      doc = new Subscription({
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        farmer: farmerId || null,
      });
      await doc.save();
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /api/notifications/unsubscribe
 * body: { endpoint }
 */
router.post("/unsubscribe", async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      return res.status(400).json({ error: "Endpoint required" });
    }

    await Subscription.deleteOne({ endpoint });
    return res.json({ success: true });
  } catch (err) {
    console.error("Unsubscribe error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
