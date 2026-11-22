import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  BrowserRouter, Routes, Route, Link, Navigate,
} from 'react-router-dom';
import {
  NAV_MENTEE, NAV_MENTOR, ORGANIZER_TABS,
} from './data';
import { Avatar, Toast } from './ui';
import {
  MenteeHome, MenteeLive, MenteeMentors, MenteeMet, MenteeConnections,
  MenteeMessages,
} from './screens.mentee';
import {
  MentorHome, MentorLive, MentorRequests, MentorConnections,
  MentorMessages,
} from './screens.mentor';
import {
  OrganizerLive, OrganizerReg, OrganizerInteraction, OrganizerReports,
  ProfileScreen, TvScreen, OrganizerShell,
} from './screens.organizer';
import {
  SurveyScreen, NextStepScreen, DailySummaryScreen,
} from './screens.fecho';
import Landingpage from './Landingpage';
import MentorLanding from './MentorLanding';
import Register from './Register';
import Login from './Login';
import { ccMe, setStoredToken, getStoredToken, getStoredRefreshToken, ccGetQuestions, ccGetPolls, ccGetPollResults } from './api/client';

// ── NAV ──────────────────────────────────────
function BottomNav({ items, activeTab, setActiveTab }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-xl border-t border-line flex justify-center pb-[env(safe-area-inset-bottom,0px)] z-[25]">
      <div className="flex w-full max-w-[480px]">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => { setActiveTab(item.key); window.scrollTo(0, 0); }}
            className={`flex-1 flex flex-col items-center justify-center gap-[3px] py-[10px] pb-[9px] min-h-[56px] text-[.68rem] font-semibold transition ${activeTab === item.key ? 'text-primary-500' : 'text-ink-muted'}`}
          >
            <item.icon
              size={20}
              strokeWidth={2.5}
              stroke="currentColor"
              className={`transition ${activeTab === item.key ? 'opacity-100 -translate-y-px' : 'opacity-55'}`}
            />
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

