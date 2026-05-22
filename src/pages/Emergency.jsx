import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const defaultContact = { name: "", relation: "", phone: "" };

const urgentSigns = [
  "Heavy vaginal bleeding",
  "Severe abdominal pain",
  "Severe headache or blurred vision",
  "Reduced baby movement after 28 weeks",
  "Fluid leak or contractions every 5 minutes",
  "High fever or breathing difficulty",
];

export default function Emergency() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [contact, setContact] = useState(defaultContact);
  const [hospitalPhone, setHospitalPhone] = useState("");

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/");
      return;
    }

    const load = async () => {
      const refDoc = doc(db, "users", auth.currentUser.uid, "settings", "emergency");
      const snap = await getDoc(refDoc);

      if (snap.exists()) {
        const data = snap.data();
        setContact(data.contact || defaultContact);
        setHospitalPhone(data.hospitalPhone || "");
      }
    };

    load();
  }, [navigate]);

  const save = async () => {
    if (!auth.currentUser) return;
    setSaving(true);

    try {
      const refDoc = doc(db, "users", auth.currentUser.uid, "settings", "emergency");
      await setDoc(
        refDoc,
        {
          contact,
          hospitalPhone,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      alert("Emergency details saved.");
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const cleanPhone = (value) => value.replace(/[^+\d]/g, "");

  return (
    <div className="container page-wrap" style={{ maxWidth: "560px" }}>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="m-0">Emergency Support</h4>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate("/dashboard")}>
          Back
        </button>
      </div>

      <div className="alert alert-danger mb-3" role="alert">
        In case of severe symptoms, call local emergency services immediately.
      </div>

      <div className="card p-3 mb-3 shadow-sm">
        <h6 className="fw-bold mb-3">Emergency Contacts</h6>

        <label className="form-label">Caregiver Name</label>
        <input
          className="form-control mb-2"
          value={contact.name}
          onChange={(e) => setContact((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Primary caregiver"
        />

        <label className="form-label">Relation</label>
        <input
          className="form-control mb-2"
          value={contact.relation}
          onChange={(e) => setContact((prev) => ({ ...prev, relation: e.target.value }))}
          placeholder="Partner / Mother / Friend"
        />

        <label className="form-label">Caregiver Phone</label>
        <input
          className="form-control mb-3"
          value={contact.phone}
          onChange={(e) => setContact((prev) => ({ ...prev, phone: e.target.value }))}
          placeholder="+91..."
        />

        <label className="form-label">Hospital / OB Helpline</label>
        <input
          className="form-control mb-3"
          value={hospitalPhone}
          onChange={(e) => setHospitalPhone(e.target.value)}
          placeholder="Hospital emergency line"
        />

        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save Emergency Details"}
        </button>
      </div>

      <div className="card p-3 mb-3 shadow-sm">
        <h6 className="fw-bold mb-2">Quick Call</h6>
        <div className="d-grid gap-2">
          <a className="btn btn-danger" href={`tel:${cleanPhone(hospitalPhone)}`}>
            Call Hospital
          </a>
          <a className="btn btn-outline-danger" href={`tel:${cleanPhone(contact.phone)}`}>
            Call Caregiver
          </a>
        </div>
      </div>

      <div className="card p-3 shadow-sm mb-5">
        <h6 className="fw-bold mb-2">Seek Immediate Care If You Notice</h6>
        <ul className="mb-0 ps-3">
          {urgentSigns.map((item) => (
            <li key={item} className="mb-1 small">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
