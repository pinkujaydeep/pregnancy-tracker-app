import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const defaultChecklist = {
  idProofs: false,
  insuranceDocs: false,
  hospitalBags: false,
  babyClothes: false,
  momEssentials: false,
  caregiverPhoneReady: false,
  transportReady: false,
};

export default function BirthPlan() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [checklist, setChecklist] = useState(defaultChecklist);

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/");
      return;
    }

    const load = async () => {
      try {
        const refDoc = doc(db, "users", auth.currentUser.uid, "settings", "birthPlan");
        const snap = await getDoc(refDoc);

        if (snap.exists()) {
          const data = snap.data();
          setChecklist({ ...defaultChecklist, ...(data.checklist || {}) });
          setNotes(data.notes || "");
        }
      } catch (error) {
        alert(error.message);
      }
    };

    load();
  }, [navigate]);

  const savePlan = async (nextChecklist = checklist, nextNotes = notes) => {
    try {
      setSaving(true);
      const refDoc = doc(db, "users", auth.currentUser.uid, "settings", "birthPlan");
      await setDoc(
        refDoc,
        {
          checklist: nextChecklist,
          notes: nextNotes,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleItem = async (key, value) => {
    const updated = { ...checklist, [key]: value };
    setChecklist(updated);
    await savePlan(updated, notes);
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalCount = Object.keys(checklist).length;

  return (
    <div className="container page-wrap" style={{ maxWidth: "560px" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0">My Birth Plan</h4>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate("/dashboard")}>
          Back
        </button>
      </div>

      <div className="card p-3 shadow-sm mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <div className="fw-semibold">Readiness Progress</div>
          <span className="badge bg-success">{completedCount}/{totalCount}</span>
        </div>

        <div className="mt-3">
          {[
            ["idProofs", "ID proof and documents ready"],
            ["insuranceDocs", "Insurance/medical papers ready"],
            ["hospitalBags", "Hospital bag packed"],
            ["babyClothes", "Baby clothes and blanket ready"],
            ["momEssentials", "Mom essentials packed"],
            ["caregiverPhoneReady", "Caregiver and emergency contacts saved"],
            ["transportReady", "Transport plan confirmed"],
          ].map(([key, label]) => (
            <div className="form-check mb-2" key={key}>
              <input
                className="form-check-input"
                type="checkbox"
                checked={checklist[key]}
                onChange={(e) => toggleItem(key, e.target.checked)}
              />
              <label className="form-check-label">{label}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-3 shadow-sm mb-4">
        <label className="form-label fw-bold">Personal Notes</label>
        <textarea
          className="form-control mb-3"
          rows="3"
          placeholder="Preferences, birth plan wishes, key reminders..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button className="btn btn-primary" onClick={() => savePlan(checklist, notes)} disabled={saving}>
          {saving ? "Saving..." : "Save Notes"}
        </button>
      </div>
    </div>
  );
}
