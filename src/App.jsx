import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MENTEES, MENTORS, MY_MENTEE_INDEX, MY_MENTOR_INDEX, INITIAL_QUESTIONS, ROUNDS,
  NAV_MENTEE, NAV_MENTOR, ORGANIZER_TABS, generateQrSvg,
} from './data';
import { Avatar, Toast } from './ui';
import {
  MenteeHome, MenteeLive, MenteeMentors, MenteeMet, MenteeConnections,
} from './screens.mentee';
import {
  MentorHome, MentorLive, MentorRequests, MentorConnections,
} from './screens.mentor';
import {
  OrganizerLive, OrganizerReg, OrganizerInteraction, OrganizerReports,
  ProfileScreen, TvScreen, OrganizerShell,
} from './screens.organizer';

// ── LOGIN ────────────────────────────────────
function LoginScreen({ setRole, setActiveTab }) {
  const accounts = [
    { key: 'mentee', name: 'Ana Mondlane',          label: 'Mentorado',   description: 'Passaporte, rondas, mentores, conexões' },
    { key: 'mentor', name: 'Carlos Tembe',           label: 'Mentor',      description: 'Mesa, mentorados, pedidos de mentoria' },
    { key: 'org',    name: 'Equipa Career Connect',  label: 'Organizador', description: 'Fases, check-in, aprovações, relatórios' },
    { key: 'tv',     name: 'Ecrã grande',            label: 'Projetor',    description: 'Contagem e quadro de mesas' },
  ];
  return (
    <div className="max-w-[720px] mx-auto pt-[52px] px-[22px] pb-10">
      <div className="font-extrabold text-[1.35rem] italic tracking-tight leading-none">
        Career<i className="text-primary-500 not-italic">Connect</i>
      </div>
      <h1 className="my-6 mb-3 max-w-[15ch] text-[clamp(1.9rem,6vw,2.8rem)] font-extrabold tracking-tight">
        Entra na tua área pessoal.
      </h1>
      <p className="text-ink-muted">
        Simulação sem servidor. Escolhe um perfil de demonstração e explora o que cada pessoa vê depois do login.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-[30px]">
        {accounts.map((account) => (
          <button
            key={account.key}
            onClick={() => { setRole(account.key); setActiveTab(account.key === 'org' ? 'live' : 'home'); window.scrollTo(0, 0); }}
            className="text-left bg-surface-soft border-2 border-transparent hover:border-primary-500 rounded-3xl p-5 flex flex-col gap-0.5 text-ink transition active:scale-[.985]"
          >
            <Avatar name={account.name} />
            <h3 className="text-[1.02rem] mt-3 mb-0.5 font-bold">{account.label}</h3>
            <div className="text-ink-muted text-[.85rem]">{account.name}</div>
            <p className="text-[.85rem] mt-2 text-ink-muted">{account.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

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
            <span className={`text-[1.2rem] leading-none transition ${activeTab === item.key ? 'opacity-100 -translate-y-px' : 'opacity-55'}`}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

// ── MAIN ─────────────────────────────────────
export default function CareerConnectApp() {
  // Session
  const [role, setRole] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  // Event / simulation
  const [currentRound, setCurrentRound] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isRehearsal, setIsRehearsal] = useState(false);
  const [furthestRoundCompleted, setFurthestRoundCompleted] = useState(0);

  // Mentee
  const [wishedMentors, setWishedMentors] = useState([1, 4]);
  const [interestByMentor, setInterestByMentor] = useState({});
  const [connections, setConnections] = useState([0]);
  const [mentorshipRequests, setMentorshipRequests] = useState([
    { mentorIndex: 2, menteeIndex: 1, status: 'pending', message: 'Olá Carlos, gostava de orientação sobre o meu primeiro estágio.' },
  ]);
  const [maxMenteesPerMentor] = useState(2);
  const [masterclassesReserved, setMasterclassesReserved] = useState(false);

  // Organizer
  const [announcements, setAnnouncements] = useState([]);
  const [checkins, setCheckins] = useState({ m0: 1, m1: 1, m2: 1, m3: 1, m4: 1, m5: 1, e0: 1, e1: 1, e2: 1, e3: 1, e5: 1 });
  const [hasPendingMentor, setHasPendingMentor] = useState(true);

  // Shared interaction
  const [questions, setQuestions] = useState(INITIAL_QUESTIONS);
  const [pollVotes, setPollVotes] = useState([4, 9, 3, 2]);
  const [votedOption, setVotedOption] = useState(-1);

  // UI
  const [toastMessage, setToastMessage] = useState('');
  const toastTimer = useRef(null);

  const showToast = (message) => {
    setToastMessage(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(''), 2600);
  };

  // Countdown
  useEffect(() => {
    if (!isRunning || isPaused) return;
    const interval = setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          advanceRound();
          return isRehearsal ? 30 : 300;
        }
        return previous - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, isPaused, isRehearsal]);

  // Derived
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

  const menteeForRound = (mentorIndex) => {
    if (currentRound < 1 || currentRound > 4) return null;
    const pair = ROUNDS[(currentRound - 1 + mentorIndex) % ROUNDS.length];
    return pair.fromMentee;
  };

  const mentorForMenteeRound = (menteeIndex) => {
    if (currentRound < 1 || currentRound > 4) return null;
    const pair = ROUNDS[(currentRound - 1 + menteeIndex) % ROUNDS.length];
    return pair.toMentor;
  };

  const metMentorIndices = useMemo(() => {
    const list = [];
    const upTo = Math.min(furthestRoundCompleted || 0, 4);
    for (let r = 1; r <= upTo; r++) {
      const index = mentorForMenteeRound(MY_MENTEE_INDEX);
      if (index !== null && !list.includes(index)) list.push(index);
    }
    if (currentRound >= 1 && currentRound <= 4) {
      const liveIndex = mentorForMenteeRound(MY_MENTEE_INDEX);
      if (liveIndex !== null && !list.includes(liveIndex)) list.push(liveIndex);
    }
    return list;
  }, [currentRound, furthestRoundCompleted]);

  const connectWithMentor = (mentorIndex) => {
    setConnections((previous) => {
      if (previous.includes(mentorIndex)) return previous;
      showToast(`Nova conexão com ${MENTORS[mentorIndex].name}!`);
      return [...previous, mentorIndex];
    });
  };

  // ── RENDER ROUTER ─────────────────────────
  const renderMenteeContent = () => {
    const activeMenteeTab = NAV_MENTEE.find((t) => t.key === activeTab) ? activeTab : 'home';
    const common = { showToast };
    switch (activeMenteeTab) {
      case 'home':
        return <MenteeHome {...common} wishedMentors={wishedMentors} setWishedMentors={setWishedMentors} connections={connections} mentorshipRequests={mentorshipRequests} furthestRoundCompleted={furthestRoundCompleted} masterclassesReserved={masterclassesReserved} setMasterclassesReserved={setMasterclassesReserved} />;
      case 'live':
        return <MenteeLive {...common} currentRound={currentRound} secondsLeft={secondsLeft} isRehearsal={isRehearsal} announcements={announcements} phaseLabel={phaseLabel} mentorForMenteeRound={mentorForMenteeRound} interestByMentor={interestByMentor} setInterestByMentor={setInterestByMentor} connectWithMentor={connectWithMentor} questions={questions} setQuestions={setQuestions} pollVotes={pollVotes} setPollVotes={setPollVotes} votedOption={votedOption} setVotedOption={setVotedOption} totalPollVotes={totalPollVotes} setActiveTab={setActiveTab} />;
      case 'mentors':
        return <MenteeMentors {...common} wishedMentors={wishedMentors} setWishedMentors={setWishedMentors} />;
      case 'met':
        return <MenteeMet metMentorIndices={metMentorIndices} interestByMentor={interestByMentor} setInterestByMentor={setInterestByMentor} connectWithMentor={connectWithMentor} />;
      case 'conn':
        return <MenteeConnections {...common} connections={connections} mentorshipRequests={mentorshipRequests} setMentorshipRequests={setMentorshipRequests} />;
      case 'profile':
        return <ProfileScreen asRole="mentee" setRole={setRole} showToast={showToast} />;
      default:
        return null;
    }
  };

  const renderMentorContent = () => {
    const activeMentorTab = NAV_MENTOR.find((t) => t.key === activeTab) ? activeTab : 'home';
    const common = { showToast };
    switch (activeMentorTab) {
      case 'home':
        return <MentorHome mentorshipRequests={mentorshipRequests} maxMenteesPerMentor={maxMenteesPerMentor} />;
      case 'live':
        return <MentorLive {...common} currentRound={currentRound} secondsLeft={secondsLeft} phaseLabel={phaseLabel} menteeForRound={menteeForRound} />;
      case 'req':
        return <MentorRequests {...common} mentorshipRequests={mentorshipRequests} setMentorshipRequests={setMentorshipRequests} maxMenteesPerMentor={maxMenteesPerMentor} />;
      case 'conn':
        return <MentorConnections mentorshipRequests={mentorshipRequests} />;
      case 'profile':
        return <ProfileScreen asRole="mentor" setRole={setRole} showToast={showToast} />;
      default:
        return null;
    }
  };

  const renderOrganizerContent = () => {
    const activeOrgTab = ORGANIZER_TABS.find((t) => t.key === activeTab) ? activeTab : 'live';
    const common = { showToast };
    switch (activeOrgTab) {
      case 'live':
        return <OrganizerLive {...common} phaseLabel={phaseLabel} secondsLeft={secondsLeft} currentRound={currentRound} isPaused={isPaused} isRehearsal={isRehearsal} setIsRehearsal={setIsRehearsal} setSecondsLeft={setSecondsLeft} setIsPaused={setIsPaused} advanceRound={advanceRound} restartSimulation={restartSimulation} menteeForRound={menteeForRound} />;
      case 'reg':
        return <OrganizerReg {...common} hasPendingMentor={hasPendingMentor} setHasPendingMentor={setHasPendingMentor} checkins={checkins} setCheckins={setCheckins} />;
      case 'int':
        return <OrganizerInteraction {...common} announcements={announcements} setAnnouncements={setAnnouncements} questions={questions} pollVotes={pollVotes} totalPollVotes={totalPollVotes} />;
      case 'rep':
        return <OrganizerReports {...common} furthestRoundCompleted={furthestRoundCompleted} connections={connections} checkins={checkins} mentorshipRequests={mentorshipRequests} />;
      default:
        return null;
    }
  };

  // ── TOP-LEVEL ─────────────────────────────
  let content = null;

  if (!role) {
    content = <LoginScreen setRole={setRole} setActiveTab={setActiveTab} />;
  } else if (role === 'tv') {
    content = (
      <TvScreen
        announcements={announcements} phaseLabel={phaseLabel} currentRound={currentRound}
        secondsLeft={secondsLeft} furthestRoundCompleted={furthestRoundCompleted}
        connections={connections} menteeForRound={menteeForRound} setRole={setRole}
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
          <b className="mr-auto font-bold tracking-wide whitespace-nowrap opacity-85 text-[.74rem] uppercase">Simulação</b>
          {[
            { key: 'mentee', label: 'Mentorado' },
            { key: 'mentor', label: 'Mentor' },
            { key: 'org',    label: 'Organizador' },
            { key: 'tv',     label: 'Ecrã' },
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