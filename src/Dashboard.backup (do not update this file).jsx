import React, { useState, useEffect, useRef, useMemo } from 'react';

// ─────────────────────────────────────────────
// DATA & CONSTANTS
// ─────────────────────────────────────────────
const EVENT_DATE = new Date('2026-12-04T14:00:00+02:00');

const MENTEES = [
  { name: 'Ana Mondlane',    course: 'Gestão · UEM',              goal: 'Escolher a minha área',        pitch: 'Quero descobrir que área seguir depois do curso.' },
  { name: 'Bruno Chissano',  course: 'Engenharia Informática · ISCTEM', goal: 'Preparar o primeiro estágio', pitch: 'Procuro orientação para o meu primeiro estágio.' },
  { name: 'Cláudia Nhantumbo', course: 'Direito · UEM',           goal: 'Construir a minha marca pessoal', pitch: 'Quero comunicar melhor o que sei fazer.' },
  { name: 'Dino Matola',     course: 'Economia · ISUTC',          goal: 'Desenvolver competências',     pitch: 'Quero reforçar a análise de dados.' },
  { name: 'Elsa Macie',      course: 'Agronomia · UEM',           goal: 'Criar o meu negócio',          pitch: 'Tenho uma ideia de negócio agrícola.' },
  { name: 'Fátima Sitoe',    course: 'Marketing · ISCIM',         goal: 'Mudar de percurso',            pitch: 'Quero passar de vendas para marketing.' },
];

const MENTORS = [
  { name: 'Sara Cumbe',    role: 'Directora de Finanças',  company: 'Standard Bank',     area: 'Finanças e Banca' },
  { name: 'Nuno Bila',     role: 'Engenheiro de Software', company: 'Vodacom',           area: 'Tecnologia e TI' },
  { name: 'Carlos Tembe',  role: 'Gestor de Marketing',    company: 'Grupo Madal',       area: 'Marketing e Comunicação' },
  { name: 'Ilda Mussa',    role: 'Advogada',               company: 'Mussa & Associados', area: 'Direito' },
  { name: 'Rui Machava',   role: 'Director de RH',         company: 'Vale Moçambique',   area: 'Recursos Humanos' },
  { name: 'Lídia Zimba',   role: 'Fundadora',              company: 'Zimba Agro',        area: 'Agricultura' },
];

const MASTERCLASSES = [
  'Estratégias para encontrar o primeiro passo',
  'A arte de criar redes de contactos',
  'Fui contratado. E agora?',
];

const POLL_OPTIONS = ['Falta de experiência', 'Contactos', 'Competências', 'Orientação'];

const MUTUAL_MATCHES = [1, 2, 4];
const MY_MENTEE_INDEX = 0;
const MY_MENTOR_INDEX = 2;

const INITIAL_QUESTIONS = [
  { text: 'Como se preparam as entrevistas sem experiência?', votes: 12, mine: false },
  { text: 'Vale a pena o LinkedIn para quem está a começar?', votes: 7,  mine: false },
];

const ROUNDS = [
  { fromMentee: 0, toMentor: 2 },
  { fromMentee: 1, toMentor: 0 },
  { fromMentee: 2, toMentor: 5 },
  { fromMentee: 3, toMentor: 3 },
];

const NAV_MENTEE = [
  { key: 'home',    label: 'Passaporte', icon: '◉' },
  { key: 'live',    label: 'Ao vivo',    icon: '◈' },
  { key: 'mentors', label: 'Mentores',   icon: '✦' },
  { key: 'met',     label: 'Conheci',    icon: '◍' },
  { key: 'conn',    label: 'Conexões',   icon: '◇' },
  { key: 'profile', label: 'Perfil',     icon: '○' },
];

const NAV_MENTOR = [
  { key: 'home',    label: 'Hoje',      icon: '◉' },
  { key: 'live',    label: 'Mesa',      icon: '◈' },
  { key: 'req',     label: 'Pedidos',   icon: '✦' },
  { key: 'conn',    label: 'Conexões',  icon: '◇' },
  { key: 'profile', label: 'Perfil',    icon: '○' },
];

