import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { showNotification } from "../utils/notifications";

export default function ReminderEngine() {
  const [lastTriggered, setLastTriggered] = useState({});

  useEffect(() => {
    let interval = null;

    const checkReminders = async () => {
      if (!auth.currentUser) return;

      try {
        const refDoc = doc(db, "users", auth.currentUser.uid, "settings", "reminders");
        const snap = await getDoc(refDoc);

        if (!snap.exists()) return;

        const settings = snap.data();

        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5); // HH:MM
        const today = now.toISOString().split("T")[0];

        const triggerKey = (name) => `${today}-${name}-${currentTime}`;

        // Medicine reminder
        if (settings.medicineReminder && settings.medicineTime === currentTime) {
          const key = triggerKey("medicine");
          if (!lastTriggered[key]) {
            showNotification("Medicine Reminder 💊", "Time to take your medicine.");
            setLastTriggered((prev) => ({ ...prev, [key]: true }));
          }
        }

        // Water reminder
        if (settings.waterReminder && settings.waterTime === currentTime) {
          const key = triggerKey("water");
          if (!lastTriggered[key]) {
            showNotification("Water Reminder 💧", "Drink water now.");
            setLastTriggered((prev) => ({ ...prev, [key]: true }));
          }
        }

        // Checklist reminder
        if (settings.checklistReminder && settings.checklistTime === currentTime) {
          const key = triggerKey("checklist");
          if (!lastTriggered[key]) {
            showNotification("Daily Checklist ✅", "Complete today’s checklist.");
            setLastTriggered((prev) => ({ ...prev, [key]: true }));
          }
        }
      } catch (err) {
        console.log("Reminder check error:", err.message);
      }
    };

    interval = setInterval(checkReminders, 30000); // every 30 sec
    return () => clearInterval(interval);
  }, [lastTriggered]);

  return null;
}