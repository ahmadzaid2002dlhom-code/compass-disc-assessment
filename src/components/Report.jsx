import { ArrowLeft, Info } from 'lucide-react';
import { NAMES } from '../lib/disc.js';
import { Btn } from './ui.jsx';
import Scores from './Scores.jsx';

export default function Report({ result, name, back }) {
  if (!result) return <p>No result found.</p>;
  const modern = !!result.profileStatus,
    code = modern ? result.profileCode || 'TIED' : result.profile || '—';
  const candidates = modern ? result.candidateProfiles || [] : [];
  const rank = modern ? result.scoreRanking : null;
  return (
    <>
      <div className="heading">
        <div>
          <div className="overline">PERSONAL DISC REPORT</div>
          <h1>{name ? name + '’s results' : 'Assessment results'}</h1>
          <p>Your profile is based on the words you ranked in all fourteen groups.</p>
        </div>
        {back && (
          <Btn variant="secondary" onClick={back}>
            <ArrowLeft size={15} /> Back to participants
          </Btn>
        )}
      </div>
      <section className="result-hero">
        <div className="profile-flex">
          <div className="profile-badge">{code}</div>
          <div>
            <div className="overline">
              {modern && result.profileStatus === 'TIED'
                ? 'TIED PROFILE · MORE THAN ONE POSSIBLE ORDER'
                : 'YOUR DISC PROFILE'}
            </div>
            <h2>
              {modern
                ? result.profileStatus === 'TIED'
                  ? 'Your leading styles are tied'
                  : `${code} personality profile`
                : `${code} personality profile`}
            </h2>
            {modern && result.profileStatus === 'SINGLE' && (
              <strong className="arabic" dir="rtl">
                {result.profile?.nameAr}
              </strong>
            )}
            {!modern && (
              <span className="arabic" dir="rtl">
                {result.nameArabic || ''}
              </span>
            )}
            {modern && result.profileStatus === 'TIED' && (
              <p>
                Equal raw scores make several ordered profiles possible. None has been chosen
                arbitrarily.
              </p>
            )}
          </div>
        </div>
        {modern && result.profileStatus === 'TIED' ? (
          <div className="profile-summary">
            <strong>Possible profiles</strong>
            <div className="candidate-grid">
              {candidates.map((p) => (
                <div className="candidate" key={p.code}>
                  <b>{p.code}</b>
                  <span dir="rtl">{p.descriptionAr}</span>
                </div>
              ))}
            </div>
          </div>
        ) : !modern ? (
          <div className="tags">
            {result.keywords?.map((k) => (
              <span key={k}>{k}</span>
            ))}
          </div>
        ) : null}
      </section>
      <div className="two-cols">
        <section className="panel">
          <div className="panel-head">
            <h3>DISC dimension scores</h3>
            <span>14–56 raw points</span>
          </div>
          <Scores scores={result.scores} />
        </section>
        <section className="panel">
          <div className="panel-head">
            <h3>Ranking from highest to lowest</h3>
            <span>Equal scores share rank</span>
          </div>
          {rank
            ? rank.map((group) => (
                <div className="rank" key={group.rank}>
                  <span className="rank-num">#{group.rank}</span>
                  <strong>{group.dimensions.join(' = ')}</strong>
                  <span>{group.dimensions.map((d) => NAMES[d]).join(' / ')}</span>
                  <b>{group.score}</b>
                </div>
              ))
            : result.ranking?.map((d, i) => (
                <div className="rank" key={d}>
                  <span className="rank-num">#{i + 1}</span>
                  <strong>{d}</strong>
                  <span>{NAMES[d]}</span>
                  <b>{result.scores[d]}</b>
                </div>
              ))}
        </section>
      </div>
      <p className="report-footnote">
        <Info size={17} /> This profile describes preferences, not ability or suitability for
        employment. It is not a clinical diagnosis.
      </p>
    </>
  );
}
