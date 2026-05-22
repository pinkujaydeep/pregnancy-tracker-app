export default function TileCard({ title, subtitle, color = "", onClick, minHeight = "96px" }) {
  return (
    <div
      className={`card p-2 shadow-sm ${color} h-100`}
      style={{ cursor: "pointer", minHeight, display: "flex", flexDirection: "column", justifyContent: "center" }}
      onClick={onClick}
    >
      <div className="fw-semibold fs-6">{title}</div>
      <div className="small mt-1 text-muted">{subtitle}</div>
    </div>
  );
}
