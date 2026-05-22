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
import { evaluateSymptomRisk } from "../utils/triage";

export default function Symptoms() {
  const navigate = useNavigate();

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [symptomType, setSymptomType] = useState("Nausea");
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState("");
  const [triageInfo, setTriageInfo] = useState(null);

  const [logs, setLogs] = useState([]);

  const symptomOptions = [
    "Nausea",
    "Vomiting",
    "Fatigue",
    "Headache",
    "Back Pain",
    "Cramps",
    "Heartburn",
    "Mood Swings",
    "Dizziness",
    "Swelling",
    "Constipation",
    "Sleep Issues",
  ];

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/");
      return;
    }

    const ref = collection(db, "users", auth.currentUser.uid, "symptoms");
    const q = query(ref, orderBy("date", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setLogs(data);
    });

    return () => unsub();
  }, [navigate]);

  const saveLog = async () => {
    if (!auth.currentUser) return;

    try {
      const ref = collection(db, "users", auth.currentUser.uid, "symptoms");

      await addDoc(ref, {
        date,
        symptomType,
        severity: Number(severity),
        notes,
        triageLevel: evaluateSymptomRisk({ symptomType, severity, notes }).level,
        createdAt: new Date().toISOString(),
      });

      const triage = evaluateSymptomRisk({ symptomType, severity, notes });
      setTriageInfo(triage);

      setNotes("");
      setSeverity(5);
      setSymptomType("Nausea");
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteLog = async (id) => {
    if (!auth.currentUser) return;

    if (!confirm("Delete this symptom log?")) return;

    try {
      await deleteDoc(doc(db, "users", auth.currentUser.uid, "symptoms", id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container page-wrap" style={{ maxWidth: "520px" }}>
      <h4>Symptoms Tracker</h4>

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

        <label className="form-label fw-bold">Symptom</label>
        <select
          className="form-select mb-3"
          value={symptomType}
          onChange={(e) => setSymptomType(e.target.value)}
        >
          {symptomOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <label className="form-label fw-bold">Severity (1 to 10)</label>
        <input
          type="range"
          min="1"
          max="10"
          className="form-range"
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
        />
        <div className="text-center mb-3">
          <b>{severity}</b>/10
        </div>

        <label className="form-label fw-bold">Notes (Optional)</label>
        <textarea
          className="form-control mb-3"
          rows="2"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Extra details..."
        />

        <button className="btn btn-primary w-100" onClick={saveLog}>
          Save Symptom
        </button>
      </div>

      {triageInfo && (
        <div
          className={`alert ${
            triageInfo.level === "high"
              ? "alert-danger"
              : triageInfo.level === "moderate"
              ? "alert-warning"
              : "alert-success"
          }`}
        >
          <div className="fw-semibold">Risk Check: {triageInfo.level.toUpperCase()}</div>
          <div>{triageInfo.message}</div>
          {triageInfo.level === "high" && (
            <button className="btn btn-danger btn-sm mt-2" onClick={() => navigate("/emergency")}>
              Open Emergency Support
            </button>
          )}
        </div>
      )}

      <h5>History</h5>

      {logs.length === 0 && (
        <p className="text-muted">No symptom logs added yet.</p>
      )}

      {logs.map((log) => (
        <div className="card p-3 mb-2 shadow-sm" key={log.id}>
          <div className="d-flex justify-content-between">
            <div>
              <b>{log.symptomType}</b>
              <div className="text-muted small">{log.date}</div>
            </div>

            <button
              className="btn btn-sm btn-danger"
              onClick={() => deleteLog(log.id)}
            >
              Delete
            </button>
          </div>

          <div className="mt-2">
            <span className="badge bg-warning text-dark">
              Severity: {log.severity}/10
            </span>
            {log.triageLevel && (
              <span
                className={`badge ms-2 ${
                  log.triageLevel === "high"
                    ? "bg-danger"
                    : log.triageLevel === "moderate"
                    ? "bg-warning text-dark"
                    : "bg-success"
                }`}
              >
                Risk: {log.triageLevel}
              </span>
            )}
          </div>

          {log.notes && <p className="mt-2 mb-0">{log.notes}</p>}
        </div>
      ))}
    </div>
  );
}
