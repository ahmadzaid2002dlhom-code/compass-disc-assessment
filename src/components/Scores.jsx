import { COLORS, NAMES } from '../lib/disc.js';

export default function Scores({ scores }) {
  return (
    <div className="bars">
      {Object.keys(NAMES).map((d) => (
        <div className="scorebar" key={d}>
          <div className="bar-head">
            <span className="dimension" style={{ background: COLORS[d] }}>
              {d}
            </span>
            <span>{NAMES[d]}</span>
            <b>
              {scores?.[d] ?? '—'} <small>/ 56</small>
            </b>
          </div>
          <div className="track">
            <span
              style={{
                width: `${Math.min(100, (100 * (scores?.[d] || 0)) / 56)}%`,
                background: COLORS[d],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
