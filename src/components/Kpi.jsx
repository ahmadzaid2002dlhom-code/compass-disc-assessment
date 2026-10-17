export default function Kpi({ label, value, icon }) {
  return (
    <div className="kpi">
      <div className="kpi-icon">{icon}</div>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}
