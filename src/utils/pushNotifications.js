import { doc, setDoc } from "firebase/firestore";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

export async function enableFreePush({ app, db, uid, vapidKey }) {
  if (!uid) throw new Error("User not found");

  const supported = await isSupported();
  if (!supported) {
    throw new Error("Push notifications are not supported on this browser.");
  }

  if (!vapidKey) {
    throw new Error("Missing VAPID key. Set VITE_FIREBASE_VAPID_KEY in environment.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission denied.");
  }

  const messaging = getMessaging(app);
  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: await navigator.serviceWorker.register("/firebase-messaging-sw.js"),
  });

  if (!token) {
    throw new Error("Could not generate push token.");
  }

  await setDoc(
    doc(db, "users", uid, "settings", "push"),
    {
      token,
      enabled: true,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return token;
}
