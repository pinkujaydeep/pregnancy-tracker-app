import { useNavigate } from "react-router-dom";
import TileCard from "../components/TileCard";

export default function Trackers() {
  const navigate = useNavigate();

  return (
    <div className="container page-wrap" style={{ maxWidth: "560px" }}>
      <h4>Trackers</h4>
      <p className="text-muted">All pregnancy tracking modules</p>

      <div className="row g-2">
        <div className="col-6">
          <TileCard
            title="Checklist ✅"
            subtitle="Daily routine"
            onClick={() => navigate("/checklist")}
          />
        </div>

        <div className="col-6">
          <TileCard
            title="Water 💧"
            subtitle="Daily water intake"
            onClick={() => navigate("/water")}
          />
        </div>

        <div className="col-6">
          <TileCard
            title="Medicines 💊"
            subtitle="Supplements schedule"
            onClick={() => navigate("/medicine")}
          />
        </div>

        <div className="col-6">
          <TileCard
            title="Symptoms 🤒"
            subtitle="Track symptoms"
            onClick={() => navigate("/symptoms")}
          />
        </div>

        <div className="col-6">
          <TileCard
            title="Weight ⚖️"
            subtitle="Weekly weight"
            onClick={() => navigate("/weight")}
          />
        </div>

        <div className="col-6">
          <TileCard
            title="Kick Counter 👶"
            subtitle="Kick sessions"
            onClick={() => navigate("/kicks")}
          />
        </div>

        <div className="col-12">
          <TileCard
            title="Contractions ⏱️"
            subtitle="Timer + history"
            onClick={() => navigate("/contractions")}
          />
        </div>

        <div className="col-12">
          <TileCard
            title="Appointments 📅"
            subtitle="Your checkup schedule"
            onClick={() => navigate("/appointments")}
          />
        </div>

        <div className="col-12">
          <TileCard
            title="Insights 📈"
            subtitle="Charts and personal PDF summary"
            onClick={() => navigate("/insights")}
          />
        </div>

        <div className="col-12">
          <TileCard
            title="My Journal 📝"
            subtitle="Mood and day notes"
            onClick={() => navigate("/journal")}
          />
        </div>

        <div className="col-12">
          <TileCard
            title="Birth Plan 🎒"
            subtitle="Personal readiness checklist"
            onClick={() => navigate("/birth-plan")}
          />
        </div>

        <div className="col-12">
          <TileCard
            title="Emergency 🚨"
            subtitle="Danger signs and quick contacts"
            onClick={() => navigate("/emergency")}
          />
        </div>
      </div>
    </div>
  );
}