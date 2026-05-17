import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { calculatePregnancyProgress } from "../utils/pregnancy";

export default function Dashboard() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const [checklistPercent, setChecklistPercent] = useState(0);
  const [waterInfo, setWaterInfo] = useState({ count: 0, goal: 8 });
  const [nextAppointment, setNextAppointment] = useState(null);
  const [appointmentAlert, setAppointmentAlert] = useState(null);
  const [activeMedicines, setActiveMedicines] = useState(0);

  const logout = async () => {
    await signOut(auth);
    navigate("/");
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/");
        return;
      }

      try {
        // Profile
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          navigate("/setup");
          return;
        }

        const profileData = snap.data();
        setProfile(profileData);

        // Checklist
        const checklistRef = doc(db, "users", user.uid, "dailyChecklist", today);
        const checklistSnap = await getDoc(checklistRef);

        if (checklistSnap.exists()) {
          const checklist = checklistSnap.data().checklist;
          const completed = Object.values(checklist).filter(Boolean).length;
          const total = Object.keys(checklist).length;
          setChecklistPercent(Math.round((completed / total) * 100));
        }

        // Water
        const waterRef = doc(db, "users", user.uid, "water", today);
        const waterSnap = await getDoc(waterRef);

        if (waterSnap.exists()) {
          setWaterInfo({
            count: waterSnap.data().count || 0,
            goal: waterSnap.data().goal || 8,
          });
        }

        // Next Appointment
        const apptRef = collection(db, "users", user.uid, "appointments");
        const apptQuery = query(apptRef, orderBy("dateTime", "asc"), limit(1));
        const apptSnap = await getDocs(apptQuery);

        if (!apptSnap.empty) {
          const apptData = apptSnap.docs[0].data();
          setNextAppointment(apptData);

          const apptTime = new Date(apptData.dateTime).getTime();
          const nowTime = Date.now();

          const diffHours = (apptTime - nowTime) / (1000 * 60 * 60);

          if (diffHours > 0 && diffHours <= 24) {
            setAppointmentAlert(
              `⚠️ Appointment in ${Math.round(diffHours)} hours: ${apptData.title}`
            );
          } else {
            setAppointmentAlert(null);
          }
        } else {
          setNextAppointment(null);
          setAppointmentAlert(null);
        }

        // Active Medicines count
        const medRef = collection(db, "users", user.uid, "medicines");
        const medSnap = await getDocs(medRef);
        const activeCount = medSnap.docs.filter((d) => d.data().active === true).length;
        setActiveMedicines(activeCount);

      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [navigate, today]);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <h5>Loading dashboard...</h5>
      </div>
    );
  }

  if (!profile) return null;

  const progress = calculatePregnancyProgress(profile.lmpDate);
  const waterPercent = Math.min(Math.round((waterInfo.count / waterInfo.goal) * 100), 100);

  const Tile = ({ title, subtitle, color, onClick }) => (
    <div
      className={`card p-3 shadow-sm ${color}`}
      style={{ cursor: "pointer", minHeight: "110px" }}
      onClick={onClick}
    >
      <div className="fw-bold">{title}</div>
      <div className="small mt-2">{subtitle}</div>
    </div>
  );

  return (
    <div className="container mt-3" style={{ maxWidth: "520px" }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div>
          <h5 className="mb-0">Hi {profile.name} 👋</h5>
          <small className="text-muted">{today}</small>
        </div>

        <button className="btn btn-sm btn-outline-danger" onClick={logout}>
          Logout
        </button>
      </div>

      {/* Pregnancy Summary Card */}
      <div className="card p-3 shadow-sm mb-3">
        <div className="d-flex justify-content-between">
          <div>
            <h5 className="mb-1">Week {progress.week}</h5>
            <div className="text-muted small">
              Day {progress.day} • Trimester {progress.trimester}
            </div>
          </div>

          <div className="text-end">
            <div className="fw-bold small">Due Date</div>
            <div className="text-muted small">
              {new Date(profile.dueDate).toLocaleDateString("en-IN")}
            </div>
          </div>
        </div>
      </div>

      {appointmentAlert && (
        <div className="alert alert-warning shadow-sm">
          <b>Upcoming Appointment Reminder</b>
          <div>{appointmentAlert}</div>
        </div>
      )}

      {/* Tiles Grid */}
      <div className="row g-2 mb-3">
        <div className="col-6">
          <Tile
            title="Checklist ✅"
            subtitle={`${checklistPercent}% completed`}
            color="border-success"
            onClick={() => navigate("/checklist")}
          />
        </div>

        <div className="col-6">
          <Tile
            title="Water 💧"
            subtitle={`${waterInfo.count}/${waterInfo.goal} (${waterPercent}%)`}
            color="border-info"
            onClick={() => navigate("/water")}
          />
        </div>

        <div className="col-6">
          <Tile
            title="Medicines 💊"
            subtitle={`${activeMedicines} active`}
            color="border-primary"
            onClick={() => navigate("/medicine")}
          />
        </div>

        <div className="col-6">
          <Tile
            title="Symptoms 🤒"
            subtitle="Track daily symptoms"
            color="border-secondary"
            onClick={() => navigate("/symptoms")}
          />
        </div>

        <div className="col-6">
          <Tile
            title="Weekly Guide 📘"
            subtitle={`Current week: ${progress.week}`}
            color="border-dark"
            onClick={() => navigate("/weekly-guide")}
          />
        </div>

        <div className="col-6">
          <Tile
            title="Weight ⚖️"
            subtitle="Track weight logs"
            color="border-warning"
            onClick={() => navigate("/weight")}
          />
        </div>

        <div className="col-6">
          <Tile
            title="Kick Counter 👶"
            subtitle="Save kick sessions"
            color="border-primary"
            onClick={() => navigate("/kicks")}
          />
        </div>

        <div className="col-6">
          <Tile
            title="Contractions ⏱️"
            subtitle="Timer for contractions"
            color="border-danger"
            onClick={() => navigate("/contractions")}
          />
        </div>

        <div className="col-12">
          <Tile
            title="Appointments 📅"
            subtitle={
              nextAppointment
                ? `${nextAppointment.title} • ${new Date(nextAppointment.dateTime).toLocaleString("en-IN")}`
                : "No upcoming appointment"
            }
            color="border-warning"
            onClick={() => navigate("/appointments")}
          />
        </div>

        <div className="col-12">
          <Tile
            title="Reports 📂"
            subtitle="Upload scan / prescription"
            color="border-info"
            onClick={() => navigate("/reports")}
          />
        </div>
      </div>
    </div>
  );
}