const ORGANIZER_TABS = [
  { key: 'live', label: 'Ao vivo' },
  { key: 'reg',  label: 'Inscritos' },
  { key: 'int',  label: 'Interação' },
  { key: 'rep',  label: 'Relatórios' },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const getInitials = (name) =>
  name.split(' ').map((word) => word[0]).slice(0, 2).join('');

const getFirstName = (name) => name.split(' ')[0];

const compatibilityScore = (menteeIndex, mentorIndex) =>
  55 + ((menteeIndex * 7 + mentorIndex * 13) % 41);

const hashString = (inputString) => {
  let hashValue = 2166136261;
  for (const character of inputString) {
    hashValue ^= character.charCodeAt(0);
    hashValue = Math.imul(hashValue, 16777619);
  }
  return hashValue >>> 0;
};

const formatTime = (totalSeconds) =>
  `${String(Math.floor(totalSeconds / 60)).padStart(1, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`;

const generateQrSvg = (seed) => {
  let hashValue = hashString(seed);
  let cells = '';
  for (let y = 0; y < 11; y++) {
    for (let x = 0; x < 11; x++) {
      const isFinderPattern = (x < 3 && y < 3) || (x > 7 && y < 3) || (x < 3 && y > 7);
      hashValue = Math.imul(hashValue ^ (hashValue >>> 13), 1274126177) >>> 0;
      if (isFinderPattern || hashValue % 2) {
        cells += `<rect x="${x * 10}" y="${y * 10}" width="10" height="10"/>`;
      }
    }
  }
  return `<svg viewBox="0 0 110 110" fill="#1b2a57" class="w-[120px] h-[120px] bg-white rounded-[14px] p-1.5 shrink-0">${cells}</svg>`;
};

// ─────────────────────────────────────────────
// SMALL PRESENTATIONAL COMPONENTS
// ─────────────────────────────────────────────
const Avatar = ({ name, size = 'md', variant = 'navy' }) => {
  const sizeClass = size === 'lg' ? 'w-16 h-16 text-xl' : 'w-[46px] h-[46px] text-sm';
  const variantClass = variant === 'orange' ? 'bg-primary-500' : 'bg-navy-800';
  return (
    <div className={`${sizeClass} ${variantClass} text-white rounded-full grid place-items-center font-extrabold shrink-0 tracking-wide`}>
      {getInitials(name)}
    </div>
  );
};

const PersonRow = ({ name, subtitle, extra = null }) => (
  <div className="flex gap-3 items-center">
    <Avatar name={name} />
    <div className="flex-1 min-w-0">
      <b>{name}</b>
      <div className="text-ink-muted text-[.85rem] mt-px">{subtitle}</div>
    </div>
    {extra}
  </div>
);

const ProgressBar = ({ value }) => (
  <div className="h-2 rounded-full bg-line overflow-hidden">
    <i className="block h-full bg-primary-500 rounded-full transition-[width] duration-400" style={{ width: `${value}%` }} />
  </div>
);

const ChecklistItem = ({ label, done }) => (
  <div className="flex gap-2.5 items-center py-2 text-[.9rem] font-medium">
    <span className={`w-[22px] h-[22px] rounded-full border-2 grid place-items-center text-[.7rem] text-white shrink-0 transition ${
      done ? 'bg-success border-success' : 'border-line'
    }`}>
      {done ? '✓' : ''}
    </span>
    {label}
  </div>
);

const Card = ({ children, variant = 'soft', className = '' }) => {
  const variantClass =
    variant === 'navy' ? 'bg-navy-800 text-white shadow-card'
    : variant === 'orange' ? 'bg-primary-50 border border-primary-500/25'
    : 'bg-surface-soft shadow-sm';
  return <div className={`rounded-card p-5 mb-3 ${variantClass} ${className}`}>{children}</div>;
};

const Toast = ({ message }) => (
  <div className={`fixed left-1/2 bottom-[calc(88px+env(safe-area-inset-bottom,0px))] -translate-x-1/2 bg-ink text-surface px-[22px] py-[13px] rounded-full font-semibold text-[.88rem] max-w-[90vw] text-center z-[60] shadow-lg transition-all duration-200 ${
    message ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-3 pointer-events-none'
  }`} role="status">
    {message}
  </div>
);

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function CareerConnectApp() {
  // ── Session / identity
  const [role, setRole] = useState(null); // null | 'mentee' | 'mentor' | 'org' | 'tv'
  const [activeTab, setActiveTab] = useState('home');

  // ── Event / simulation
  const [currentRound, setCurrentRound] = useState(0); // 0 = before first round, 1..4 = rounds, 5 = after
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isRehearsal, setIsRehearsal] = useState(false);
  const [furthestRoundCompleted, setFurthestRoundCompleted] = useState(0);

  // ── Mentee state
  const [wishedMentors, setWishedMentors] = useState([1, 4]);
  const [interestByMentor, setInterestByMentor] = useState({});
  const [connections, setConnections] = useState([0]);
  const [mentorshipRequests, setMentorshipRequests] = useState([
    { mentorIndex: 2, menteeIndex: 1, status: 'pending', message: 'Olá Carlos, gostava de orientação sobre o meu primeiro estágio.' },
  ]);
  const [maxMenteesPerMentor] = useState(2);
  const [masterclassesReserved, setMasterclassesReserved] = useState(false);

  // ── Org state
  const [announcements, setAnnouncements] = useState([]);
  const [checkins, setCheckins] = useState({ m0: 1, m1: 1, m2: 1, m3: 1, m4: 1, m5: 1, e0: 1, e1: 1, e2: 1, e3: 1, e5: 1 });
  const [hasPendingMentor, setHasPendingMentor] = useState(true);

  // ── Shared interactive state
  const [questions, setQuestions] = useState(INITIAL_QUESTIONS);
  const [pollVotes, setPollVotes] = useState([4, 9, 3, 2]);
  const [votedOption, setVotedOption] = useState(-1);

  // ── UI
  const [toastMessage, setToastMessage] = useState('');
  const toastTimer = useRef(null);

  const showToast = (message) => {
    setToastMessage(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(''), 2600);
  };

  // ── Countdown ticker
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

  // ── Event phase helpers
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

  // ── Derived helpers
  const totalPollVotes = useMemo(() => pollVotes.reduce((sum, v) => sum + v, 0), [pollVotes]);

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

  // ─────────────────────────────────────────────
  // ROLE SCREENS
  // ─────────────────────────────────────────────

  // ── LOGIN ────────────────────────────────────
  const renderLogin = () => {
    const accounts = [
      { key: 'mentee', name: 'Ana Mondlane',         label: 'Mentorado',   description: 'Passaporte, rondas, mentores, conexões' },
      { key: 'mentor', name: 'Carlos Tembe',          label: 'Mentor',      description: 'Mesa, mentorados, pedidos de mentoria' },
      { key: 'org',    name: 'Equipa Career Connect', label: 'Organizador', description: 'Fases, check-in, aprovações, relatórios' },
      { key: 'tv',     name: 'Ecrã grande',           label: 'Projetor',    description: 'Contagem e quadro de mesas' },
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
  };

  // ── MENTEE SCREENS ───────────────────────────
  const renderMenteeHome = () => {
    const myMentee = MENTEES[MY_MENTEE_INDEX];
    const conversationsDone = furthestRoundCompleted || 0;
    const prepChecklist = [
      { label: 'Perfil completo', done: true },
      { label: 'Pitch escrito', done: true },
      { label: '3 mentores marcados', done: wishedMentors.length >= 3 },
      { label: 'Masterclasses reservadas', done: masterclassesReserved },
    ];
    const badges = [
      { label: 'Primeira ligação',  earned: conversationsDone >= 1 },
      { label: 'Meio caminho',      earned: conversationsDone >= 4 },
      { label: 'Passaporte completo', earned: conversationsDone >= 8 },
      { label: 'Primeira conexão',  earned: connections.length > 0 },
      { label: 'Mentoria ativa',    earned: mentorshipRequests.some((r) => r.menteeIndex === MY_MENTEE_INDEX && r.status === 'accepted') },
    ];

    return (
      <>
        <h2 className="text-[1.45rem] font-extrabold tracking-tight">Olá, {getFirstName(myMentee.name)}.</h2>
        <p className="text-ink-muted text-[.85rem] mt-1 mb-4">4 Dez 2026 · 14H00 · Hotel Cardoso</p>

        <Card variant="navy">
          <div className="flex gap-3 items-center">
            <div className="flex-1 min-w-0">
              <div className="text-[.76rem] font-bold text-primary-300 uppercase tracking-wide">Bilhete</div>
              <h3 className="mt-1 text-[1.08rem] font-extrabold">{myMentee.name}</h3>
              <p className="text-[.85rem] text-navy-100">Mentorado · {myMentee.course}</p>
              <p className="font-extrabold text-[1.05rem] mt-3 tracking-widest">CC-7K2QF</p>
              <p className="text-[.76rem] text-navy-100 mt-0.5">Disponível sem rede</p>
            </div>
            <div dangerouslySetInnerHTML={{ __html: generateQrSvg('CC-7K2QF') }} />
          </div>
        </Card>

        <Card variant="navy">
          <div className="flex gap-3 items-center">
            <div
              className="shrink-0"
              dangerouslySetInnerHTML={{ __html: `
                <svg width="104" height="104" viewBox="0 0 110 110" role="img" aria-label="${conversationsDone} de 8 conversas">
                  <circle cx="55" cy="55" r="42" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="10"/>
                  <circle cx="55" cy="55" r="42" fill="none" stroke="#f26b0f" stroke-width="10" stroke-linecap="round"
                    stroke-dasharray="${2 * Math.PI * 42}" stroke-dashoffset="${2 * Math.PI * 42 * (1 - conversationsDone / 8)}"
                    transform="rotate(-90 55 55)"/>
                  <text x="55" y="61" text-anchor="middle" fill="#fff" font-family="Montserrat" font-weight="800" font-size="26">${conversationsDone}</text>
                </svg>` }}
            />
            <div>
              <b>Passaporte</b>
              <p className="text-[.85rem] text-navy-100">{conversationsDone} de 8 conversas · {connections.length} conexões</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3.5"><b>Prepara-te</b></div>
          {prepChecklist.map((item) => (
            <ChecklistItem key={item.label} label={item.label} done={item.done} />
          ))}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3.5"><b>Conquistas</b></div>
          <div className="flex gap-1.5 flex-wrap mt-2.5">
            {badges.map((badge) => (
              <span
                key={badge.label}
                className={`rounded-full px-3 py-[5px] text-[.74rem] font-semibold ${
                  badge.earned ? 'bg-primary-500 text-white' : 'bg-surface text-ink-muted border border-line opacity-50'
                }`}
              >
                {badge.label}
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3.5"><b>Reservar masterclasses</b></div>
          <p className="text-ink-muted text-[.85rem] mb-2.5">Sem custo.</p>
          {MASTERCLASSES.map((title, index) => (
            <div key={index} className="flex justify-between items-center mt-2.5 gap-2.5">
              <span className="text-[.85rem] flex-1">{title}</span>
              <button
                onClick={() => {
                  setMasterclassesReserved((previous) => !previous);
                  showToast(!masterclassesReserved ? 'Lugares reservados.' : 'Reservas canceladas.');
                }}
                className={`rounded-full font-bold text-[.76rem] h-[34px] px-3.5 ${
                  masterclassesReserved ? 'bg-surface2 text-ink' : 'bg-primary-500 text-white'
                }`}
              >
                {masterclassesReserved ? 'Reservado' : 'Reservar'}
              </button>
            </div>
          ))}
        </Card>
      </>
    );
  };

  const renderMenteeLive = () => {
    let body = null;

    if (currentRound === 0) {
      body = (
        <Card variant="navy">
          <div className="text-[.76rem] font-bold text-primary-300 uppercase tracking-wide">A seguir</div>
          <h3 className="mt-1 text-[1.08rem] font-extrabold">Intervalo de ligações</h3>
          <p className="text-[.85rem] text-navy-100 mt-1.5">Quando o organizador iniciar, vês aqui com quem falas e em que mesa.</p>
        </Card>
      );
    } else if (currentRound > 4) {
      body = (
        <Card variant="navy">
          <h3 className="text-[1.08rem] font-extrabold">Intervalo concluído</h3>
          <p className="text-[.85rem] text-navy-100 mt-1.5 mb-3.5">Falaste com 4 mentores. Vê quem conheceste e marca o teu interesse.</p>
          <button onClick={() => setActiveTab('met')} className="bg-primary-500 text-white rounded-full font-bold text-[.92rem] h-12 px-[22px]">Ver quem conheci</button>
        </Card>
      );
    } else {
      const mentorIndex = mentorForMenteeRound(MY_MENTEE_INDEX);
      const mentor = MENTORS[mentorIndex];
      const interest = interestByMentor[mentorIndex];
      body = (
        <>
          <Card variant="navy">
            <div className="flex justify-between items-center">
              <span className="text-[.76rem] font-bold text-primary-300 uppercase tracking-wide">Ronda {currentRound} de 4</span>
              <span className="font-extrabold text-[1.7rem]">{formatTime(secondsLeft)}</span>
            </div>
            <div className="my-3 mb-4"><ProgressBar value={(secondsLeft / (isRehearsal ? 30 : 300)) * 100} /></div>
            <div className="flex gap-3 items-center">
              <div className="inline-grid place-items-center w-16 h-16 rounded-[18px] bg-primary-500 text-white text-[1.8rem] font-extrabold shrink-0">
                {mentorIndex + 1}
              </div>
              <div>
                <p className="text-[.76rem] text-navy-100">Mesa</p>
                <h3 className="text-[1.08rem] font-extrabold">{mentor.name}</h3>
                <p className="text-[.85rem] text-navy-100">{mentor.role}, {mentor.company}</p>
              </div>
            </div>
            <div className="flex gap-1.5 flex-wrap mt-2.5">
              <span className="bg-white/10 text-white rounded-full px-3 py-[5px] text-[.74rem] font-semibold">{mentor.area}</span>
              <span className="bg-white/10 text-white rounded-full px-3 py-[5px] text-[.74rem] font-semibold">{compatibilityScore(MY_MENTEE_INDEX, mentorIndex)}% compatível</span>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3.5"><b>Quebra-gelos</b></div>
            <ol className="text-[.85rem] pl-[18px] mt-1 leading-[1.7]">
              <li>Como chegaste à tua área?</li>
              <li>Que erro evitarias no primeiro estágio?</li>
              <li>O que devo aprender já este ano?</li>
            </ol>
          </Card>

          <Card>
            <b>Queres continuar esta conversa?</b>
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => {
                  setInterestByMentor((previous) => ({ ...previous, [mentorIndex]: true }));
                  if (MUTUAL_MATCHES.includes(mentorIndex)) connectWithMentor(mentorIndex);
                  else showToast('Interesse guardado.');
                }}
                className={`rounded-full font-bold text-[.82rem] h-10 px-4 ${interest === true ? 'bg-primary-500 text-white' : 'bg-surface2 text-ink'}`}
              >
                Quero continuar
              </button>
              <button
                onClick={() => { setInterestByMentor((previous) => ({ ...previous, [mentorIndex]: false })); showToast('Ok, sem interesse.'); }}
                className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-surface2 text-ink"
              >
                Agora não
              </button>
            </div>
          </Card>
        </>
      );
    }

    return (
      <>
        {announcements.length > 0 && (
          <div className="bg-gradient-to-br from-primary-500 to-primary-400 text-white px-4 py-3 rounded-2xl mb-3.5 font-semibold text-[.88rem] shadow-md">
            {announcements[announcements.length - 1]}
          </div>
        )}
        <h2 className="text-[1.45rem] font-extrabold tracking-tight">Agora</h2>
        <p className="text-ink-muted text-[.85rem] mt-1 mb-4">{phaseLabel()}</p>
        {body}

        <Card>
          <div className="flex items-center justify-between mb-3.5"><b>Perguntas ao orador</b></div>
          {questions.map((question, index) => (
            <div key={index} className="flex justify-between items-center mt-3 gap-2.5">
              <span className="text-[.85rem] flex-1">{question.text}</span>
              <button
                onClick={() => setQuestions((previous) => previous.map((q, i) => (i === index ? { ...q, votes: q.votes + 1 } : q)))}
                className="rounded-full font-bold text-[.76rem] h-[34px] px-3.5 bg-surface2 text-ink"
              >
                ▲ {question.votes}
              </button>
            </div>
          ))}
          <QuestionInput onSubmit={(text) => { setQuestions((previous) => [...previous, { text, votes: 1, mine: true }]); showToast('Pergunta enviada.'); }} />
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3.5">
            <b>Sondagem</b>
            <span className="text-[.76rem] text-ink-muted">Maior obstáculo</span>
          </div>
          {POLL_OPTIONS.map((option, index) => {
            const percentage = totalPollVotes ? Math.round((pollVotes[index] / totalPollVotes) * 100) : 0;
            return (
              <div key={option} className="mt-3">
                <div className="flex justify-between text-[.85rem]">
                  <span>{option}</span>
                  <span className="text-ink-muted">{percentage}%</span>
                </div>
                <div className="mt-1.5"><ProgressBar value={percentage} /></div>
                {votedOption < 0 && (
                  <button
                    onClick={() => {
                      setPollVotes((previous) => previous.map((v, i) => (i === index ? v + 1 : v)));
                      setVotedOption(index);
                      showToast('Voto registado.');
                    }}
                    className="mt-2 rounded-full font-bold text-[.76rem] h-[34px] px-3.5 bg-surface2 text-ink"
                  >
                    Votar
                  </button>
                )}
              </div>
            );
          })}
        </Card>
      </>
    );
  };

  const renderMenteeMentors = () => (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Mentores</h2>
      <p className="text-ink-muted text-[.85rem] mt-1 mb-4">
        Marca até 5. Os marcados ganham bónus no matching. Marcados: {wishedMentors.length}/5
      </p>
      {MENTORS.map((mentor, index) => {
        const isWished = wishedMentors.includes(index);
        return (
          <Card key={index}>
            <PersonRow
              name={mentor.name}
              subtitle={`${mentor.role}, ${mentor.company}`}
              extra={
                <button
                  onClick={() => {
                    if (isWished) setWishedMentors((previous) => previous.filter((i) => i !== index));
                    else if (wishedMentors.length >= 5) return showToast('Máximo de 5 mentores.');
                    else setWishedMentors((previous) => [...previous, index]);
                  }}
                  className={`rounded-full font-bold text-[.76rem] h-[34px] px-3.5 ${isWished ? 'bg-primary-500 text-white' : 'bg-surface2 text-ink'}`}
                >
                  {isWished ? 'Marcado' : 'Quero'}
                </button>
              }
            />
            <div className="flex gap-1.5 flex-wrap mt-2.5">
              <span className="bg-surface text-ink-muted border border-line rounded-full px-3 py-[5px] text-[.74rem] font-semibold">{mentor.area}</span>
              <span className="bg-surface text-ink-muted border border-line rounded-full px-3 py-[5px] text-[.74rem] font-semibold">
                {compatibilityScore(MY_MENTEE_INDEX, index)}% compatível
              </span>
            </div>
          </Card>
        );
      })}
    </>
  );

  const renderMenteeMet = () => (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Quem conheci</h2>
      <p className="text-ink-muted text-[.85rem] mt-1 mb-4">Podes alterar o interesse até 7 dias depois do evento.</p>
      {metMentorIndices.length === 0 ? (
        <Card>
          <b>Ainda sem conversas.</b>
          <p className="text-ink-muted text-[.85rem] mt-1.5">Quando o intervalo começar, as pessoas aparecem aqui.</p>
        </Card>
      ) : metMentorIndices.map((mentorIndex) => {
        const mentor = MENTORS[mentorIndex];
        const interest = interestByMentor[mentorIndex];
        return (
          <Card key={mentorIndex}>
            <PersonRow name={mentor.name} subtitle={`${mentor.role}, ${mentor.company}`} />
            <textarea rows="2" placeholder="Nota privada, só tu vês" className="w-full mt-3 mb-0 text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 focus:border-primary-500 focus:outline-none" />
            <div className="flex items-center gap-2.5 mt-3">
              <button
                onClick={() => {
                  setInterestByMentor((previous) => ({ ...previous, [mentorIndex]: true }));
                  if (MUTUAL_MATCHES.includes(mentorIndex)) connectWithMentor(mentorIndex);
                }}
                className={`rounded-full font-bold text-[.82rem] h-10 px-4 ${interest === true ? 'bg-primary-500 text-white' : 'bg-surface2 text-ink'}`}
              >
                Quero continuar
              </button>
              <span className="text-[.85rem] text-ink-muted">
                {interest === true ? (MUTUAL_MATCHES.includes(mentorIndex) ? 'Interesse mútuo' : 'À espera do mentor') : ''}
              </span>
            </div>
          </Card>
        );
      })}
    </>
  );

  const renderMenteeConnections = () => (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Conexões</h2>
      <p className="text-ink-muted text-[.85rem] mt-1 mb-4">Telemóvel e e-mail só aparecem aqui.</p>
      {connections.length === 0 ? (
        <Card>
          <b>Sem conexões ainda.</b>
          <p className="text-ink-muted text-[.85rem] mt-1.5">Marca interesse depois de cada conversa.</p>
        </Card>
      ) : connections.map((mentorIndex) => {
        const mentor = MENTORS[mentorIndex];
        const request = mentorshipRequests.find((r) => r.mentorIndex === mentorIndex && r.menteeIndex === MY_MENTEE_INDEX);
        return (
          <Card key={mentorIndex}>
            <PersonRow name={mentor.name} subtitle={mentor.role} />
            <p className="text-[.85rem] mt-3 mb-2.5">
              +258 84 000 00{mentorIndex}0 · {getFirstName(mentor.name).toLowerCase()}@exemplo.co.mz
            </p>
            {request ? (
              <span className={`text-[.72rem] font-bold px-3 py-1 rounded-full ${
                request.status === 'accepted' ? 'bg-success/15 text-success' : 'bg-surface2 text-ink-muted'
              }`}>
                {{ pending: 'Pedido enviado', accepted: 'Mentoria ativa', declined: 'Pedido recusado' }[request.status]}
              </span>
            ) : (
              <button
                onClick={() => {
                  setMentorshipRequests((previous) => [...previous, { mentorIndex, menteeIndex: MY_MENTEE_INDEX, status: 'pending', message: 'Olá, gostava de ter o teu apoio como mentor.' }]);
                  showToast('Pedido enviado.');
                }}
                className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white"
              >
                Pedir mentoria
              </button>
            )}
          </Card>
        );
      })}
    </>
  );

  // ── MENTOR SCREENS ───────────────────────────
  const renderMentorHome = () => {
    const me = MENTORS[MY_MENTOR_INDEX];
    const acceptedCount = mentorshipRequests.filter((r) => r.mentorIndex === MY_MENTOR_INDEX && r.status === 'accepted').length;
    return (
      <>
        <h2 className="text-[1.45rem] font-extrabold tracking-tight">Olá, {getFirstName(me.name)}.</h2>
        <p className="text-ink-muted text-[.85rem] mt-1 mb-4">{me.role}, {me.company} · Mentor aprovado</p>

        <Card variant="navy">
          <div className="flex gap-3 items-center">
            <div className="flex-1 min-w-0">
              <div className="text-[.76rem] font-bold text-primary-300 uppercase tracking-wide">Bilhete</div>
              <h3 className="mt-1 text-[1.08rem] font-extrabold">{me.name}</h3>
              <p className="text-[.85rem] text-navy-100">Mesa {MY_MENTOR_INDEX + 1} fixa nos dois intervalos</p>
            </div>
            <div dangerouslySetInnerHTML={{ __html: generateQrSvg('CC-MENTOR-C') }} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3.5">
            <b>Mentorados aceites</b>
            <span className="text-[.76rem] text-ink-muted">{acceptedCount} de {maxMenteesPerMentor}</span>
          </div>
          <ProgressBar value={(acceptedCount / maxMenteesPerMentor) * 100} />
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3.5"><b>Marcado por mentorados</b></div>
          <p className="text-[.85rem] text-ink-muted">3 pessoas marcaram-te "quero conhecer". Os nomes aparecem no evento.</p>
        </Card>
      </>
    );
  };

  const renderMentorLive = () => {
    if (currentRound === 0 || currentRound > 4) {
      return (
        <>
          <h2 className="text-[1.45rem] font-extrabold tracking-tight">A minha mesa</h2>
          <p className="text-ink-muted text-[.85rem] mt-1 mb-4">{phaseLabel()}</p>
          <Card variant="navy">
            <h3 className="text-[1.08rem] font-extrabold">{currentRound === 0 ? 'À espera do intervalo' : 'Intervalo concluído'}</h3>
          </Card>
        </>
      );
    }

    const menteeIndex = menteeForRound(MY_MENTOR_INDEX);
    const mentee = MENTEES[menteeIndex];

    return (
      <>
        <h2 className="text-[1.45rem] font-extrabold tracking-tight">A minha mesa</h2>
        <p className="text-ink-muted text-[.85rem] mt-1 mb-4">{phaseLabel()}</p>

        <Card variant="navy">
          <div className="flex justify-between items-center">
            <span className="text-[.76rem] font-bold text-primary-300 uppercase tracking-wide">Ronda {currentRound} de 4</span>
            <span className="font-extrabold text-[1.7rem]">{formatTime(secondsLeft)}</span>
          </div>
          <div className="flex gap-3 items-center mt-3.5">
            <div className="inline-grid place-items-center w-16 h-16 rounded-[18px] bg-primary-500 text-white text-[1.8rem] font-extrabold shrink-0">
              {MY_MENTOR_INDEX + 1}
            </div>
            <div>
              <p className="text-[.76rem] text-navy-100">Mesa</p>
              <h3 className="text-[1.08rem] font-extrabold">1 mentorado</h3>
            </div>
          </div>
        </Card>

        <Card>
          <PersonRow name={mentee.name} subtitle={mentee.course} />
          <p className="text-[.85rem] mt-3"><b>Objetivo:</b> {mentee.goal}</p>
          <p className="text-[.85rem] mt-1"><b>Pitch:</b> {mentee.pitch}</p>
          <div className="flex gap-1.5 flex-wrap mt-2.5">
            <span className="bg-surface text-ink-muted border border-line rounded-full px-3 py-[5px] text-[.74rem] font-semibold">
              {compatibilityScore(menteeIndex, MY_MENTOR_INDEX)}% compatível
            </span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3.5"><b>3 perguntas para fazer</b></div>
          <ol className="text-[.85rem] pl-[18px] mt-1 leading-[1.7]">
            <li>O que já tentaste até agora?</li>
            <li>Que obstáculo te trava mais?</li>
            <li>Como posso ajudar já esta semana?</li>
          </ol>
        </Card>

        <Card>
          <b>Queres continuar com {getFirstName(mentee.name)}?</b>
          <div className="flex gap-3 mt-3">
            <button onClick={() => showToast('Interesse guardado.')} className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white">Quero continuar</button>
            <button onClick={() => showToast('Ok.')} className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-surface2 text-ink">Agora não</button>
          </div>
        </Card>
      </>
    );
  };

  const renderMentorRequests = () => {
    const myRequests = mentorshipRequests.filter((r) => r.mentorIndex === MY_MENTOR_INDEX);
    const accepted = myRequests.filter((r) => r.status === 'accepted').length;
    return (
      <>
        <h2 className="text-[1.45rem] font-extrabold tracking-tight">Pedidos de mentoria</h2>
        <p className="text-ink-muted text-[.85rem] mt-1 mb-4">
          Aceites: {accepted} de {maxMenteesPerMentor}. Ao atingir o limite, "Aceitar" fica desativado.
        </p>
        {myRequests.length === 0 ? (
          <Card><b>Sem pedidos.</b></Card>
        ) : myRequests.map((request) => (
          <Card key={request.menteeIndex}>
            <PersonRow name={MENTEES[request.menteeIndex].name} subtitle={MENTEES[request.menteeIndex].course} />
            <p className="text-[.85rem] mt-3 mb-2.5">"{request.message}"</p>
            {request.status === 'pending' ? (
              <div className="flex gap-2.5">
                <button
                  onClick={() => {
                    setMentorshipRequests((previous) => previous.map((r) => r === request ? { ...r, status: 'accepted' } : r));
                    showToast('Mentoria aceite.');
                  }}
                  disabled={accepted >= maxMenteesPerMentor}
                  className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white disabled:opacity-40"
                >
                  Aceitar
                </button>
                <button
                  onClick={() => {
                    setMentorshipRequests((previous) => previous.map((r) => r === request ? { ...r, status: 'declined' } : r));
                    showToast('Pedido recusado.');
                  }}
                  className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-surface2 text-ink"
                >
                  Recusar
                </button>
              </div>
            ) : (
              <span className={`text-[.72rem] font-bold px-3 py-1 rounded-full ${request.status === 'accepted' ? 'bg-success/15 text-success' : 'bg-surface2 text-ink-muted'}`}>
                {request.status === 'accepted' ? 'Aceite' : 'Recusado'}
              </span>
            )}
          </Card>
        ))}
      </>
    );
  };

  const renderMentorConnections = () => {
    const menteeIndices = [...new Set(mentorshipRequests.filter((r) => r.mentorIndex === MY_MENTOR_INDEX).map((r) => r.menteeIndex))];
    return (
      <>
        <h2 className="text-[1.45rem] font-extrabold tracking-tight">Conexões</h2>
        <p className="text-ink-muted text-[.85rem] mt-1 mb-4">Contactos visíveis só entre conectados.</p>
        {menteeIndices.length === 0 ? (
          <Card><b>Sem conexões ainda.</b></Card>
        ) : menteeIndices.map((menteeIndex) => (
          <Card key={menteeIndex}>
            <PersonRow name={MENTEES[menteeIndex].name} subtitle={MENTEES[menteeIndex].course} />
            <p className="text-[.85rem] mt-3">+258 84 100 00{menteeIndex}0</p>
          </Card>
        ))}
      </>
    );
  };

  // ── PROFILE (shared) ─────────────────────────
  const renderProfile = (asRole) => {
    const person = asRole === 'mentor' ? MENTORS[MY_MENTOR_INDEX] : MENTEES[MY_MENTEE_INDEX];
    const subtitle = asRole === 'mentor' ? `${person.role}, ${person.company}` : person.course;
    const fieldLabel = asRole === 'mentor' ? 'Áreas em que ajudas' : 'Pitch (120 caracteres)';
    const fieldValue = asRole === 'mentor' ? person.area : person.pitch;
    return (
      <>
        <h2 className="text-[1.45rem] font-extrabold tracking-tight">Perfil</h2>
        <Card className="mt-4">
          <PersonRow name={person.name} subtitle={subtitle} />
          <label className="block text-[.85rem] font-semibold mt-4 mb-1.5">{fieldLabel}</label>
          <input defaultValue={fieldValue} maxLength={120} className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 focus:border-primary-500 focus:outline-none" />
          <button onClick={() => showToast('Alterações guardadas. Valem a partir da próxima ronda.')} className="mt-3.5 rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white">Guardar</button>
        </Card>
        <button onClick={() => { setRole(null); window.scrollTo(0, 0); }} className="w-full rounded-full font-bold text-[.92rem] h-12 bg-surface2 text-ink">Sair</button>
      </>
    );
  };

  // ── ORGANIZER ─────────────────────────────────
  const renderOrganizerLive = () => (
    <>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 mb-3.5">
        <Card variant="navy">
          <div className="text-[.76rem] font-bold text-primary-300 uppercase tracking-wide">Fase</div>
          <h3 className="mt-1 text-[1.08rem] font-extrabold">{phaseLabel()}</h3>
          <div className="font-extrabold text-[2.8rem] mt-3 tracking-tight tabular-nums">{formatTime(secondsLeft)}</div>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-3.5"><b>Controlo</b></div>
          <div className="flex flex-wrap gap-2.5 mt-3">
            <button
              onClick={() => (currentRound >= 5 ? restartSimulation() : advanceRound())}
              className="rounded-full font-bold text-[.92rem] h-12 px-5 bg-primary-500 text-white"
            >
              {currentRound === 0 ? 'Iniciar intervalo 1' : currentRound < 4 ? `Avançar ronda ${currentRound + 1}` : currentRound === 4 ? 'Terminar intervalo' : 'Reiniciar'}
            </button>
            <button
              onClick={() => { setIsPaused((p) => !p); showToast(!isPaused ? 'Ronda em pausa para todos.' : 'Ronda retomada.'); }}
              disabled={currentRound < 1 || currentRound > 4}
              className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-surface2 text-ink disabled:opacity-40"
            >
              {isPaused ? 'Retomar' : 'Pausar'}
            </button>
          </div>
          <label className="flex gap-2.5 items-center text-[.85rem] mt-4">
            <input type="checkbox" checked={isRehearsal} onChange={(e) => { setIsRehearsal(e.target.checked); setSecondsLeft(e.target.checked ? 30 : 300); }} className="w-auto accent-primary-500" />
            Modo ensaio (rondas de 30 s)
          </label>
        </Card>
      </div>
      <Card>
        <div className="flex items-center justify-between mb-3.5"><b>Pares da ronda</b></div>
        <table className="w-full text-[.88rem] border-collapse">
          <thead>
            <tr>
              <th className="text-left text-[.76rem] uppercase tracking-wide text-ink-muted font-semibold py-[11px] px-2 border-b border-line">Mesa</th>
              <th className="text-left text-[.76rem] uppercase tracking-wide text-ink-muted font-semibold py-[11px] px-2 border-b border-line">Mentor</th>
              <th className="text-left text-[.76rem] uppercase tracking-wide text-ink-muted font-semibold py-[11px] px-2 border-b border-line">Mentorado</th>
              <th className="text-left text-[.76rem] uppercase tracking-wide text-ink-muted font-semibold py-[11px] px-2 border-b border-line">Compat.</th>
            </tr>
          </thead>
          <tbody>
            {MENTORS.map((mentor, mentorIndex) => {
              const menteeIndex = menteeForRound(mentorIndex);
              return (
                <tr key={mentorIndex} className="border-b border-line last:border-0">
                  <td className="py-[11px] px-2"><b>{mentorIndex + 1}</b></td>
                  <td className="py-[11px] px-2">{mentor.name}</td>
                  <td className="py-[11px] px-2">{menteeIndex == null ? '–' : MENTEES[menteeIndex].name}</td>
                  <td className="py-[11px] px-2">{menteeIndex == null ? '–' : `${compatibilityScore(menteeIndex, mentorIndex)}%`}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="text-[.85rem] text-ink-muted mt-3">Rácio 1:1 neste ensaio. O alerta dispara acima de 1:3.</p>
      </Card>
    </>
  );

  const renderOrganizerReg = () => {
    const rows = [
      ...MENTEES.map((m, i) => ({ id: `e${i}`, name: m.name, type: 'Mentorado' })),
      ...MENTORS.map((m, i) => ({ id: `m${i}`, name: m.name, type: 'Mentor' })),
    ];
    return (
      <>
        <Card>
          <div className="flex justify-between items-center"><b>Pendentes de aprovação</b></div>
          {hasPendingMentor ? (
            <div className="flex justify-between items-center mt-3">
              <PersonRow name="Helena Matsinhe" subtitle="Directora, Tmcel · Tecnologia e TI" />
              <button onClick={() => { setHasPendingMentor(false); showToast('Mentor aprovado. Recebe e-mail e WhatsApp.'); }} className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white">Aprovar</button>
            </div>
          ) : (
            <p className="text-[.85rem] text-success mt-2">Sem pendentes.</p>
          )}
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-3.5">
            <b>Check-in ({Object.keys(checkins).length}/{rows.length})</b>
            <button onClick={() => { setCheckins((previous) => ({ ...previous, [`w${Date.now()}`]: 1 })); showToast('Walk-in registado e presente.'); }} className="rounded-full font-bold text-[.76rem] h-[34px] px-3.5 bg-surface2 text-ink">+ Walk-in</button>
          </div>
          <table className="w-full text-[.88rem] border-collapse mt-1">
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-line last:border-0">
                  <td className="py-[11px] px-2">{row.name}</td>
                  <td className="py-[11px] px-2 text-ink-muted text-[.85rem]">{row.type}</td>
                  <td className="py-[11px] px-2 text-right">
                    <button
                      onClick={() => {
                        setCheckins((previous) => {
                          const next = { ...previous };
                          if (next[row.id]) delete next[row.id]; else next[row.id] = 1;
                          return next;
                        });
                      }}
                      className={`rounded-full font-bold text-[.76rem] h-[34px] px-3.5 ${checkins[row.id] ? 'bg-surface2 text-ink' : 'bg-primary-500 text-white'}`}
                    >
                      {checkins[row.id] ? 'Presente ✓' : 'Check-in'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </>
    );
  };

  const renderOrganizerInteraction = () => (
    <>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
        <Card>
          <b>Anúncio a todos</b>
          <AnnouncementInput onSubmit={(text) => { setAnnouncements((previous) => [...previous, text]); showToast('Anúncio enviado a todos.'); }} />
        </Card>
        <Card>
          <b>Perguntas para moderar</b>
          {questions.map((question, index) => (
            <p key={index} className="text-[.85rem] mt-2.5">▲ {question.votes} · {question.text}</p>
          ))}
        </Card>
      </div>
      <Card>
        <div className="flex items-center justify-between mb-3.5"><b>Sondagem ao vivo</b></div>
        {POLL_OPTIONS.map((option, index) => (
          <div key={option} className="flex justify-between items-center text-[.85rem] mt-2.5 gap-2.5">
            <span className="min-w-[120px]">{option}</span>
            <div className="flex-1"><ProgressBar value={(pollVotes[index] / totalPollVotes) * 100} /></div>
            <b>{pollVotes[index]}</b>
          </div>
        ))}
      </Card>
    </>
  );

  const renderOrganizerReports = () => {
    const conversationCount = (furthestRoundCompleted || 0) * 6;
    const kpis = [
      { label: 'Inscritos', value: '38 / 120' },
      { label: 'Presença', value: `${Math.round((Object.keys(checkins).length / 12) * 100)}%` },
      { label: 'Conversas', value: `${conversationCount} (meta 8)` },
      { label: 'Interesse mútuo', value: conversationCount ? `${Math.round(Math.min(40, 30 + connections.length * 2))}%` : '0%' },
      { label: 'Mentorias ativas', value: mentorshipRequests.filter((r) => r.status === 'accepted').length },
      { label: 'Satisfação', value: '4,6 / 5' },
    ];
    const areaSupplyDemand = [
      { area: 'Tecnologia e TI', supply: 70, demand: 30 },
      { area: 'Finanças e Banca', supply: 45, demand: 40 },
      { area: 'Direito', supply: 20, demand: 25 },
      { area: 'Agricultura', supply: 15, demand: 10 },
    ];
    return (
      <>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
          {kpis.map((kpi) => (
            <Card key={kpi.label}>
              <span className="text-ink-muted text-[.85rem]">{kpi.label}</span>
              <b className="block text-[1.9rem] font-extrabold leading-none tracking-tight mt-1">{kpi.value}</b>
            </Card>
          ))}
        </div>
        <Card>
          <div className="flex items-center justify-between mb-3.5"><b>Oferta e procura por área</b></div>
          {areaSupplyDemand.map((row) => (
            <div key={row.area} className="flex justify-between items-center text-[.85rem] mt-3 gap-2.5">
              <span className="min-w-[110px]">{row.area}</span>
              <div className="flex-1"><ProgressBar value={row.supply} /></div>
              <span className="text-[.76rem] text-ink-muted whitespace-nowrap">{row.supply}% · {row.demand}%</span>
            </div>
          ))}
          <div className="flex flex-wrap gap-2.5 mt-4">
            <button onClick={() => showToast('Exportação simulada.')} className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-surface2 text-ink">Exportar Excel</button>
            <button onClick={() => showToast('Exportação simulada.')} className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-surface2 text-ink">Plano em PDF</button>
          </div>
        </Card>
      </>
    );
  };

  const renderOrganizer = () => {
    const activeOrgTab = ORGANIZER_TABS.find((tab) => tab.key === activeTab) ? activeTab : 'live';
    const views = { live: renderOrganizerLive, reg: renderOrganizerReg, int: renderOrganizerInteraction, rep: renderOrganizerReports };
    return (
      <div className="max-w-[1040px] mx-auto pt-[18px] px-4 pb-10">
        <div className="flex justify-between items-center mb-3.5">
          <div className="font-extrabold text-[1.35rem] italic tracking-tight leading-none">
            Career<i className="text-primary-500 not-italic">Connect</i> <span className="text-ink-muted text-[.85rem] not-italic font-semibold">· Painel</span>
          </div>
          <button onClick={() => { setRole(null); window.scrollTo(0, 0); }} className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-surface2 text-ink">Sair</button>
        </div>
        {announcements.length > 0 && (
          <div className="bg-gradient-to-br from-primary-500 to-primary-400 text-white px-4 py-3 rounded-2xl mb-3.5 font-semibold text-[.88rem] shadow-md">
            {announcements[announcements.length - 1]}
          </div>
        )}
        <div className="flex gap-1 bg-surface-soft p-1 rounded-full mb-5 overflow-x-auto">
          {ORGANIZER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-[18px] py-2.5 font-semibold text-[.85rem] whitespace-nowrap transition ${activeOrgTab === tab.key ? 'bg-navy-800 text-white' : 'text-ink-muted'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {views[activeOrgTab]()}
      </div>
    );
  };

  // ── TV / PROJECTOR ───────────────────────────
  const renderTv = () => {
    const conversationCount = (furthestRoundCompleted || 0) * 6;
    return (
      <div className="bg-navy-900 text-white min-h-screen pt-[calc(env(safe-area-inset-top,0px)+34px)] px-[5vw] pb-[34px]" style={{ background: 'radial-gradient(circle at 30% 10%, #172554 0%, #0b1126 70%)' }}>
        <div className="flex justify-between items-center">
          <span className="font-extrabold text-[1.35rem] italic tracking-tight leading-none">
            Career<i className="text-primary-500 not-italic">Connect</i>
          </span>
          <button onClick={() => { setRole(null); window.scrollTo(0, 0); }} className="rounded-full font-bold text-[.82rem] h-10 px-4 text-white bg-white/10">Sair</button>
        </div>
        {announcements.length > 0 && (
          <div className="bg-gradient-to-br from-primary-500 to-primary-400 text-white px-4 py-3 rounded-2xl mt-5 font-semibold text-[1.2rem] shadow-md">
            {announcements[announcements.length - 1]}
          </div>
        )}
        <p className="mt-[30px] text-[1.3rem] text-navy-100">{phaseLabel()}</p>
        {currentRound >= 1 && currentRound <= 4 ? (
          <>
            <div className="font-extrabold text-[clamp(4.5rem,16vw,11rem)] text-primary-500 leading-none" style={{ textShadow: '0 10px 40px rgba(242,107,15,.4)' }}>
              {formatTime(secondsLeft)}
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5 mt-[30px]">
              {MENTORS.map((mentor, mentorIndex) => {
                const menteeIndex = menteeForRound(mentorIndex);
                return (
                  <div key={mentorIndex} className="bg-white/[.06] border border-white/[.08] rounded-[22px] p-5 backdrop-blur-md">
                    <span className="text-[.76rem] font-bold text-primary-300 uppercase tracking-wide">Mesa {mentorIndex + 1}</span>
                    <b className="block text-[1.1rem] mt-1.5">{mentor.name}</b>
                    <p className="text-navy-100 mt-1">{menteeIndex == null ? '–' : MENTEES[menteeIndex].name}</p>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div className="font-extrabold text-primary-500 leading-none" style={{ fontSize: 'clamp(2.8rem,9vw,5.5rem)', textShadow: '0 10px 40px rgba(242,107,15,.4)' }}>
              {currentRound === 0 ? 'A seguir: intervalo de ligações' : 'Obrigado!'}
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5 mt-[30px]">
              <div className="bg-white/[.06] border border-white/[.08] rounded-[22px] p-5 backdrop-blur-md">
                <b className="text-[2rem] text-primary-500 block">{conversationCount}</b>
                <p className="text-navy-100">conversas hoje</p>
              </div>
              <div className="bg-white/[.06] border border-white/[.08] rounded-[22px] p-5 backdrop-blur-md">
                <b className="text-[2rem] text-primary-500 block">{connections.length}</b>
                <p className="text-navy-100">conexões</p>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // ── ROUTER ───────────────────────────────────
  const renderMenteeContent = () => {
    const activeMenteeTab = NAV_MENTEE.find((tab) => tab.key === activeTab) ? activeTab : 'home';
    const views = {
      home: renderMenteeHome,
      live: renderMenteeLive,
      mentors: renderMenteeMentors,
      met: renderMenteeMet,
      conn: renderMenteeConnections,
      profile: () => renderProfile('mentee'),
    };
    return views[activeMenteeTab]();
  };

  const renderMentorContent = () => {
    const activeMentorTab = NAV_MENTOR.find((tab) => tab.key === activeTab) ? activeTab : 'home';
    const views = {
      home: renderMentorHome,
      live: renderMentorLive,
      req: renderMentorRequests,
      conn: renderMentorConnections,
      profile: () => renderProfile('mentor'),
    };
    return views[activeMentorTab]();
  };

  const renderNav = (items) => (
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

  // ── TOP-LEVEL RENDER ─────────────────────────
  let content = null;

  if (!role) {
    content = renderLogin();
  } else if (role === 'tv') {
    content = renderTv();
  } else if (role === 'org') {
    content = renderOrganizer();
  } else if (role === 'mentee') {
    content = (
      <>
        <div className="max-w-[480px] mx-auto pt-[18px] px-4 pb-[calc(112px+env(safe-area-inset-bottom,0px))]">
          {renderMenteeContent()}
        </div>
        {renderNav(NAV_MENTEE)}
      </>
    );
  } else if (role === 'mentor') {
    content = (
      <>
        <div className="max-w-[480px] mx-auto pt-[18px] px-4 pb-[calc(112px+env(safe-area-inset-bottom,0px))]">
          {renderMentorContent()}
        </div>
        {renderNav(NAV_MENTOR)}
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

// ─────────────────────────────────────────────
// SMALL INPUT COMPONENTS
// ─────────────────────────────────────────────
function QuestionInput({ onSubmit }) {
  const [value, setValue] = useState('');
  return (
    <div className="flex gap-2 mt-3.5">
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        maxLength={200}
        placeholder="A tua pergunta (máx. 200)"
        className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 focus:border-primary-500 focus:outline-none"
      />
      <button
        onClick={() => {
          const trimmed = value.trim();
          if (!trimmed) return;
          onSubmit(trimmed);
          setValue('');
        }}
        className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white shrink-0"
      >
        Enviar
      </button>
    </div>
  );
}

function AnnouncementInput({ onSubmit }) {
  const [value, setValue] = useState('');
  return (
    <>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Ex.: Masterclass 2 começa na sala B"
        className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 focus:border-primary-500 focus:outline-none mt-3 mb-3"
      />
      <button
        onClick={() => {
          const trimmed = value.trim();
          if (!trimmed) return;
          onSubmit(trimmed);
          setValue('');
        }}
        className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white"
      >
        Enviar anúncio
      </button>
    </>
  );
}