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

const RENDER_NOW_TS = Date.now();

export default function Appointments() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [hospital, setHospital] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [notes, setNotes] = useState("");
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/");
      return;
    }

    const ref = collection(db, "users", auth.currentUser.uid, "appointments");
    const q = query(ref, orderBy("dateTime", "asc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setAppointments(data);
    });

    return () => unsub();
  }, [navigate]);

  const saveAppointment = async () => {
    if (!title || !dateTime) {
      alert("Please enter title and date/time");
      return;
    }

    if (new Date(dateTime).getTime() < Date.now()) {
      if (!confirm("This appointment time is in the past. Save anyway?")) return;
    }

    try {
      const ref = collection(db, "users", auth.currentUser.uid, "appointments");

      await addDoc(ref, {
        title,
        doctorName,
        hospital,
        dateTime,
        notes,
        createdAt: new Date().toISOString(),
      });

      setTitle("");
      setDoctorName("");
      setHospital("");
      setDateTime("");
      setNotes("");
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteAppointment = async (id) => {
    if (!confirm("Delete this appointment?")) return;

    try {
      await deleteDoc(doc(db, "users", auth.currentUser.uid, "appointments", id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container page-wrap" style={{ maxWidth: "560px" }}>
      <h4>Appointments</h4>

      <button
        className="btn btn-outline-secondary w-100 mb-3"
        onClick={() => navigate("/dashboard")}
      >
        ⬅ Back to Dashboard
      </button>

      <div className="card p-3 shadow-sm mb-4">
        <label className="form-label fw-bold">Appointment Title</label>
        <input
          className="form-control mb-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ultrasound / Doctor Visit"
        />

        <label className="form-label fw-bold">Doctor Name</label>
        <input
          className="form-control mb-3"
          value={doctorName}
          onChange={(e) => setDoctorName(e.target.value)}
          placeholder="Dr. Name"
        />

        <label className="form-label fw-bold">Hospital / Clinic</label>
        <input
          className="form-control mb-3"
          value={hospital}
          onChange={(e) => setHospital(e.target.value)}
          placeholder="Hospital name"
        />

        <label className="form-label fw-bold">Date & Time</label>
        <input
          type="datetime-local"
          className="form-control mb-3"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
        />

        <label className="form-label fw-bold">Notes (Optional)</label>
        <textarea
          className="form-control mb-3"
          rows="2"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any notes..."
        />

        <button className="btn btn-primary w-100" onClick={saveAppointment}>
          Save Appointment
        </button>
      </div>

      <h5>Upcoming Appointments</h5>

      {appointments.length === 0 && (
        <p className="text-muted">No appointments added yet.</p>
      )}

      {appointments.map((a) => (
        <div className="card p-3 mb-2 shadow-sm" key={a.id}>
          <div className="d-flex justify-content-between">
            <div>
              <b>{a.title}</b>
              <div className="text-muted small">
                {new Date(a.dateTime).toLocaleString("en-IN")}
              </div>
              <span
                className={`badge mt-2 ${
                  new Date(a.dateTime).getTime() > RENDER_NOW_TS ? "bg-success" : "bg-secondary"
                }`}
              >
                {new Date(a.dateTime).getTime() > RENDER_NOW_TS ? "Upcoming" : "Past"}
              </span>
            </div>

            <button
              className="btn btn-sm btn-danger"
              onClick={() => deleteAppointment(a.id)}
            >
              Delete
            </button>
          </div>

          {a.doctorName && <div className="mt-2">👨‍⚕️ {a.doctorName}</div>}
          {a.hospital && <div>🏥 {a.hospital}</div>}
          {a.notes && <div className="mt-2">{a.notes}</div>}
        </div>
      ))}
    </div>
  );
}