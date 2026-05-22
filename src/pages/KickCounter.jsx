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

export default function KickCounter() {
  const navigate = useNavigate();

  const [running, setRunning] = useState(false);
  const [kickCount, setKickCount] = useState(0);
  const [startTime, setStartTime] = useState(null);

  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/");
      return;
    }

    const refCol = collection(db, "users", auth.currentUser.uid, "kickSessions");
    const q = query(refCol, orderBy("date", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setHistory(data);
    });

    return () => unsub();
  }, [navigate]);

  const startSession = () => {
    setRunning(true);
    setKickCount(0);
    setStartTime(Date.now());
  };

  const addKick = () => {
    if (!running) return;
    setKickCount((prev) => prev + 1);
  };

  const stopSession = async () => {
    if (!running || !startTime) return;

    const endTime = Date.now();
    const durationMinutes = Math.round((endTime - startTime) / 60000);

    try {
      const refCol = collection(db, "users", auth.currentUser.uid, "kickSessions");

      await addDoc(refCol, {
        date: new Date().toISOString(),
        kicks: kickCount,
        durationMinutes,
        createdAt: new Date().toISOString(),
      });

      setRunning(false);
      setKickCount(0);
      setStartTime(null);

      alert("Kick session saved!");
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteSession = async (id) => {
    if (!confirm("Delete this kick session?")) return;

    try {
      await deleteDoc(doc(db, "users", auth.currentUser.uid, "kickSessions", id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container page-wrap" style={{ maxWidth: "520px" }}>
      <h4>Kick Counter 👶</h4>

      <button
        className="btn btn-outline-secondary w-100 mb-3"
        onClick={() => navigate("/dashboard")}
      >
        ⬅ Back to Dashboard
      </button>

      <div className="card p-4 shadow-sm mb-4 text-center">
        {!running ? (
          <button className="btn btn-success w-100" onClick={startSession}>
            Start Kick Session
          </button>
        ) : (
          <>
            <h2 className="mb-3">{kickCount} kicks</h2>

            <button className="btn btn-primary w-100 mb-2" onClick={addKick}>
              + Add Kick
            </button>

            <button className="btn btn-danger w-100" onClick={stopSession}>
              Stop & Save Session
            </button>
          </>
        )}
      </div>

      <h5>Kick History</h5>

      {history.length === 0 && (
        <p className="text-muted">No kick sessions saved yet.</p>
      )}

      {history.map((s) => (
        <div className="card p-3 mb-2 shadow-sm" key={s.id}>
          <div className="d-flex justify-content-between">
            <div>
              <b>{s.kicks} kicks</b>
              <div className="text-muted small">
                {new Date(s.date).toLocaleString("en-IN")}
              </div>
              <div className="text-muted small">
                Duration: {s.durationMinutes} min
              </div>
            </div>

            <button
              className="btn btn-sm btn-danger"
              onClick={() => deleteSession(s.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
