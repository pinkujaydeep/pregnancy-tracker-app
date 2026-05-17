import { useState } from "react";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { calculateDueDate } from "../utils/pregnancy";
import { useNavigate } from "react-router-dom";

export default function ProfileSetup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [lmpDate, setLmpDate] = useState("");
  const [cycleLength, setCycleLength] = useState(28);

  const saveProfile = async () => {
    if (!name || !lmpDate) {
      alert("Please enter name and LMP date");
      return;
    }

    const dueDate = calculateDueDate(lmpDate);

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);

      await setDoc(userRef, {
        name,
        lmpDate,
        cycleLength: Number(cycleLength),
        dueDate: dueDate.toISOString(),
        createdAt: new Date().toISOString(),
      });

      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Setup Your Pregnancy Profile</h3>

      <div className="card p-4 mt-3">
        <label className="form-label">Name</label>
        <input
          className="form-control mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name"
        />

        <label className="form-label">Last Menstrual Period (LMP)</label>
        <input
          type="date"
          className="form-control mb-3"
          value={lmpDate}
          onChange={(e) => setLmpDate(e.target.value)}
        />

        <label className="form-label">Cycle Length (Days)</label>
        <input
          type="number"
          className="form-control mb-3"
          value={cycleLength}
          onChange={(e) => setCycleLength(e.target.value)}
        />

        <button className="btn btn-primary w-100" onClick={saveProfile}>
          Save Profile
        </button>
      </div>
    </div>
  );
}