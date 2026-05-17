export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    alert("Notifications not supported in this browser.");
    return false;
  }

  if (Notification.permission === "granted") return true;

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

export function showNotification(title, body) {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  new Notification(title, {
    body,
    icon: "/icon.png", // optional (if you have)
  });
}