// frontend/src/components/NotificationToggle.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { askPushPermissionAndSubscribe } from "../utils/subscribePush";

interface Props {
  farmerId: string | null;
}

export default function NotificationToggle({ farmerId }: Props) {
  const [vapidPublicKey, setVapidPublicKey] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [loadingKey, setLoadingKey] = useState(true);

  useEffect(() => {
    // 👇 IMPORTANT: call backend on :5000 explicitly
    axios
      .get("http://localhost:5000/api/notifications/vapid")
      .then((res) => {
        console.log("VAPID from backend:", res.data);
        if (!res.data?.publicKey) {
          console.error("No publicKey field in /vapid response");
        } else {
          setVapidPublicKey(res.data.publicKey);
        }
      })
      .catch((err) => {
        console.error("Error loading VAPID key:", err);
      })
      .finally(() => {
        setLoadingKey(false);
      });

    // Check existing subscription
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then(async (reg) => {
        const sub = await reg.pushManager.getSubscription();
        setEnabled(!!sub);
      });
    }
  }, []);

  const enableNotifications = async () => {
    try {
      if (loadingKey) {
        alert("Still loading VAPID key from server. Please wait 1–2 seconds.");
        return;
      }

      if (!vapidPublicKey) {
        alert(
          "VAPID key not loaded from backend. Check console for /api/notifications/vapid error."
        );
        return;
      }

      const subscription = await askPushPermissionAndSubscribe(vapidPublicKey);

      await axios.post("http://localhost:5000/api/notifications/subscribe", {
        subscription,
        farmerId,
      });

      setEnabled(true);
      alert("Notifications enabled!");
    } catch (err: any) {
      console.error(err);
      alert("Failed to enable notifications: " + err.message);
    }
  };

  const disableNotifications = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await axios.post("http://localhost:5000/api/notifications/unsubscribe", {
          endpoint: sub.endpoint,
        });

        await sub.unsubscribe();
      }
      setEnabled(false);
      alert("Notifications disabled.");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button
      onClick={enabled ? disableNotifications : enableNotifications}
      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
      disabled={loadingKey}
    >
      {loadingKey
        ? "Loading..."
        : enabled
        ? "Disable Scheme Alerts"
        : "Enable Scheme Alerts"}
    </button>
  );
}
