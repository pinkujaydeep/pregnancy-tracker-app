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
  const [bloodGroup, setBloodGroup] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [hospitalName, setHospitalName] = useState("");

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
        bloodGroup,
        doctorName,
        hospitalName,
        dueDate: dueDate.toISOString(),
        createdAt: new Date().toISOString(),
      });

      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container page-wrap" style={{ maxWidth: "560px" }}>
      <h3>Setup Your Pregnancy Profile</h3>
      <p className="text-muted">Add your baseline details for personalized tracking.</p>

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

        <label className="form-label">Blood Group (Optional)</label>
        <input
          className="form-control mb-3"
          value={bloodGroup}
          onChange={(e) => setBloodGroup(e.target.value)}
          placeholder="A+, O-, etc"
        />

        <label className="form-label">Doctor Name (Optional)</label>
        <input
          className="form-control mb-3"
          value={doctorName}
          onChange={(e) => setDoctorName(e.target.value)}
          placeholder="Primary OB/GYN"
        />

        <label className="form-label">Hospital Name (Optional)</label>
        <input
          className="form-control mb-3"
          value={hospitalName}
          onChange={(e) => setHospitalName(e.target.value)}
          placeholder="Preferred hospital"
        />

        <button className="btn btn-primary w-100" onClick={saveProfile}>
          Save Profile
        </button>
      </div>
    </div>
  );
}