import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Weight() {
  const navigate = useNavigate();

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");

  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/");
      return;
    }

    const refCol = collection(db, "users", auth.currentUser.uid, "weightLogs");
    const q = query(refCol, orderBy("date", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setLogs(data);
    });

    return () => unsub();
  }, [navigate]);

  const saveWeight = async () => {
    if (!weight) {
      alert("Please enter weight");
      return;
    }

    if (isNaN(weight)) {
      alert("Weight must be a number");
      return;
    }

    try {
      const refCol = collection(db, "users", auth.currentUser.uid, "weightLogs");

      await addDoc(refCol, {
        date,
        weight: Number(weight),
        notes,
        createdAt: new Date().toISOString(),
      });

      setWeight("");
      setNotes("");
      alert("Weight saved successfully");
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteWeight = async (id) => {
    if (!confirm("Delete this weight entry?")) return;

    try {
      await deleteDoc(doc(db, "users", auth.currentUser.uid, "weightLogs", id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container page-wrap" style={{ maxWidth: "520px" }}>
      <h4>Weight Tracker ⚖️</h4>

      <button
        className="btn btn-outline-secondary w-100 mb-3"
        onClick={() => navigate("/dashboard")}
      >
        ⬅ Back to Dashboard
      </button>

      <div className="card p-3 shadow-sm mb-4">
        <label className="form-label fw-bold">Date</label>
        <input
          type="date"
          className="form-control mb-3"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <label className="form-label fw-bold">Weight (kg)</label>
        <input
          type="number"
          className="form-control mb-3"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Example: 62.5"
        />

        <label className="form-label fw-bold">Notes (Optional)</label>
        <textarea
          className="form-control mb-3"
          rows="2"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Example: morning weight"
        />

        <button className="btn btn-primary w-100" onClick={saveWeight}>
          Save Weight
        </button>
      </div>

      <h5>Weight History</h5>

      {logs.length === 0 && (
        <p className="text-muted">No weight entries added yet.</p>
      )}

      {logs.map((log) => (
        <div className="card p-3 mb-2 shadow-sm" key={log.id}>
          <div className="d-flex justify-content-between">
            <div>
              <b>{log.weight} kg</b>
              <div className="text-muted small">{log.date}</div>
            </div>

            <button
              className="btn btn-sm btn-danger"
              onClick={() => deleteWeight(log.id)}
            >
              Delete
            </button>
          </div>

          {log.notes && <div className="mt-2">{log.notes}</div>}
        </div>
      ))}
    </div>
  );
}
