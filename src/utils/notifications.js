export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    alert("Notifications not supported in this browser.");
    return false;
  }

  if (Notification.permission === "granted") return true;

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

import { playNotificationSound } from "./audio";

export function showNotification(title, body, options = {}) {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const notification = new Notification(title, {
    body,
    icon: "/icon.png",
    tag: options.tag || "default",
    requireInteraction: options.requireInteraction || false,
  });

  // Play sound if enabled
  if (options.sound !== false) {
    playNotificationSound(options.soundType || "bell");
  }

  // Auto-close after 10 seconds if not requireInteraction
  if (!options.requireInteraction) {
    setTimeout(() => notification.close(), 10000);
  }
}