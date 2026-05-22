export default function TileCard({ title, subtitle, color = "", onClick, minHeight = "110px" }) {
  return (
    <div
      className={`card p-3 shadow-sm ${color}`}
      style={{ cursor: "pointer", minHeight }}
      onClick={onClick}
    >
      <div className="fw-bold">{title}</div>
      <div className="small mt-2 text-muted">{subtitle}</div>
    </div>
  );
}
