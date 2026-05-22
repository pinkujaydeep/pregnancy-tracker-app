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

export default function Contractions() {
  const navigate = useNavigate();

  const [running, setRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [currentDuration, setCurrentDuration] = useState(0);

  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/");
      return;
    }

    const refCol = collection(db, "users", auth.currentUser.uid, "contractions");
    const q = query(refCol, orderBy("startTime", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setHistory(data);
    });

    return () => unsub();
  }, [navigate]);

  useEffect(() => {
    let timer = null;

    if (running && startTime) {
      timer = setInterval(() => {
        const now = Date.now();
        setCurrentDuration(Math.floor((now - startTime) / 1000));
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [running, startTime]);

  const startContraction = () => {
    setRunning(true);
    setStartTime(Date.now());
    setCurrentDuration(0);
  };

  const stopContraction = async () => {
    if (!running || !startTime) return;

    const endTime = Date.now();
    const durationSeconds = Math.floor((endTime - startTime) / 1000);

    let gapSeconds = null;

    if (history.length > 0) {
      const last = history[0]; // most recent contraction
      const lastStart = new Date(last.startTime).getTime();
      gapSeconds = Math.floor((startTime - lastStart) / 1000);
    }

    try {
      const refCol = collection(db, "users", auth.currentUser.uid, "contractions");

      await addDoc(refCol, {
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        durationSeconds,
        gapSeconds,
        createdAt: new Date().toISOString(),
      });

      setRunning(false);
      setStartTime(null);
      setCurrentDuration(0);

      alert("Contraction saved!");
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteRecord = async (id) => {
    if (!confirm("Delete this contraction record?")) return;

    try {
      await deleteDoc(doc(db, "users", auth.currentUser.uid, "contractions", id));
    } catch (err) {
      alert(err.message);
    }
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}m ${sec}s`;
  };

  return (
    <div className="container page-wrap" style={{ maxWidth: "520px" }}>
      <h4>Contraction Timer ⏱️</h4>

      <button
        className="btn btn-outline-secondary w-100 mb-3"
        onClick={() => navigate("/dashboard")}
      >
        ⬅ Back to Dashboard
      </button>

      <div className="card p-4 shadow-sm mb-4 text-center">
        {!running ? (
          <button className="btn btn-success w-100" onClick={startContraction}>
            Start Contraction
          </button>
        ) : (
          <>
            <h2 className="mb-3">{formatTime(currentDuration)}</h2>

            <button className="btn btn-danger w-100" onClick={stopContraction}>
              Stop & Save
            </button>
          </>
        )}
      </div>

      <h5>Contraction History</h5>

      {history.length === 0 && (
        <p className="text-muted">No contractions recorded yet.</p>
      )}

      {history.map((c) => (
        <div className="card p-3 mb-2 shadow-sm" key={c.id}>
          <div className="d-flex justify-content-between">
            <div>
              <b>Duration: {formatTime(c.durationSeconds)}</b>

              <div className="text-muted small">
                Start: {new Date(c.startTime).toLocaleString("en-IN")}
              </div>

              {c.gapSeconds !== null && (
                <div className="text-muted small">
                  Gap since last: {formatTime(c.gapSeconds)}
                </div>
              )}
            </div>

            <button
              className="btn btn-sm btn-danger"
              onClick={() => deleteRecord(c.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
