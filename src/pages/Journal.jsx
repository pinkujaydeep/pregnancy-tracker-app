import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

const moodOptions = ["Great", "Good", "Okay", "Low", "Anxious"];

export default function Journal() {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [mood, setMood] = useState("Good");
  const [energy, setEnergy] = useState(5);
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/");
      return;
    }

    const ref = collection(db, "users", auth.currentUser.uid, "journalEntries");
    const q = query(ref, orderBy("date", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      setEntries(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [navigate]);

  const saveEntry = async () => {
    if (!note.trim()) {
      alert("Please add a note before saving.");
      return;
    }

    try {
      const ref = collection(db, "users", auth.currentUser.uid, "journalEntries");
      await addDoc(ref, {
        date,
        mood,
        energy: Number(energy),
        note: note.trim(),
        createdAt: new Date().toISOString(),
      });
      setNote("");
      setMood("Good");
      setEnergy(5);
    } catch (error) {
      alert(error.message);
    }
  };

  const deleteEntry = async (id) => {
    if (!confirm("Delete this journal entry?")) return;

    try {
      await deleteDoc(doc(db, "users", auth.currentUser.uid, "journalEntries", id));
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="container page-wrap" style={{ maxWidth: "560px" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0">My Daily Journal</h4>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate("/dashboard")}>
          Back
        </button>
      </div>

      <div className="card p-3 shadow-sm mb-3">
        <label className="form-label fw-bold">Date</label>
        <input
          type="date"
          className="form-control mb-3"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <label className="form-label fw-bold">Mood</label>
        <select className="form-select mb-3" value={mood} onChange={(e) => setMood(e.target.value)}>
          {moodOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <label className="form-label fw-bold">Energy ({energy}/10)</label>
        <input
          type="range"
          min="1"
          max="10"
          className="form-range mb-3"
          value={energy}
          onChange={(e) => setEnergy(e.target.value)}
        />

        <label className="form-label fw-bold">Note</label>
        <textarea
          className="form-control mb-3"
          rows="3"
          placeholder="How was your day? Any feelings, cravings, concerns, or wins?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <button className="btn btn-primary w-100" onClick={saveEntry}>
          Save Journal Entry
        </button>
      </div>

      <h6 className="mb-2">Recent Entries</h6>
      {entries.length === 0 && <p className="text-muted">No journal entries yet.</p>}

      {entries.map((entry) => (
        <div className="card p-3 shadow-sm mb-2" key={entry.id}>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <div className="fw-semibold">{entry.mood} • Energy {entry.energy}/10</div>
              <div className="small text-muted">{entry.date}</div>
            </div>
            <button className="btn btn-sm btn-danger" onClick={() => deleteEntry(entry.id)}>
              Delete
            </button>
          </div>

          <p className="mb-0 mt-2">{entry.note}</p>
        </div>
      ))}
    </div>
  );
}