// ── APP SHELL ────────────────────────────────
export function CareerConnectApp({ initialRole }) {
  const [role, setRole] = useState(initialRole || null);
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);

  // Event / simulation state
  const [currentRound, setCurrentRound] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isRehearsal, setIsRehearsal] = useState(false);
  const [furthestRoundCompleted, setFurthestRoundCompleted] = useState(0);

  // Announcements
  const [announcements, setAnnouncements] = useState([]);

  // Questions / polls (shared interaction)
  const [questions, setQuestions] = useState([]);
  const [pollOptions, setPollOptions] = useState([]);
  const [pollVotes, setPollVotes] = useState([0, 0, 0, 0]);
  const [votedOption, setVotedOption] = useState(-1);

  // UI
  const [toastMessage, setToastMessage] = useState('');
  const toastTimer = useRef(null);

  const showToast = (message) => {
    setToastMessage(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(''), 2600);
  };

  // Load questions and polls when role is mentee
  useEffect(() => {
    if (role !== 'mentee') return;
    let active = true;
    const loadInteraction = async () => {
      try {
        const [qResp, pResp, prResp] = await Promise.all([
          ccGetQuestions({}),
          ccGetPolls({}),
          ccGetPollResults({}),
        ]);
        if (active) {
          setQuestions(qResp.data?.questions || []);
          const pollData = pResp.data?.poll || pResp.data?.polls?.[0] || null;
          if (pollData) {
            setPollOptions(Array.isArray(pollData.options) ? pollData.options : []);
            setPollVotes(pollData.votes || [0, 0, 0, 0]);
          } else {
            setPollOptions([]);
          }
          const results = prResp.data?.results || prResp.data?.poll_results || [];
          // Merge results into pollVotes if available
          if (results.length > 0 && active) {
            const merged = results.map((r, i) => r.vote_count || r.count || 0);
            if (merged.length === 4) setPollVotes(merged);
          }
        }
      } catch (err) {
        console.error('Failed to load interaction data:', err);
      }
    };
    loadInteraction();
    return () => { active = false; };
  }, [role]);

  // Countdown
  useEffect(() => {
    if (!isRunning || isPaused) return;
    const interval = setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          return isRehearsal ? 30 : 300;
        }
        return previous - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, isPaused, isRehearsal]);

  const totalPollVotes = useMemo(() => pollVotes.reduce((sum, v) => sum + v, 0), [pollVotes]);

  const phaseLabel = () => {
    if (currentRound === 0) return 'Antes do intervalo';
    if (currentRound > 4) return 'Intervalo concluído';
    return `Intervalo 1 · ronda ${currentRound} de 4`;
  };

  const advanceRound = () => {
    setCurrentRound((previous) => {
      if (previous > 0 && previous <= 4) {
        setFurthestRoundCompleted((f) => Math.max(f, previous));
      }
      if (previous < 4) {
        setIsRunning(true);
        setIsPaused(false);
        setSecondsLeft(isRehearsal ? 30 : 300);
        return previous + 1;
      }
      setIsRunning(false);
      setFurthestRoundCompleted(4);
      return 5;
    });
  };

  const restartSimulation = () => {
    setCurrentRound(0);
    setFurthestRoundCompleted(0);
    setIsRunning(false);
    setIsPaused(false);
    setSecondsLeft(isRehearsal ? 30 : 300);
  };

  const common = { showToast };

  const renderMenteeContent = () => {
    const activeMenteeTab = NAV_MENTEE.find((t) => t.key === activeTab) ? activeTab : 'home';
    switch (activeMenteeTab) {
      case 'home':
        return <MenteeHome {...common} />;
      case 'live':
        return <MenteeLive {...common} currentRound={currentRound} secondsLeft={secondsLeft} isRehearsal={isRehearsal} announcements={announcements} phaseLabel={phaseLabel} setActiveTab={setActiveTab} questions={questions} setQuestions={setQuestions} pollOptions={pollOptions} pollVotes={pollVotes} setPollVotes={setPollVotes} votedOption={votedOption} setVotedOption={setVotedOption} totalPollVotes={totalPollVotes} />;
      case 'mentors':
        return <MenteeMentors {...common} />;
      case 'met':
        return <MenteeMet {...common} />;
      case 'conn':
        return <MenteeConnections {...common} />;
      case 'msg':
        return <MenteeMessages {...common} />;
      case 'fecho':
        return (
          <>
            <SurveyScreen {...common} />
            <NextStepScreen {...common} />
            <DailySummaryScreen {...common} conversations={furthestRoundCompleted || 0} connectionsCount={0} questionsAsked={0} />
          </>
        );
      case 'profile':
        return <ProfileScreen asRole="mentee" setRole={setRole} {...common} />;
      default:
        return null;
    }
  };

  const renderMentorContent = () => {
    const activeMentorTab = NAV_MENTOR.find((t) => t.key === activeTab) ? activeTab : 'home';
    switch (activeMentorTab) {
      case 'home':
        return <MentorHome {...common} />;
      case 'live':
        return <MentorLive {...common} currentRound={currentRound} secondsLeft={secondsLeft} phaseLabel={phaseLabel} />;
      case 'req':
        return <MentorRequests {...common} />;
      case 'conn':
        return <MentorConnections {...common} />;
      case 'msg':
        return <MentorMessages {...common} />;
      case 'profile':
        return <ProfileScreen asRole="mentor" setRole={setRole} {...common} />;
      default:
        return null;
    }
  };

  const renderOrganizerContent = () => {
    const activeOrgTab = ORGANIZER_TABS.find((t) => t.key === activeTab) ? activeTab : 'live';
    switch (activeOrgTab) {
      case 'live':
        return <OrganizerLive {...common} phaseLabel={phaseLabel} secondsLeft={secondsLeft} currentRound={currentRound} isPaused={isPaused} isRehearsal={isRehearsal} setIsRehearsal={setIsRehearsal} setSecondsLeft={setSecondsLeft} setIsPaused={setIsPaused} advanceRound={advanceRound} restartSimulation={restartSimulation} />;
      case 'reg':
        return <OrganizerReg {...common} />;
      case 'int':
        return <OrganizerInteraction {...common} announcements={announcements} setAnnouncements={setAnnouncements} questions={questions} pollVotes={pollVotes} totalPollVotes={totalPollVotes} />;
      case 'rep':
        return <OrganizerReports {...common} furthestRoundCompleted={furthestRoundCompleted} connections={[]} checkins={{}} mentorshipRequests={[]} />;
      default:
        return null;
    }
  };

  let content = null;

  if (!role) {
    content = (
      <div className="max-w-[720px] mx-auto pt-[52px] px-[22px] pb-10">
        <div className="font-extrabold text-[1.35rem] italic tracking-tight leading-none">
          Career<i className="text-primary-500 not-italic">Connect</i>
        </div>
        <h1 className="my-6 mb-3 max-w-[15ch] text-[clamp(1.9rem,6vw,2.8rem)] font-extrabold tracking-tight">
          Entra na tua área pessoal.
        </h1>
        <p className="text-ink-muted">
          Escolhe um perfil para entrar ou cria uma conta nova.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-[30px]">
          <button
            onClick={() => { setRole('mentee'); setActiveTab('home'); window.scrollTo(0, 0); }}
            className="text-left bg-surface-soft border-2 border-transparent hover:border-primary-500 rounded-3xl p-5 flex flex-col gap-0.5 text-ink transition active:scale-[.985]"
          >
            <Avatar name="Mentorado" />
            <h3 className="text-[1.02rem] mt-3 mb-0.5 font-bold">Mentorado</h3>
            <div className="text-ink-muted text-[.85rem]">A tua área pessoal</div>
          </button>
          <button
            onClick={() => { setRole('mentor'); setActiveTab('home'); window.scrollTo(0, 0); }}
            className="text-left bg-surface-soft border-2 border-transparent hover:border-primary-500 rounded-3xl p-5 flex flex-col gap-0.5 text-ink transition active:scale-[.985]"
          >
            <Avatar name="Mentor" />
            <h3 className="text-[1.02rem] mt-3 mb-0.5 font-bold">Mentor</h3>
            <div className="text-ink-muted text-[.85rem]">Mesa, mentorados, pedidos</div>
          </button>
          <button
            onClick={() => { setRole('org'); setActiveTab('live'); window.scrollTo(0, 0); }}
            className="text-left bg-surface-soft border-2 border-transparent hover:border-primary-500 rounded-3xl p-5 flex flex-col gap-0.5 text-ink transition active:scale-[.985]"
          >
            <Avatar name="Organizador" />
            <h3 className="text-[1.02rem] mt-3 mb-0.5 font-bold">Organizador</h3>
            <div className="text-ink-muted text-[.85rem]">Painel de controlo</div>
          </button>
          <button
            onClick={() => { setRole('tv'); setActiveTab('live'); window.scrollTo(0, 0); }}
            className="text-left bg-surface-soft border-2 border-transparent hover:border-primary-500 rounded-3xl p-5 flex flex-col gap-0.5 text-ink transition active:scale-[.985]"
          >
            <Avatar name="Ecrã" />
            <h3 className="text-[1.02rem] mt-3 mb-0.5 font-bold">Ecrã grande</h3>
            <div className="text-ink-muted text-[.85rem]">Projetor do evento</div>
          </button>
        </div>
      </div>
    );
  } else if (role === 'tv') {
    content = (
      <TvScreen
        announcements={announcements} phaseLabel={phaseLabel} currentRound={currentRound}
        secondsLeft={secondsLeft} furthestRoundCompleted={furthestRoundCompleted}
        connections={[]} setRole={setRole}
      />
    );
  } else if (role === 'org') {
    content = (
      <OrganizerShell activeTab={activeTab} setActiveTab={setActiveTab} announcements={announcements} setRole={setRole}>
        {renderOrganizerContent()}
      </OrganizerShell>
    );
  } else if (role === 'mentee') {
    content = (
      <>
        <div className="max-w-[480px] mx-auto pt-[18px] px-4 pb-[calc(112px+env(safe-area-inset-bottom,0px))]">
          {renderMenteeContent()}
        </div>
        <BottomNav items={NAV_MENTEE} activeTab={activeTab} setActiveTab={setActiveTab} />
      </>
    );
  } else if (role === 'mentor') {
    content = (
      <>
        <div className="max-w-[480px] mx-auto pt-[18px] px-4 pb-[calc(112px+env(safe-area-inset-bottom,0px))]">
          {renderMentorContent()}
        </div>
        <BottomNav items={NAV_MENTOR} activeTab={activeTab} setActiveTab={setActiveTab} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-ink font-sans antialiased pb-[env(safe-area-inset-bottom,0px)]">
      {role && (
        <div className="sticky top-0 z-30 flex gap-1.5 items-center overflow-x-auto bg-navy-900 text-white px-3.5 pt-[calc(env(safe-area-inset-top,0px)+8px)] pb-2 text-[.78rem]">
          <b className="mr-auto font-bold tracking-wide whitespace-nowrap opacity-85 text-[.74rem] uppercase">Career Connect</b>
          {[
            { key: 'mentee', label: 'Mentorado' },
            { key: 'mentor', label: 'Mentor' },
            { key: 'org', label: 'Organizador' },
            { key: 'tv', label: 'Ecrã' },
          ].map((account) => (
            <button
              key={account.key}
              onClick={() => { setRole(account.key); setActiveTab(account.key === 'org' ? 'live' : 'home'); window.scrollTo(0, 0); }}
              className={`rounded-full px-3.5 py-[7px] font-semibold text-[.78rem] min-h-[34px] whitespace-nowrap transition ${role === account.key ? 'bg-primary-500 text-white' : 'bg-white/10 text-white'}`}
            >
              {account.label}
            </button>
          ))}
        </div>
      )}
      {content}
      <Toast message={toastMessage} />
    </div>
  );
}

