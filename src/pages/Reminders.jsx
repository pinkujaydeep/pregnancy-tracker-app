import { useEffect, useState } from "react";
import { app, auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { requestNotificationPermission } from "../utils/notifications";
import { enableFreePush } from "../utils/pushNotifications";

export default function Reminders() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);

  const [settings, setSettings] = useState({
    medicineReminder: true,
    medicineTimes: [
      { time: "08:00", enabled: true, soundType: "bell" },
      { time: "14:00", enabled: true, soundType: "chime" },
      { time: "20:00", enabled: true, soundType: "alert" },
    ],

    waterReminder: true,
    waterTime: "12:00",

    checklistReminder: true,
    checklistTime: "20:00",
  });

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/");
      return;
    }

    const loadSettings = async () => {
      try {
        const refDoc = doc(db, "users", auth.currentUser.uid, "settings", "reminders");
        const snap = await getDoc(refDoc);
        const pushSnap = await getDoc(doc(db, "users", auth.currentUser.uid, "settings", "push"));

        if (snap.exists()) {
          setSettings(snap.data());
        }

        if (pushSnap.exists()) {
          setPushEnabled(Boolean(pushSnap.data().enabled));
        }
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [navigate]);

  const saveSettings = async (newSettings) => {
    setSettings(newSettings);

    try {
      const refDoc = doc(db, "users", auth.currentUser.uid, "settings", "reminders");
      await setDoc(refDoc, newSettings);
    } catch (err) {
      alert(err.message);
    }
  };

  const enableNotifications = async () => {
    const ok = await requestNotificationPermission();
    if (ok) alert("Notifications enabled!");
  };

  const enableBackgroundPush = async () => {
    try {
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      await enableFreePush({
        app,
        db,
        uid: auth.currentUser?.uid,
        vapidKey,
      });
      setPushEnabled(true);
      alert("Free push is enabled. You can send test pushes from Firebase Console.");
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <h5>Loading...</h5>
      </div>
    );
  }

  return (
    <div className="container page-wrap" style={{ maxWidth: "520px" }}>
      <h4>Reminders 🔔</h4>

      <button
        className="btn btn-outline-secondary w-100 mb-3"
        onClick={() => navigate("/settings")}
      >
        ⬅ Back to Settings
      </button>

      <button className="btn btn-primary w-100 mb-3" onClick={enableNotifications}>
        Enable Browser Notifications
      </button>

      <button className="btn btn-outline-primary w-100 mb-3" onClick={enableBackgroundPush}>
        {pushEnabled ? "Background Push Enabled" : "Enable Free Background Push (FCM)"}
      </button>

      <div className="card p-3 shadow-sm mb-3">
        <h6 className="fw-bold">Medicine Reminder 💊</h6>

        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            checked={settings.medicineReminder}
            onChange={(e) =>
              saveSettings({ ...settings, medicineReminder: e.target.checked })
            }
          />
          <label className="form-check-label">Enable Medicine Reminders</label>
        </div>

        {settings.medicineReminder && settings.medicineTimes && (
          <div className="ms-2">
            {settings.medicineTimes.map((med, idx) => (
              <div key={idx} className="mb-3 p-2 border rounded bg-light">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <label className="form-check-label fw-bold small">
                    {idx === 0 ? "🌅 Morning" : idx === 1 ? "☀️ Afternoon" : "🌙 Night"}
                  </label>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={med.enabled}
                      onChange={(e) => {
                        const updated = [...settings.medicineTimes];
                        updated[idx].enabled = e.target.checked;
                        saveSettings({ ...settings, medicineTimes: updated });
                      }}
                    />
                  </div>
                </div>

                <div className="mb-2">
                  <input
                    type="time"
                    className="form-control form-control-sm"
                    value={med.time}
                    onChange={(e) => {
                      const updated = [...settings.medicineTimes];
                      updated[idx].time = e.target.value;
                      saveSettings({ ...settings, medicineTimes: updated });
                    }}
                  />
                </div>

                <div>
                  <label className="form-label small mb-1">Sound Type:</label>
                  <select
                    className="form-select form-select-sm"
                    value={med.soundType || "bell"}
                    onChange={(e) => {
                      const updated = [...settings.medicineTimes];
                      updated[idx].soundType = e.target.value;
                      saveSettings({ ...settings, medicineTimes: updated });
                    }}
                  >
                    <option value="bell">🔔 Bell</option>
                    <option value="chime">🎶 Chime</option>
                    <option value="alert">🚨 Alert</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-3 shadow-sm mb-3">
        <h6 className="fw-bold">Water Reminder</h6>

        <div className="form-check mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            checked={settings.waterReminder}
            onChange={(e) =>
              saveSettings({ ...settings, waterReminder: e.target.checked })
            }
          />
          <label className="form-check-label">Enable Water Reminder</label>
        </div>

        <input
          type="time"
          className="form-control"
          value={settings.waterTime}
          onChange={(e) =>
            saveSettings({ ...settings, waterTime: e.target.value })
          }
        />
      </div>

      <div className="card p-3 shadow-sm mb-3">
        <h6 className="fw-bold">Checklist Reminder</h6>

        <div className="form-check mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            checked={settings.checklistReminder}
            onChange={(e) =>
              saveSettings({ ...settings, checklistReminder: e.target.checked })
            }
          />
          <label className="form-check-label">Enable Checklist Reminder</label>
        </div>

        <input
          type="time"
          className="form-control"
          value={settings.checklistTime}
          onChange={(e) =>
            saveSettings({ ...settings, checklistTime: e.target.value })
          }
        />
      </div>
    </div>
  );
}
