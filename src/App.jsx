import { useEffect, useState, useRef } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  LockKeyhole,
  UserCircle2,
} from 'lucide-react';
import { request } from './lib/api.js';
import { Btn, ErrorMessage } from './components/ui.jsx';
import Brand from './components/Brand.jsx';
import Report from './components/Report.jsx';
import Home from './pages/Home.jsx';
import StaffLogin from './pages/StaffLogin.jsx';
import Assessment from './pages/Assessment.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TieDemo from './pages/TieDemo.jsx';

function invitationFromUrl() {
  const hash = new URLSearchParams(location.hash.replace(/^#/, ''));
  const query = new URLSearchParams(location.search);
  return hash.get('invite') || query.get('invite');
}

export default function App() {
  const demoMode = new URLSearchParams(location.search).get('demo') === 'tie';
  const [me, setMe] = useState(null),
    [loading, setLoading] = useState(true),
    [mode, setMode] = useState('home'),
    [error, setError] = useState(''),
    [report, setReport] = useState(null),
    [refresh, setRefresh] = useState(0),
    [menu, setMenu] = useState(false);
  const inviteRef = useRef(invitationFromUrl());
  useEffect(() => {
    let active = true;
    async function start() {
      setLoading(true);
      try {
        if (inviteRef.current) {
          const token = inviteRef.current;
          history.replaceState(null, '', location.pathname);
          await request('redeem-invite', { token });
          inviteRef.current = null;
        }
        const r = await request('me', null, 'GET');
        if (!active) return;
        setMe(r.authenticated ? r : null);
        setMode(r.authenticated ? (r.type === 'participant' ? 'participant' : r.role) : 'home');
        setError('');
      } catch (e) {
        if (!active) return;
        setMe(null);
        setError(e.message);
        setMode(inviteRef.current ? 'invite-error' : 'home');
      } finally {
        if (active) setLoading(false);
      }
    }
    start();
    return () => {
      active = false;
    };
  }, [refresh]);
  function success() {
    setRefresh((n) => n + 1);
  }
  async function logout() {
    try {
      await request('logout');
    } catch {}
    inviteRef.current = null;
    setMe(null);
    setReport(null);
    setMode('home');
    history.replaceState(null, '', location.pathname);
  }
  function go(next) {
    setMode(next);
    setMenu(false);
    setReport(null);
    window.scrollTo(0, 0);
  }
  const authenticated = me?.authenticated;
  const isStaff = me?.type === 'staff';
  const isParticipant = me?.type === 'participant';
  return (
    <div className="layout">
      <aside className={'sidebar ' + (menu ? 'shown' : '')}>
        <button
          className="brand"
          onClick={() => (authenticated ? go(isStaff ? me.role : 'participant') : go('home'))}
        >
          <Brand />
        </button>
        <div className="nav-caption">DISC WORKSPACE</div>
        {!authenticated ? (
          <>
            <button
              className={'nav ' + (mode === 'home' ? 'active' : '')}
              onClick={() => go('home')}
            >
              <LayoutDashboard size={19} /> Overview
            </button>
            <div className="nav-caption spaced">STAFF</div>
            <button
              className={'nav ' + (mode === 'staff' ? 'active' : '')}
              onClick={() => go('staff')}
            >
              <ShieldCheck size={19} /> Team sign in
            </button>
          </>
        ) : isParticipant ? (
          <>
            <button className="nav active" onClick={() => go('participant')}>
              <ClipboardList size={19} />{' '}
              {me.participant?.result ? 'My DISC report' : 'My assessment'}
            </button>
            <div className="nav-user">
              <UserCircle2 size={17} /> {me.participant?.name}
            </div>
          </>
        ) : (
          <>
            <button className="nav active" onClick={() => go(me.role)}>
              <Users size={19} /> {me.role === 'manager' ? 'HR dashboard' : 'Facilitator dashboard'}
            </button>
          </>
        )}
        <div className="aside-bottom">
          <div className="aside-card">
            <div>✦</div>
            <b>Grow with insight.</b>
            <p>Understand individual strengths and better ways to collaborate.</p>
          </div>
          {authenticated ? (
            <button className="nav" onClick={logout}>
              <LogOut size={17} /> {isParticipant ? 'Leave assessment' : 'Sign out'}
            </button>
          ) : (
            <small>
              DISC Prototype <span>v3.0</span>
            </small>
          )}
        </div>
      </aside>
      <div className="workspace">
        <header className="top">
          <button className="menu" aria-label="Open menu" onClick={() => setMenu(!menu)}>
            {menu ? <X /> : <Menu />}
          </button>
          <span>
            Workspace <i>/</i>{' '}
            {demoMode
              ? 'All-tie demo'
              : loading
                ? 'Loading'
                : !authenticated
                  ? mode === 'home'
                    ? 'Overview'
                    : mode === 'staff'
                      ? 'Staff login'
                      : 'Invitation'
                  : isParticipant
                    ? me.participant?.result
                      ? 'My report'
                      : 'Assessment'
                    : report
                      ? 'Individual report'
                      : me.role === 'manager'
                        ? 'Manager / HR'
                        : 'Facilitator'}
          </span>
          <span className="secure">
            <LockKeyhole size={16} /> Private access
          </span>
        </header>
        <main>
          {demoMode ? (
            <TieDemo />
          ) : loading ? (
            <div className="center">Opening your assessment…</div>
          ) : !authenticated ? (
            mode === 'invite-error' ? (
              <div className="login-content">
                <h2>Unable to open invitation</h2>
                <ErrorMessage error={error} />
                <p>Ask your facilitator for a new invitation link if this link has expired.</p>
                <Btn onClick={() => setRefresh((n) => n + 1)}>Try again</Btn>
              </div>
            ) : mode === 'staff' ? (
              <StaffLogin setMode={go} onSuccess={success} />
            ) : (
              <Home onStaff={() => go('staff')} />
            )
          ) : isParticipant ? (
            me.participant?.result ? (
              <Report result={me.participant.result} name={me.participant.name} />
            ) : (
              <Assessment user={me.participant} onDone={success} />
            )
          ) : report ? (
            <Report result={report.result} name={report.name} back={() => setReport(null)} />
          ) : (
            <Dashboard role={me.role} onReport={setReport} />
          )}
        </main>
        <footer>
          © 2026 Compass DISC Prototype{' '}
          <span>Scoring and profile descriptions sourced from the supplied workbook</span>
        </footer>
      </div>
    </div>
  );
}
