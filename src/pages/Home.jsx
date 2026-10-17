import { ClipboardList, BarChart3, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { COLORS, NAMES } from '../lib/disc.js';

export default function Hero({ onStaff }) {
  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <span className="hero-pill">✦ Discover your personality style</span>
          <h1>
            Understand how
            <br />
            <em>you work best.</em>
          </h1>
          <p>
            Explore your DISC personality through a personal invitation and 14 guided groups of
            words.
          </p>
          <div className="hero-actions">
            <span className="notice">
              <ShieldCheck size={17} /> Have an invitation? Open the personal link shared by your
              facilitator to begin — no account or password needed.
            </span>
          </div>
          <div className="hero-notes">
            <span>
              <CheckCircle2 size={15} /> 14 groups of words
            </span>
            <span>
              <ShieldCheck size={15} /> Private personal report
            </span>
          </div>
        </div>
        <div className="hero-graphic">
          <div className="floating-card">
            <small>YOUR DISC PROFILE ✦</small>
            <div className="tiles">
              {Object.keys(COLORS).map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="graph">
              {Object.keys(COLORS).map((d, i) => (
                <div key={d}>
                  <span style={{ height: [85, 54, 73, 43][i] + '%', background: COLORS[d] }} />
                  <b>{d}</b>
                </div>
              ))}
            </div>
            <p>
              Four dimensions.
              <br />A clearer picture of you.
            </p>
          </div>
        </div>
      </section>
      <section className="home-section">
        <div className="overline">HOW IT WORKS</div>
        <h2>Three simple steps</h2>
        <div className="feature-grid">
          <article>
            <span className="feature-icon">
              <ShieldCheck />
            </span>
            <h3>Open your invitation</h3>
            <p>
              Your facilitator sends a personal assessment link. No registration or password
              required.
            </p>
          </article>
          <article>
            <span className="feature-icon green">
              <ClipboardList />
            </span>
            <h3>Rank 14 groups</h3>
            <p>Move each group's four words from most like you to least like you.</p>
          </article>
          <article>
            <span className="feature-icon orange">
              <BarChart3 />
            </span>
            <h3>Discover your profile</h3>
            <p>See your DISC scores, ranking and source-based personality description.</p>
          </article>
        </div>
        <p className="staff-entry">
          Running a session?{' '}
          <button onClick={onStaff}>
            Facilitator or Manager sign in <ArrowRight size={14} />
          </button>
        </p>
      </section>
    </>
  );
}
