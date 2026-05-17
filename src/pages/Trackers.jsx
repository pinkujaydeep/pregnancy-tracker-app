import { useNavigate } from "react-router-dom";

export default function Trackers() {
  const navigate = useNavigate();

  const Tile = ({ title, subtitle, onClick }) => (
    <div
      className="card p-3 shadow-sm"
      style={{ cursor: "pointer" }}
      onClick={onClick}
    >
      <div className="fw-bold">{title}</div>
      <div className="text-muted small">{subtitle}</div>
    </div>
  );

  return (
    <div className="container mt-3" style={{ maxWidth: "520px" }}>
      <h4>Trackers</h4>
      <p className="text-muted">All pregnancy tracking modules</p>

      <div className="row g-2">
        <div className="col-6">
          <Tile
            title="Checklist ✅"
            subtitle="Daily routine"
            onClick={() => navigate("/checklist")}
          />
        </div>

        <div className="col-6">
          <Tile
            title="Water 💧"
            subtitle="Daily water intake"
            onClick={() => navigate("/water")}
          />
        </div>

        <div className="col-6">
          <Tile
            title="Medicines 💊"
            subtitle="Supplements schedule"
            onClick={() => navigate("/medicine")}
          />
        </div>

        <div className="col-6">
          <Tile
            title="Symptoms 🤒"
            subtitle="Track symptoms"
            onClick={() => navigate("/symptoms")}
          />
        </div>

        <div className="col-6">
          <Tile
            title="Weight ⚖️"
            subtitle="Weekly weight"
            onClick={() => navigate("/weight")}
          />
        </div>

        <div className="col-6">
          <Tile
            title="Kick Counter 👶"
            subtitle="Kick sessions"
            onClick={() => navigate("/kicks")}
          />
        </div>

        <div className="col-12">
          <Tile
            title="Contractions ⏱️"
            subtitle="Timer + history"
            onClick={() => navigate("/contractions")}
          />
        </div>

        <div className="col-12">
          <Tile
            title="Appointments 📅"
            subtitle="Doctor visits"
            onClick={() => navigate("/appointments")}
          />
        </div>
      </div>
    </div>
  );
}