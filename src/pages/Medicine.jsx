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
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Medicine() {
  const navigate = useNavigate();

  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  const [morning, setMorning] = useState(true);
  const [afternoon, setAfternoon] = useState(false);
  const [night, setNight] = useState(false);

  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/");
      return;
    }

    const refCol = collection(db, "users", auth.currentUser.uid, "medicines");
    const q = query(refCol, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setMedicines(data);
    });

    return () => unsub();
  }, [navigate]);

  const saveMedicine = async () => {
    if (!medicineName || !dosage) {
      alert("Please enter medicine name and dosage");
      return;
    }

    if (!morning && !afternoon && !night) {
      alert("Please select at least one time (Morning/Afternoon/Night)");
      return;
    }

    try {
      const refCol = collection(db, "users", auth.currentUser.uid, "medicines");

      await addDoc(refCol, {
        medicineName,
        dosage,
        startDate,
        endDate: endDate || null,
        notes,
        schedule: {
          morning,
          afternoon,
          night,
        },
        active: true,
        createdAt: new Date().toISOString(),
      });

      setMedicineName("");
      setDosage("");
      setEndDate("");
      setNotes("");
      setMorning(true);
      setAfternoon(false);
      setNight(false);

      alert("Medicine saved successfully");
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleActive = async (medicine) => {
    try {
      const refDoc = doc(db, "users", auth.currentUser.uid, "medicines", medicine.id);

      await updateDoc(refDoc, {
        active: !medicine.active,
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteMedicine = async (id) => {
    if (!confirm("Delete this medicine?")) return;

    try {
      await deleteDoc(doc(db, "users", auth.currentUser.uid, "medicines", id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "520px" }}>
      <h4>Medicine Tracker</h4>

      <button
        className="btn btn-outline-secondary w-100 mb-3"
        onClick={() => navigate("/dashboard")}
      >
        ⬅ Back to Dashboard
      </button>

      <div className="card p-3 shadow-sm mb-4">
        <label className="form-label fw-bold">Medicine Name</label>
        <input
          className="form-control mb-3"
          value={medicineName}
          onChange={(e) => setMedicineName(e.target.value)}
          placeholder="Example: Folic Acid"
        />

        <label className="form-label fw-bold">Dosage</label>
        <input
          className="form-control mb-3"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          placeholder="Example: 1 Tablet"
        />

        <label className="form-label fw-bold">Schedule</label>

        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            checked={morning}
            onChange={(e) => setMorning(e.target.checked)}
          />
          <label className="form-check-label">Morning</label>
        </div>

        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            checked={afternoon}
            onChange={(e) => setAfternoon(e.target.checked)}
          />
          <label className="form-check-label">Afternoon</label>
        </div>

        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            checked={night}
            onChange={(e) => setNight(e.target.checked)}
          />
          <label className="form-check-label">Night</label>
        </div>

        <label className="form-label fw-bold">Start Date</label>
        <input
          type="date"
          className="form-control mb-3"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <label className="form-label fw-bold">End Date (Optional)</label>
        <input
          type="date"
          className="form-control mb-3"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <label className="form-label fw-bold">Notes (Optional)</label>
        <textarea
          className="form-control mb-3"
          rows="2"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any notes..."
        />

        <button className="btn btn-primary w-100" onClick={saveMedicine}>
          Save Medicine
        </button>
      </div>

      <h5>Medicine List</h5>

      {medicines.length === 0 && (
        <p className="text-muted">No medicines added yet.</p>
      )}

      {medicines.map((m) => (
        <div className="card p-3 mb-2 shadow-sm" key={m.id}>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <b>{m.medicineName}</b>
              <div className="text-muted small">{m.dosage}</div>

              <div className="mt-2">
                {m.schedule?.morning && <span className="badge bg-success me-1">Morning</span>}
                {m.schedule?.afternoon && <span className="badge bg-warning text-dark me-1">Afternoon</span>}
                {m.schedule?.night && <span className="badge bg-primary me-1">Night</span>}
              </div>

              <div className="text-muted small mt-2">
                Start: {m.startDate}
                {m.endDate ? ` | End: ${m.endDate}` : ""}
              </div>

              {m.notes && <div className="mt-2">{m.notes}</div>}
            </div>

            <button
              className={`btn btn-sm ${m.active ? "btn-success" : "btn-secondary"}`}
              onClick={() => toggleActive(m)}
            >
              {m.active ? "Active" : "Inactive"}
            </button>
          </div>

          <button
            className="btn btn-sm btn-danger mt-3 w-100"
            onClick={() => deleteMedicine(m.id)}
          >
            Delete Medicine
          </button>
        </div>
      ))}
    </div>
  );
}