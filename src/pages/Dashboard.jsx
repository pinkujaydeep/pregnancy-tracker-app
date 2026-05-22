import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, query, orderBy, limit, getDocs, where, getCountFromServer } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { calculatePregnancyProgress } from "../utils/pregnancy";
import TileCard from "../components/TileCard";

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
        // Fetch profile first, then load all dashboard pieces in parallel
        const userRef = doc(db, "users", user.uid);
        const profileSnap = await getDoc(userRef);

        if (!profileSnap.exists()) {
          navigate("/setup");
          return;
        }

        const profileData = profileSnap.data();
        setProfile(profileData);

        const checklistRef = doc(db, "users", user.uid, "dailyChecklist", today);
        const waterRef = doc(db, "users", user.uid, "water", today);
        const apptRef = collection(db, "users", user.uid, "appointments");
        const medRef = collection(db, "users", user.uid, "medicines");

        const [checklistSnap, waterSnap, apptSnap, medCountSnap] = await Promise.all([
          getDoc(checklistRef),
          getDoc(waterRef),
          getDocs(query(apptRef, orderBy("dateTime", "asc"), limit(50))),
          getCountFromServer(query(medRef, where("active", "==", true))),
        ]);

        if (checklistSnap.exists()) {
          const checklist = checklistSnap.data().checklist;
          const completed = Object.values(checklist).filter(Boolean).length;
          const total = Object.keys(checklist).length;
          setChecklistPercent(Math.round((completed / total) * 100));
        }

        if (waterSnap.exists()) {
          setWaterInfo({
            count: waterSnap.data().count || 0,
            goal: waterSnap.data().goal || 8,
          });
        }

        const upcoming = apptSnap.docs
          .map((d) => d.data())
          .find((appt) => new Date(appt.dateTime).getTime() >= Date.now());

        if (upcoming) {
          setNextAppointment(upcoming);
          const apptTime = new Date(upcoming.dateTime).getTime();
          const diffHours = (apptTime - Date.now()) / (1000 * 60 * 60);

          if (diffHours > 0 && diffHours <= 24) {
            setAppointmentAlert(`⚠️ Appointment in ${Math.round(diffHours)} hours: ${upcoming.title}`);
          } else {
            setAppointmentAlert(null);
          }
        } else {
          setNextAppointment(null);
          setAppointmentAlert(null);
        }

        setActiveMedicines(medCountSnap.data().count || 0);
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

  return (
    <div className="container page-wrap" style={{ maxWidth: "560px" }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-0">Hi {profile.name} 👋</h4>
          <small className="text-muted">{new Date(today).toLocaleDateString("en-IN")}</small>
        </div>

        <button className="btn btn-sm btn-outline-danger" onClick={logout}>
          Logout
        </button>
      </div>

      {/* Pregnancy Summary Card */}
      <div className="card p-2 shadow-sm mb-2 gradient-card">
        <div className="d-flex justify-content-between align-items-start gap-2">
          <div>
            <h5 className="mb-1 fs-6">Week {progress.week}</h5>
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

      <div className="card p-2 shadow-sm mb-3">
        <div className="d-flex justify-content-between align-items-center gap-2">
          <div>
            <div className="fw-semibold">Need urgent help?</div>
            <div className="text-muted small">One tap access to emergency contacts and danger signs.</div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={() => navigate("/emergency") }>
            Open
          </button>
        </div>
      </div>

      {appointmentAlert && (
        <div className="alert alert-warning shadow-sm">
          <b>Upcoming Appointment Reminder</b>
          <div>{appointmentAlert}</div>
        </div>
      )}

      {/* Tiles Grid */}
      <div className="row g-1 mb-3">
        <div className="col-6">
          <TileCard
            title="Checklist ✅"
            subtitle={`${checklistPercent}% completed`}
            color="border-success"
            onClick={() => navigate("/checklist")}
          />
        </div>

        <div className="col-6">
          <TileCard
            title="Water 💧"
            subtitle={`${waterInfo.count}/${waterInfo.goal} (${waterPercent}%)`}
            color="border-info"
            onClick={() => navigate("/water")}
          />
        </div>

        <div className="col-6">
          <TileCard
            title="Medicines 💊"
            subtitle={`${activeMedicines} active`}
            color="border-primary"
            onClick={() => navigate("/medicine")}
          />
        </div>

        <div className="col-6">
          <TileCard
            title="Symptoms 🤒"
            subtitle="Track daily symptoms"
            color="border-secondary"
            onClick={() => navigate("/symptoms")}
          />
        </div>

        <div className="col-6">
          <TileCard
            title="Weekly Guide 📘"
            subtitle={`Current week: ${progress.week}`}
            color="border-dark"
            onClick={() => navigate("/weekly-guide")}
          />
        </div>

        <div className="col-6">
          <TileCard
            title="Weight ⚖️"
            subtitle="Track weight logs"
            color="border-warning"
            onClick={() => navigate("/weight")}
          />
        </div>

        <div className="col-6">
          <TileCard
            title="Kick Counter 👶"
            subtitle="Save kick sessions"
            color="border-primary"
            onClick={() => navigate("/kicks")}
          />
        </div>

        <div className="col-6">
          <TileCard
            title="Contractions ⏱️"
            subtitle="Timer for contractions"
            color="border-danger"
            onClick={() => navigate("/contractions")}
          />
        </div>

        <div className="col-12">
          <TileCard
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
          <TileCard
            title="Reports 📂"
            subtitle="Upload scan / prescription"
            color="border-info"
            onClick={() => navigate("/reports")}
          />
        </div>

        <div className="col-12">
          <TileCard
            title="Insights 📈"
            subtitle="Trends and personal summary PDF"
            color="border-success"
            onClick={() => navigate("/insights")}
          />
        </div>

        <div className="col-12">
          <TileCard
            title="My Journal 📝"
            subtitle="Daily mood and notes"
            color="border-primary"
            onClick={() => navigate("/journal")}
          />
        </div>

        <div className="col-12">
          <TileCard
            title="Birth Plan 🎒"
            subtitle="Personal delivery checklist"
            color="border-warning"
            onClick={() => navigate("/birth-plan")}
          />
        </div>

        <div className="col-12">
          <TileCard
            title="Emergency 🚨"
            subtitle="Call-ready support details"
            color="border-danger"
            onClick={() => navigate("/emergency")}
          />
        </div>
      </div>
    </div>
  );
}