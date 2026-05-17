import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function DailyChecklist() {
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  const [loading, setLoading] = useState(true);

  const [checklist, setChecklist] = useState({
    medicinesTaken: false,
    drankWater: false,
    prenatalVitamins: false,
    exerciseDone: false,
    fruitsEaten: false,
    healthyMeal: false,
    sleptWell: false,
    moodChecked: false,
  });

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/");
      return;
    }

    const loadChecklist = async () => {
      try {
        const refDoc = doc(db, "users", auth.currentUser.uid, "dailyChecklist", today);
        const snap = await getDoc(refDoc);

        if (snap.exists()) {
          setChecklist(snap.data().checklist);
        } else {
          await setDoc(refDoc, {
            date: today,
            checklist,
            createdAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadChecklist();
  }, [navigate, today]);

  const updateChecklist = async (field, value) => {
    const updated = { ...checklist, [field]: value };
    setChecklist(updated);

    try {
      const refDoc = doc(db, "users", auth.currentUser.uid, "dailyChecklist", today);

      await setDoc(refDoc, {
        date: today,
        checklist: updated,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalCount = Object.keys(checklist).length;
  const percent = Math.round((completedCount / totalCount) * 100);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <h5>Loading checklist...</h5>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ maxWidth: "520px" }}>
      <h4>Daily Checklist ✅</h4>

      <button
        className="btn btn-outline-secondary w-100 mb-3"
        onClick={() => navigate("/dashboard")}
      >
        ⬅ Back to Dashboard
      </button>

      <div className="card p-3 shadow-sm mb-3">
        <h6 className="mb-2">Today: {today}</h6>

        <div className="progress mb-2" style={{ height: "18px" }}>
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: `${percent}%` }}
          >
            {percent}%
          </div>
        </div>

        <div className="text-muted small">
          Completed: {completedCount} / {totalCount}
        </div>
      </div>

      <div className="card p-3 shadow-sm">
        <div className="form-check mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            checked={checklist.medicinesTaken}
            onChange={(e) => updateChecklist("medicinesTaken", e.target.checked)}
          />
          <label className="form-check-label">Took Medicines</label>
        </div>

        <div className="form-check mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            checked={checklist.prenatalVitamins}
            onChange={(e) => updateChecklist("prenatalVitamins", e.target.checked)}
          />
          <label className="form-check-label">Took Prenatal Vitamins</label>
        </div>

        <div className="form-check mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            checked={checklist.drankWater}
            onChange={(e) => updateChecklist("drankWater", e.target.checked)}
          />
          <label className="form-check-label">Drank Enough Water</label>
        </div>

        <div className="form-check mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            checked={checklist.exerciseDone}
            onChange={(e) => updateChecklist("exerciseDone", e.target.checked)}
          />
          <label className="form-check-label">Walk/Exercise Done</label>
        </div>

        <div className="form-check mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            checked={checklist.fruitsEaten}
            onChange={(e) => updateChecklist("fruitsEaten", e.target.checked)}
          />
          <label className="form-check-label">Ate Fruits</label>
        </div>

        <div className="form-check mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            checked={checklist.healthyMeal}
            onChange={(e) => updateChecklist("healthyMeal", e.target.checked)}
          />
          <label className="form-check-label">Healthy Meal</label>
        </div>

        <div className="form-check mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            checked={checklist.sleptWell}
            onChange={(e) => updateChecklist("sleptWell", e.target.checked)}
          />
          <label className="form-check-label">Slept Well</label>
        </div>

        <div className="form-check mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            checked={checklist.moodChecked}
            onChange={(e) => updateChecklist("moodChecked", e.target.checked)}
          />
          <label className="form-check-label">Mood Check</label>
        </div>
      </div>

      {percent === 100 && (
        <div className="alert alert-success mt-3 text-center">
          🎉 Amazing! You completed today’s checklist.
        </div>
      )}
    </div>
  );
}