// ── ROUTER ───────────────────────────────────
export default function AppRouter() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authRole, setAuthRole] = useState(null);

  const checkAuth = async () => {
    const token = getStoredToken();
    if (!token) {
      setAuthChecked(true);
      setAuthRole(null);
      return;
    }
    setAuthChecked(false);
    try {
      const response = await ccMe();
      if (response.data?.user) {
        setAuthRole(response.data.user.role);
      }
    } catch (err) {
      setStoredToken(null);
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('userRole');
      setAuthRole(null);
    }
    setAuthChecked(true);
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  if (!authChecked) {
    return null;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={authRole === 'mentee' ? <Navigate to="/app/mentee" replace /> : authRole === 'mentor' ? <Navigate to="/app/mentor" replace /> : authRole === 'org' ? <Navigate to="/app/org" replace /> : authRole === 'tv' ? <Navigate to="/app/tv" replace /> : <Landingpage />} />
        <Route path="/mentor" element={<MentorLanding />} />
        <Route path="/registo" element={<Register />} />
        <Route path="/registo/mentor" element={<Register />} />
        <Route path="/entrar" element={authRole ? <Navigate to={authRole === 'organizer' ? '/app/org' : `/app/${authRole}`} replace /> : <Login />} />
        <Route path="/app/mentee" element={authRole === 'mentee' ? <CareerConnectApp initialRole="mentee" /> : (authChecked ? <Navigate to="/entrar" replace /> : null)} />
        <Route path="/app/mentor" element={authRole === 'mentor' ? <CareerConnectApp initialRole="mentor" /> : (authChecked ? <Navigate to="/entrar" replace /> : null)} />
        <Route path="/app/org" element={authRole === 'org' ? <CareerConnectApp initialRole="org" /> : (authChecked ? <Navigate to="/entrar" replace /> : null)} />
        <Route path="/app/tv" element={authRole === 'tv' ? <CareerConnectApp initialRole="tv" /> : (authChecked ? <Navigate to="/entrar" replace /> : null)} />
        <Route path="/app" element={<Navigate to="/entrar" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
