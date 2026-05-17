import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { requestNotificationPermission } from "../utils/notifications";

export default function Reminders() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState({
    medicineReminder: true,
    medicineTime: "09:00",

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

        if (snap.exists()) {
          setSettings(snap.data());
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

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <h5>Loading...</h5>
      </div>
    );
  }

  return (
    <div className="container mt-3" style={{ maxWidth: "520px" }}>
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

      <div className="card p-3 shadow-sm mb-3">
        <h6 className="fw-bold">Medicine Reminder</h6>

        <div className="form-check mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            checked={settings.medicineReminder}
            onChange={(e) =>
              saveSettings({ ...settings, medicineReminder: e.target.checked })
            }
          />
          <label className="form-check-label">Enable Medicine Reminder</label>
        </div>

        <input
          type="time"
          className="form-control"
          value={settings.medicineTime}
          onChange={(e) =>
            saveSettings({ ...settings, medicineTime: e.target.value })
          }
        />
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

      <div className="alert alert-warning">
        ⚠️ These reminders will work only when app is open in browser.
      </div>
    </div>
  );
}