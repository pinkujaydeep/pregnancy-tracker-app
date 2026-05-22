export default function TileCard({ title, subtitle, color = "", onClick, minHeight = "120px" }) {
  return (
    <div
      className={`card p-3 shadow-sm ${color} h-100`}
      style={{ cursor: "pointer", minHeight, display: "flex", flexDirection: "column", justifyContent: "center" }}
      onClick={onClick}
    >
      <div className="fw-bold">{title}</div>
      <div className="small mt-2 text-muted">{subtitle}</div>
    </div>
  );
}
