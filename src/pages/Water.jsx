import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Water() {
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState(8);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/");
      return;
    }

    const loadData = async () => {
      try {
        const refDoc = doc(db, "users", auth.currentUser.uid, "water", today);
        const snap = await getDoc(refDoc);

        if (snap.exists()) {
          const data = snap.data();
          setGoal(data.goal || 8);
          setCount(data.count || 0);
        } else {
          // Create new daily record
          await setDoc(refDoc, {
            date: today,
            goal: 8,
            count: 0,
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate, today]);

  const saveData = async (newGoal, newCount) => {
    try {
      const refDoc = doc(db, "users", auth.currentUser.uid, "water", today);

      await setDoc(refDoc, {
        date: today,
        goal: newGoal,
        count: newCount,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const increase = async () => {
    const newCount = count + 1;
    setCount(newCount);
    await saveData(goal, newCount);
  };

  const decrease = async () => {
    if (count === 0) return;
    const newCount = count - 1;
    setCount(newCount);
    await saveData(goal, newCount);
  };

  const updateGoal = async (newGoal) => {
    const g = Number(newGoal);
    setGoal(g);
    await saveData(g, count);
  };

  const progressPercent = Math.min((count / goal) * 100, 100);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <h5>Loading...</h5>
      </div>
    );
  }

  return (
    <div className="container page-wrap" style={{ maxWidth: "520px" }}>
      <h4>Water Tracker 💧</h4>

      <button
        className="btn btn-outline-secondary w-100 mb-3"
        onClick={() => navigate("/dashboard")}
      >
        ⬅ Back to Dashboard
      </button>

      <div className="card p-4 shadow-sm">
        <h5 className="mb-3">Today: {today}</h5>

        <label className="form-label fw-bold">Daily Goal (Glasses)</label>
        <input
          type="number"
          className="form-control mb-3"
          value={goal}
          min="1"
          max="30"
          onChange={(e) => updateGoal(e.target.value)}
        />

        <h3 className="text-center mb-3">
          {count} / {goal}
        </h3>

        <div className="progress mb-3" style={{ height: "20px" }}>
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: `${progressPercent}%` }}
          >
            {Math.round(progressPercent)}%
          </div>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-danger w-50" onClick={decrease}>
            -1 Glass
          </button>
          <button className="btn btn-success w-50" onClick={increase}>
            +1 Glass
          </button>
        </div>
      </div>

      {count >= goal && (
        <div className="alert alert-success mt-3 text-center">
          🎉 Goal completed! Great job!
        </div>
      )}
    </div>
  );
}
