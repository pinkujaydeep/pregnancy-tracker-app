import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { weekData } from "../data/weeks";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { calculatePregnancyProgress } from "../utils/pregnancy";

export default function WeeklyGuide() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [selectedWeek, setSelectedWeek] = useState(1);

  useEffect(() => {
    const loadWeek = async () => {
      if (!auth.currentUser) return;

      const userRef = doc(db, "users", auth.currentUser.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const profile = snap.data();
        const progress = calculatePregnancyProgress(profile.lmpDate);

        if (progress.week >= 1 && progress.week <= 40) {
          setSelectedWeek(progress.week);
        }
      }
    };

    loadWeek();
  }, []);

  const current = weekData.find((w) => w.week === Number(selectedWeek));

  return (
    <div className="container mt-4" style={{ maxWidth: "520px" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0">{t("weeklyGuide")}</h4>

        <select
          className="form-select w-auto"
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
        >
          <option value="en">{t("english")}</option>
          <option value="hi">{t("hindi")}</option>
        </select>
      </div>

      <button className="btn btn-outline-secondary w-100 mb-3" onClick={() => navigate("/dashboard")}>
        ⬅ {t("back")}
      </button>

      <div className="card p-3 shadow-sm mb-3">
        <label className="form-label fw-bold">
          {t("week")} Selection
        </label>

        <select
          className="form-select"
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
        >
          {weekData.map((w) => (
            <option key={w.week} value={w.week}>
              Week {w.week}
            </option>
          ))}
        </select>
      </div>

      {current && (
        <div className="card p-4 shadow-sm">
          <h5 className="fw-bold mb-3">
            {t("week")} {current.week}
          </h5>

          <p className="mb-2">
            <b>Baby Size:</b>{" "}
            {i18n.language === "hi" ? current.fruit_hi : current.fruit_en}
          </p>

          <hr />

          <p>
            <b>Baby Development:</b>{" "}
            {i18n.language === "hi" ? current.baby_hi : current.baby_en}
          </p>

          <p>
            <b>Mother Changes:</b>{" "}
            {i18n.language === "hi" ? current.mom_hi : current.mom_en}
          </p>

          <p>
            <b>Tips:</b>{" "}
            {i18n.language === "hi" ? current.tips_hi : current.tips_en}
          </p>
        </div>
      )}
    </div>
  );
}