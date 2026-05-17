import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { calculatePregnancyProgress } from "../utils/pregnancy";

export default function Dashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

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
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          navigate("/setup");
          return;
        }

        setProfile(snap.data());
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [navigate]);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <h5>Loading dashboard...</h5>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const progress = calculatePregnancyProgress(profile.lmpDate);

  return (
    <div className="container mt-4" style={{ maxWidth: "500px" }}>
      <h3>Hello {profile.name} 👋</h3>

      <div className="card p-4 mt-3 shadow-sm">
        <h4>
          Week {progress.week}, Day {progress.day}
        </h4>
        <p>Trimester: {progress.trimester}</p>

        <p>
          Due Date:{" "}
          {new Date(profile.dueDate).toLocaleDateString("en-IN")}
        </p>
      </div>

      <button
        className="btn btn-primary mt-3 w-100"
        onClick={() => navigate("/weekly-guide")}
      >
        Weekly Guide
      </button>

      <button
        className="btn btn-success mt-3 w-100"
        onClick={() => navigate("/symptoms")}
      >
        Symptoms Tracker
      </button>

      <button
        className="btn btn-warning mt-3 w-100"
        onClick={() => navigate("/appointments")}
      >
        Appointments
      </button>

      <button
        className="btn btn-info mt-3 w-100"
        onClick={() => navigate("/reports")}
      >
        Reports Upload
      </button>

      <button
        className="btn btn-primary mt-3 w-100"
        onClick={() => navigate("/medicine")}
      >
        Medicine Tracker
      </button>

      <button className="btn btn-dark mt-3 w-100" onClick={logout}>
        Logout
      </button>
    </div>
  );
}