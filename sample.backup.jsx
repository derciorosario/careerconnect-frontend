import React, { useState, useEffect, useRef, useMemo } from 'react';

// ─────────────────────────────────────────────
// DATA & CONSTANTS
// ─────────────────────────────────────────────
const EVENT_DATE = new Date('2026-12-04T14:00:00+02:00');
const EVENT = {
  name: 'Career Connect 2026',
  venue: 'Hotel Cardoso, Maputo',
  startsAt: '2026-12-04T14:00:00+02:00',
  endsAt: '2026-12-04T17:00:00+02:00',
  capacity: 120,
  tablesCount: 6,
  roundMinutes: 5,
  roundsPerBreak: 4,
  warnSeconds: 30,
  matchWeights: { areas: 45, goal: 20, sector: 10, wish: 15, variety: 10 },
  tvCode: 'CC-TV-2026',
};

const AREAS = ['Tecnologia e TI','Finanças e Banca','Engenharia','Saúde','Direito','Marketing e Comunicação','Gestão e Empreendedorismo','Recursos Humanos','Energia e Recursos Naturais','Educação','Agricultura','Logística'];
const GOALS = ['Escolher a minha área','Preparar o primeiro estágio','Construir a minha marca pessoal','Desenvolver competências','Mudar de percurso','Criar o meu negócio'];

const MENTEES = [
  { name: 'Ana Mondlane',    course: 'Gestão · UEM',              goal: 'Escolher a minha área',        pitch: 'Quero descobrir que área seguir depois do curso.', interests: ['Gestão e Empreendedorismo','Finanças e Banca'] },
  { name: 'Bruno Chissano',  course: 'Engenharia Informática · ISCTEM', goal: 'Preparar o primeiro estágio', pitch: 'Procuro orientação para o meu primeiro estágio.', interests: ['Tecnologia e TI'] },
  { name: 'Cláudia Nhantumbo', course: 'Direito · UEM',           goal: 'Construir a minha marca pessoal', pitch: 'Quero comunicar melhor o que sei fazer.', interests: ['Direito','Marketing e Comunicação'] },
  { name: 'Dino Matola',     course: 'Economia · ISUTC',          goal: 'Desenvolver competências',     pitch: 'Quero reforçar a análise de dados.', interests: ['Finanças e Banca','Tecnologia e TI'] },
  { name: 'Elsa Macie',      course: 'Agronomia · UEM',           goal: 'Criar o meu negócio',          pitch: 'Tenho uma ideia de negócio agrícola.', interests: ['Agricultura'] },
  { name: 'Fátima Sitoe',    course: 'Marketing · ISCIM',         goal: 'Mudar de percurso',            pitch: 'Quero passar de vendas para marketing.', interests: ['Marketing e Comunicação'] },
];

const MENTORS = [
  { name: 'Sara Cumbe',    role: 'Directora de Finanças',  company: 'Standard Bank',     area: 'Finanças e Banca', sector: 'Finanças e Banca', canHelp: ['Escolher a minha área','Preparar o primeiro estágio'], maxMentees: 2 },
  { name: 'Nuno Bila',     role: 'Engenheiro de Software', company: 'Vodacom',           area: 'Tecnologia e TI', sector: 'Tecnologia e TI', canHelp: ['Desenvolver competências','Preparar o primeiro estágio'], maxMentees: 3 },
  { name: 'Carlos Tembe',  role: 'Gestor de Marketing',    company: 'Grupo Madal',       area: 'Marketing e Comunicação', sector: 'Marketing e Comunicação', canHelp: ['Construir a minha marca pessoal','Mudar de percurso'], maxMentees: 2 },
  { name: 'Ilda Mussa',    role: 'Advogada',               company: 'Mussa & Associados', area: 'Direito', sector: 'Direito', canHelp: ['Escolher a minha área','Construir a minha marca pessoal'], maxMentees: 1 },
  { name: 'Rui Machava',   role: 'Director de RH',         company: 'Vale Moçambique',   area: 'Recursos Humanos', sector: 'Recursos Humanos', canHelp: ['Preparar o primeiro estágio','Desenvolver competências'], maxMentees: 2 },
  { name: 'Lídia Zimba',   role: 'Fundadora',              company: 'Zimba Agro',        area: 'Agricultura', sector: 'Agricultura', canHelp: ['Criar o meu negócio','Mudar de percurso'], maxMentees: 3 },
];

const MASTERCLASSES = [
  { title: 'Estratégias para encontrar o primeiro passo', speaker: 'Sara Cumbe', challenge: 'Falta de clareza' },
  { title: 'A arte de criar redes de contactos',          speaker: 'Rui Machava', challenge: 'Contactos' },
  { title: 'Fui contratado. E agora?',                    speaker: 'Carlos Tembe', challenge: 'Transição' },
];

const POLL_OPTIONS = ['Falta de experiência', 'Contactos', 'Competências', 'Orientação'];
const MUTUAL_MATCHES = [1, 2, 4];
const MY_MENTEE_INDEX = 0;
const MY_MENTOR_INDEX = 2;

const INITIAL_QUESTIONS = [
  { text: 'Como se preparam as entrevistas sem experiência?', votes: 12, mine: false, status: 'visible', projected: false },
  { text: 'Vale a pena o LinkedIn para quem está a começar?', votes: 7,  mine: false, status: 'visible', projected: false },
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
  { key: 'cfg',  label: 'Configuração' },
  { key: 'rep',  label: 'Relatórios' },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const getInitials = (name) => name.split(' ').map(w => w[0]).slice(0,2).join('');
const getFirstName = (name) => name.split(' ')[0];

const compatibilityScore = (menteeIndex, mentorIndex, weights = EVENT.matchWeights) => {
  const mentee = MENTEES[menteeIndex];
  const mentor = MENTORS[mentorIndex];
  const commonAreas = (mentee.interests || []).filter(a => a === mentor.area).length;
  const areasScore = weights.areas * (commonAreas / Math.max(1, mentee.interests.length));
  const goalScore = mentor.canHelp.includes(mentee.goal) ? weights.goal : 0;
  const sectorScore = mentee.interests.includes(mentor.sector) ? weights.sector : 0;
  const wishScore = 0; // filled by wish lookup in caller if needed
  const varietyScore = weights.variety;
  return Math.round(Math.min(100, areasScore + goalScore + sectorScore + wishScore + varietyScore));
};

const hashString = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const formatTime = (s) => `${String(Math.floor(s/60)).padStart(1,'0')}:${String(s%60).padStart(2,'0')}`;

const generateQrSvg = (seed) => {
  let h = hashString(seed);
  let cells = '';
  for (let y = 0; y < 11; y++) for (let x = 0; x < 11; x++) {
    const finder = (x < 3 && y < 3) || (x > 7 && y < 3) || (x < 3 && y > 7);
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    if (finder || h % 2) cells += `<rect x="${x*10}" y="${y*10}" width="10" height="10"/>`;
  }
  return `<svg viewBox="0 0 110 110" fill="#1b2a57" class="w-[120px] h-[120px] bg-white rounded-[14px] p-1.5 shrink-0">${cells}</svg>`;
};

// ─────────────────────────────────────────────
// PRESENTATIONAL COMPONENTS
// ─────────────────────────────────────────────
const Avatar = ({ name, size = 'md', variant = 'navy' }) => {
  const sizeClass = size === 'lg' ? 'w-16 h-16 text-xl' : 'w-[46px] h-[46px] text-sm';
  const variantClass = variant === 'orange' ? 'bg-primary-500' : 'bg-navy-800';
  return <div className={`${sizeClass} ${variantClass} text-white rounded-full grid place-items-center font-extrabold shrink-0 tracking-wide`}>{getInitials(name)}</div>;
};

const PersonRow = ({ name, subtitle, extra = null }) => (
  <div className="flex gap-3 items-center">
    <Avatar name={name} />
    <div className="flex-1 min-w-0"><b>{name}</b><div className="text-ink-muted text-[.85rem] mt-px">{subtitle}</div></div>
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
    <span className={`w-[22px] h-[22px] rounded-full border-2 grid place-items-center text-[.7rem] text-white shrink-0 transition ${done ? 'bg-success border-success' : 'border-line'}`}>{done ? '✓' : ''}</span>
    {label}
  </div>
);

const Card = ({ children, variant = 'soft', className = '' }) => {
  const v = variant === 'navy' ? 'bg-navy-800 text-white shadow-card' : variant === 'orange' ? 'bg-primary-50 border border-primary-500/25' : 'bg-surface-soft shadow-sm';
  return <div className={`rounded-card p-5 mb-3 ${v} ${className}`}>{children}</div>;
};

const Toast = ({ message }) => (
  <div className={`fixed left-1/2 bottom-[calc(88px+env(safe-area-inset-bottom,0px))] -translate-x-1/2 bg-ink text-surface px-[22px] py-[13px] rounded-full font-semibold text-[.88rem] max-w-[90vw] text-center z-[60] shadow-lg transition-all duration-200 ${message ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}>{message}</div>
);

const Btn = ({ children, onClick, variant = 'primary', disabled, className = '', full }) => {
  const base = 'rounded-full font-bold text-[.85rem] h-10 px-4 transition active:scale-[.98] disabled:opacity-40';
  const v = variant === 'primary' ? 'bg-primary-500 text-white' : variant === 'soft' ? 'bg-surface2 text-ink' : 'bg-navy-800 text-white';
  return <button onClick={onClick} disabled={disabled} className={`${base} ${v} ${full ? 'w-full' : ''} ${className}`}>{children}</button>;
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function CareerConnectApp() {
  // Session
  const [role, setRole] = useState(null); // null | 'mentee' | 'mentor' | 'org' | 'tv' | 'visitor'
  const [activeTab, setActiveTab] = useState('home');
  const [visitorPage, setVisitorPage] = useState('mentee'); // 'mentee' | 'mentor' | 'register' | 'registerMentor'

  // Event simulation
  const [currentRound, setCurrentRound] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isRehearsal, setIsRehearsal] = useState(false);
  const [furthestRoundCompleted, setFurthestRoundCompleted] = useState(0);

  // Mentee state
  const [wishedMentors, setWishedMentors] = useState([1, 4]);
  const [interestByMentor, setInterestByMentor] = useState({});
  const [connections, setConnections] = useState([{ mentorIndex: 0, origin: 'mutual' }]);
  const [mentorshipRequests, setMentorshipRequests] = useState([
    { mentorIndex: 2, menteeIndex: 1, status: 'pending', message: 'Olá Carlos, gostava de orientação sobre o meu primeiro estágio.' },
  ]);
  const [masterclassesReserved, setMasterclassesReserved] = useState(false);
  const [nextStep, setNextStep] = useState(null);
  const [surveyDone, setSurveyDone] = useState(false);
  const [privateNotes, setPrivateNotes] = useState({});
  const [messages, setMessages] = useState([
    { connectionKey: 'me-0', from: 'them', body: 'Olá Ana, foi um prazer conversar contigo!', read: true, at: '15:20' },
  ]);
  const [chatOpen, setChatOpen] = useState(null);

  // Mentor state
  const [mentorApproval, setMentorApproval] = useState('approved'); // 'pending' | 'approved'
  const [mentorDecisions, setMentorDecisions] = useState({});

  // Org state
  const [announcements, setAnnouncements] = useState([]);
  const [checkins, setCheckins] = useState({ m0:1,m1:1,m2:1,m3:1,m4:1,m5:1,e0:1,e1:1,e2:1,e3:1,e5:1 });
  const [hasPendingMentor, setHasPendingMentor] = useState(true);
  const [pendingApprovalList, setPendingApprovalList] = useState([{ name: 'Helena Matsinhe', role: 'Directora, Tmcel', area: 'Tecnologia e TI' }]);

  // Shared interactive
  const [questions, setQuestions] = useState(INITIAL_QUESTIONS);
  const [pollVotes, setPollVotes] = useState([4, 9, 3, 2]);
  const [votedOption, setVotedOption] = useState(-1);
  const [pollOpen, setPollOpen] = useState(true);

  // Registration state
  const [regStep, setRegStep] = useState(1);
  const [regForm, setRegForm] = useState({ name: '', email: '', phone: '', password: '', course: '', institution: '', interests: [], goal: '', pitch: '', consent: false });

  // Org config state
  const [config, setConfig] = useState({ ...EVENT });

  // UI
  const [toastMessage, setToastMessage] = useState('');
  const toastTimer = useRef(null);
  const showToast = (m) => { setToastMessage(m); if (toastTimer.current) clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToastMessage(''), 2600); };

  // Countdown
  useEffect(() => {
    if (!isRunning || isPaused) return;
    const i = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) { advanceRound(); return isRehearsal ? 30 : 300; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(i);
  }, [isRunning, isPaused, isRehearsal]);

  const phaseLabel = () => {
    if (currentRound === 0) return 'Antes do intervalo';
    if (currentRound > 4) return 'Intervalo concluído';
    return `Intervalo 1 · ronda ${currentRound} de 4`;
  };

  const advanceRound = () => {
    setCurrentRound(prev => {
      if (prev > 0 && prev <= 4) setFurthestRoundCompleted(f => Math.max(f, prev));
      if (prev < 4) { setIsRunning(true); setIsPaused(false); setSecondsLeft(isRehearsal ? 30 : 300); return prev + 1; }
      setIsRunning(false); setFurthestRoundCompleted(4); return 5;
    });
  };

  const restartSimulation = () => { setCurrentRound(0); setFurthestRoundCompleted(0); setIsRunning(false); setIsPaused(false); setSecondsLeft(isRehearsal ? 30 : 300); };

  const totalPollVotes = useMemo(() => pollVotes.reduce((s,v) => s+v, 0), [pollVotes]);

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
      const idx = mentorForMenteeRound(MY_MENTEE_INDEX);
      if (idx !== null && !list.includes(idx)) list.push(idx);
    }
    if (currentRound >= 1 && currentRound <= 4) {
      const liveIdx = mentorForMenteeRound(MY_MENTEE_INDEX);
      if (liveIdx !== null && !list.includes(liveIdx)) list.push(liveIdx);
    }
    return list;
  }, [currentRound, furthestRoundCompleted]);

  const connectWithMentor = (mentorIndex, origin = 'mutual') => {
    setConnections(prev => {
      if (prev.some(c => c.mentorIndex === mentorIndex)) return prev;
      showToast(`Nova conexão com ${MENTORS[mentorIndex].name}!`);
      return [...prev, { mentorIndex, origin }];
    });
  };

  const exchangeCode = (mentorIndex) => { connectWithMentor(mentorIndex, 'code_swap'); showToast('Código trocado — conexão criada.'); };

  // ─────────────────────────────────────────────
  // VISITOR / LANDING
  // ─────────────────────────────────────────────
  const renderLandingMentee = () => {
    const vacancies = config.capacity - 82;
    return (
      <div className="max-w-[720px] mx-auto pt-[18px] px-4 pb-10">
        <div className="flex justify-between items-center mb-6">
          <div className="font-extrabold text-[1.35rem] italic tracking-tight leading-none">Career<i className="text-primary-500 not-italic">Connect</i></div>
          <div className="flex gap-2">
            <Btn variant="soft" onClick={() => { setRole('visitor'); setVisitorPage('mentor'); }}>Torna-te mentor</Btn>
            <Btn onClick={() => { setRole('visitor'); setVisitorPage('register'); }}>Registar</Btn>
          </div>
        </div>

        <section className="rounded-card bg-navy-800 text-white p-6 mb-4">
          <h1 className="text-[clamp(1.8rem,5vw,2.6rem)] font-extrabold tracking-tight leading-tight">O teu próximo passo começa numa ligação.</h1>
          <p className="text-navy-100 mt-2">{config.venue} · 4 Dez 2026 · 14H00–17H00</p>
          <div className="flex gap-2 flex-wrap mt-4">
            <Btn onClick={() => { setRole('visitor'); setVisitorPage('register'); }}>Garantir o meu lugar</Btn>
            <Btn variant="soft" onClick={() => showToast('Link .ics / Google Calendar copiado.')}>Adicionar ao calendário</Btn>
            <Btn variant="soft" onClick={() => showToast('A abrir Google Maps…')}>Ver no mapa</Btn>
          </div>
          <p className="text-[.8rem] text-navy-100 mt-3">Vagas restantes: <b>{vacancies}</b> de {config.capacity}</p>
        </section>

        <section className="grid grid-cols-2 gap-3 mb-4">
          {[
            ['Encontrar um mentor','Conversas 1:1 com quem já fez o percurso.'],
            ['Fazer conexões','Contactos profissionais para o próximo passo.'],
            ['8 conversas num só dia','Duas rondas por intervalo, quatro no total.'],
            ['Dar o próximo passo','Sais com um compromisso concreto.'],
          ].map(([t,d]) => (
            <Card key={t}><b>{t}</b><p className="text-[.85rem] text-ink-muted mt-1">{d}</p></Card>
          ))}
        </section>

        <section className="mb-4">
          <h2 className="text-[1.15rem] font-extrabold mb-2">Como funcionam as ligações</h2>
          <ol className="text-[.9rem] pl-5 leading-[1.7] list-decimal">
            <li>Regista-te em menos de 2 minutos.</li>
            <li>Conversa nos intervalos, 5 minutos por ronda.</li>
            <li>Continua a conexão depois do evento.</li>
          </ol>
        </section>

        <section className="mb-4">
          <h2 className="text-[1.15rem] font-extrabold mb-2">Programa</h2>
          {MASTERCLASSES.map((mc, i) => (
            <Card key={i}><b>{i+1}. {mc.title}</b><p className="text-[.85rem] text-ink-muted mt-1">Orador: {mc.speaker} · Desafio: {mc.challenge}</p></Card>
          ))}
        </section>

        <section className="mb-4">
          <h2 className="text-[1.15rem] font-extrabold mb-2">FAQ</h2>
          <Card><b>Sair do evento garante-me trabalho?</b><p className="text-[.85rem] text-ink-muted mt-1">Não. O foco é orientação e conexões para o teu percurso.</p></Card>
          <Card><b>Preciso de pagar?</b><p className="text-[.85rem] text-ink-muted mt-1">Não. O evento e a plataforma são gratuitos.</p></Card>
        </section>

        <Card variant="orange">
          <b>És profissional? Torna-te mentor</b>
          <p className="text-[.85rem] mt-1">Influencia a carreira de alguém. 40 min no dia, 1 a 3 mentorados depois.</p>
          <div className="mt-3"><Btn onClick={() => { setRole('visitor'); setVisitorPage('mentor'); }}>Saber mais</Btn></div>
        </Card>
      </div>
    );
  };

  const renderLandingMentor = () => (
    <div className="max-w-[720px] mx-auto pt-[18px] px-4 pb-10">
      <div className="flex justify-between items-center mb-6">
        <div className="font-extrabold text-[1.35rem] italic tracking-tight leading-none">Career<i className="text-primary-500 not-italic">Connect</i></div>
        <Btn variant="soft" onClick={() => { setRole('visitor'); setVisitorPage('mentee'); }}>← Voltar</Btn>
      </div>
      <section className="rounded-card bg-navy-800 text-white p-6 mb-4">
        <h1 className="text-[clamp(1.8rem,5vw,2.6rem)] font-extrabold tracking-tight leading-tight">Torna-te mentor. Influencia a carreira de alguém.</h1>
        <p className="text-navy-100 mt-2">4 Dez 2026 · Hotel Cardoso · 40 min no dia, 1 a 3 mentorados depois.</p>
        <div className="mt-4"><Btn onClick={() => { setRole('visitor'); setVisitorPage('registerMentor'); }}>Candidatar-me</Btn></div>
      </section>
      <section className="grid grid-cols-2 gap-3 mb-4">
        {[['Descobrir talento','Conhece jovens com ambição.'],['Devolver','Partilha o que aprendeste.'],['Rede','Conecta-te com outros profissionais.'],['Impacto','Acompanha 1 a 3 mentorados.']].map(([t,d]) => (
          <Card key={t}><b>{t}</b><p className="text-[.85rem] text-ink-muted mt-1">{d}</p></Card>
        ))}
      </section>
      <Card>
        <b>O que se espera</b>
        <ul className="text-[.9rem] pl-5 list-disc mt-2 leading-[1.7]">
          <li>40 minutos no dia do evento.</li>
          <li>1 a 3 mentorados depois.</li>
          <li>Disponibilidade para responder a pedidos.</li>
        </ul>
      </Card>
    </div>
  );

  const renderRegister = (isMentor) => {
    const stepLabel = regStep === 1 ? 'Passo 1 de 2 · Conta' : `Passo 2 de 2 · ${isMentor ? 'Perfil de mentor' : 'Perfil de mentorado'}`;
    return (
      <div className="max-w-[480px] mx-auto pt-[18px] px-4 pb-10">
        <div className="flex justify-between items-center mb-3">
          <div className="font-extrabold text-[1.35rem] italic tracking-tight leading-none">Career<i className="text-primary-500 not-italic">Connect</i></div>
          <Btn variant="soft" onClick={() => { setRole(null); setRegStep(1); }}>Cancelar</Btn>
        </div>
        <div className="text-[.78rem] font-bold text-primary-500 uppercase tracking-wide mb-1">{stepLabel}</div>
        <ProgressBar value={regStep === 1 ? 50 : 100} />
        <div className="mt-5">
          {regStep === 1 ? (
            <Card>
              <b className="block mb-3">Cria a tua conta</b>
              <input placeholder="Nome completo" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 mb-2 focus:border-primary-500 focus:outline-none" />
              <input placeholder="E-mail" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 mb-2 focus:border-primary-500 focus:outline-none" />
              <input placeholder="Telemóvel (WhatsApp)" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 mb-2 focus:border-primary-500 focus:outline-none" />
              <input placeholder="Palavra-passe" type="password" value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})} className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 mb-2 focus:border-primary-500 focus:outline-none" />
              <p className="text-[.8rem] text-ink-muted my-2">ou</p>
              <Btn variant="soft" full onClick={() => showToast('Código OTP enviado por SMS/e-mail. (simulado)')}>Entrar com código de 6 dígitos</Btn>
              <div className="mt-3"><Btn full onClick={() => setRegStep(2)} disabled={!regForm.name || !regForm.email}>Continuar</Btn></div>
            </Card>
          ) : isMentor ? (
            <Card>
              <b className="block mb-3">Perfil de mentor</b>
              <input placeholder="Cargo" value={regForm.course} onChange={e => setRegForm({...regForm, course: e.target.value})} className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 mb-2 focus:border-primary-500 focus:outline-none" />
              <input placeholder="Empresa" value={regForm.institution} onChange={e => setRegForm({...regForm, institution: e.target.value})} className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 mb-2 focus:border-primary-500 focus:outline-none" />
              <label className="block text-[.82rem] font-semibold mt-2 mb-1">Área principal</label>
              <select value={regForm.goal} onChange={e => setRegForm({...regForm, goal: e.target.value})} className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 mb-2 focus:border-primary-500 focus:outline-none">
                <option value="">Escolher…</option>
                {AREAS.map(a => <option key={a}>{a}</option>)}
              </select>
              <label className="block text-[.82rem] font-semibold mt-2 mb-1">Objetivos em que ajudas</label>
              <select className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 mb-2 focus:border-primary-500 focus:outline-none">
                {GOALS.map(g => <option key={g}>{g}</option>)}
              </select>
              <label className="block text-[.82rem] font-semibold mt-2 mb-1">Máximo de mentorados (1 a 3)</label>
              <select className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 mb-2 focus:border-primary-500 focus:outline-none">
                <option>1</option><option>2</option><option>3</option>
              </select>
              <label className="flex items-start gap-2 text-[.82rem] mt-3">
                <input type="checkbox" checked={regForm.consent} onChange={e => setRegForm({...regForm, consent: e.target.checked})} className="mt-1 accent-primary-500" />
                <span>Autorizo partilhar o meu perfil com os pares sugeridos. Data e versão registadas.</span>
              </label>
              <div className="mt-3"><Btn full onClick={() => { setRole('mentor'); setActiveTab('home'); setMentorApproval('pending'); showToast('Candidatura enviada. A aguardar aprovação.'); setRegStep(1); }} disabled={!regForm.consent}>Enviar candidatura</Btn></div>
            </Card>
          ) : (
            <Card>
              <b className="block mb-3">Sobre ti</b>
              <input placeholder="Curso" value={regForm.course} onChange={e => setRegForm({...regForm, course: e.target.value})} className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 mb-2 focus:border-primary-500 focus:outline-none" />
              <input placeholder="Instituição" value={regForm.institution} onChange={e => setRegForm({...regForm, institution: e.target.value})} className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 mb-2 focus:border-primary-500 focus:outline-none" />
              <label className="block text-[.82rem] font-semibold mt-2 mb-1">Até 3 áreas de interesse</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {AREAS.map(a => {
                  const sel = regForm.interests.includes(a);
                  return <button key={a} onClick={() => {
                    if (sel) setRegForm({...regForm, interests: regForm.interests.filter(x => x !== a)});
                    else if (regForm.interests.length < 3) setRegForm({...regForm, interests: [...regForm.interests, a]});
                  }} className={`rounded-full px-3 py-1 text-[.72rem] font-semibold border ${sel ? 'bg-primary-500 text-white border-primary-500' : 'bg-surface text-ink-muted border-line'}`}>{a}</button>;
                })}
              </div>
              <label className="block text-[.82rem] font-semibold mt-2 mb-1">1 objetivo</label>
              <select value={regForm.goal} onChange={e => setRegForm({...regForm, goal: e.target.value})} className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 mb-2 focus:border-primary-500 focus:outline-none">
                <option value="">Escolher…</option>
                {GOALS.map(g => <option key={g}>{g}</option>)}
              </select>
              <input placeholder="Pitch (máx. 120)" maxLength={120} value={regForm.pitch} onChange={e => setRegForm({...regForm, pitch: e.target.value})} className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 mb-2 focus:border-primary-500 focus:outline-none" />
              <label className="flex items-start gap-2 text-[.82rem] mt-3">
                <input type="checkbox" checked={regForm.consent} onChange={e => setRegForm({...regForm, consent: e.target.checked})} className="mt-1 accent-primary-500" />
                <span>Autorizo partilhar o meu perfil com os pares sugeridos. Data e versão registadas.</span>
              </label>
              <div className="mt-3"><Btn full onClick={() => { setRole('mentee'); setActiveTab('home'); showToast('Registo concluído. Bilhete enviado por e-mail e WhatsApp.'); setRegStep(1); }} disabled={!regForm.consent}>Concluir registo</Btn></div>
            </Card>
          )}
        </div>
        {regStep === 2 && <div className="mt-2"><Btn variant="soft" full onClick={() => setRegStep(1)}>← Voltar</Btn></div>}
      </div>
    );
  };

  // ─────────────────────────────────────────────
  // LOGIN (demo selector)
  // ─────────────────────────────────────────────
  const renderLogin = () => {
    const accounts = [
      { key: 'visitor', name: 'Visitante',        label: 'Ver landings',   description: 'Landing mentorado, Torna-te mentor, registo' },
      { key: 'mentee',  name: 'Ana Mondlane',    label: 'Mentorado',      description: 'Passaporte, rondas, mentores, conexões' },
      { key: 'mentor',  name: 'Carlos Tembe',    label: 'Mentor',         description: 'Mesa, mentorados, pedidos de mentoria' },
      { key: 'org',     name: 'Equipa Career Connect', label: 'Organizador', description: 'Fases, check-in, aprovações, config, relatórios' },
      { key: 'tv',      name: 'Ecrã grande',     label: 'Projetor',       description: 'Contagem, quadro de mesas, perguntas, sondagens' },
    ];
    return (
      <div className="max-w-[720px] mx-auto pt-[52px] px-[22px] pb-10">
        <div className="font-extrabold text-[1.35rem] italic tracking-tight leading-none">Career<i className="text-primary-500 not-italic">Connect</i></div>
        <h1 className="my-6 mb-3 max-w-[15ch] text-[clamp(1.9rem,6vw,2.8rem)] font-extrabold tracking-tight">Entra na tua área pessoal.</h1>
        <p className="text-ink-muted">Simulação sem servidor. Escolhe um perfil de demonstração e explora o que cada pessoa vê.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-[30px]">
          {accounts.map(a => (
            <button key={a.key} onClick={() => { setRole(a.key); setActiveTab(a.key === 'org' ? 'live' : 'home'); if (a.key === 'visitor') setVisitorPage('mentee'); if (a.key === 'mentor') setMentorApproval('approved'); window.scrollTo(0,0); }}
              className="text-left bg-surface-soft border-2 border-transparent hover:border-primary-500 rounded-3xl p-5 flex flex-col gap-0.5 text-ink transition active:scale-[.985]">
              <Avatar name={a.name} />
              <h3 className="text-[1.02rem] mt-3 mb-0.5 font-bold">{a.label}</h3>
              <div className="text-ink-muted text-[.85rem]">{a.name}</div>
              <p className="text-[.85rem] mt-2 text-ink-muted">{a.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────
  // MENTEE SCREENS
  // ─────────────────────────────────────────────
  const renderMenteeHome = () => {
    const my = MENTEES[MY_MENTEE_INDEX];
    const done = furthestRoundCompleted || 0;
    const prepChecklist = [
      { label: 'Perfil completo', done: true },
      { label: 'Pitch escrito', done: true },
      { label: '3 mentores marcados', done: wishedMentors.length >= 3 },
      { label: 'Masterclasses reservadas', done: masterclassesReserved },
    ];
    const badges = [
      { label: 'Primeira ligação', earned: done >= 1 },
      { label: 'Meio caminho', earned: done >= 4 },
      { label: 'Passaporte completo', earned: done >= 8 },
      { label: 'Primeira conexão', earned: connections.length > 0 },
      { label: 'Voz ativa', earned: questions.some(q => q.mine) },
      { label: 'Mentoria ativa', earned: mentorshipRequests.some(r => r.menteeIndex === MY_MENTEE_INDEX && r.status === 'accepted') },
    ];
    return (
      <>
        <h2 className="text-[1.45rem] font-extrabold tracking-tight">Olá, {getFirstName(my.name)}.</h2>
        <p className="text-ink-muted text-[.85rem] mt-1 mb-4">4 Dez 2026 · 14H00 · Hotel Cardoso</p>

        <Card variant="navy">
          <div className="flex gap-3 items-center">
            <div className="flex-1 min-w-0">
              <div className="text-[.76rem] font-bold text-primary-300 uppercase tracking-wide">Bilhete</div>
              <h3 className="mt-1 text-[1.08rem] font-extrabold">{my.name}</h3>
              <p className="text-[.85rem] text-navy-100">Mentorado · {my.course}</p>
              <p className="font-extrabold text-[1.05rem] mt-3 tracking-widest">CC-7K2QF</p>
              <p className="text-[.76rem] text-navy-100 mt-0.5">Disponível sem rede</p>
            </div>
            <div dangerouslySetInnerHTML={{ __html: generateQrSvg('CC-7K2QF') }} />
          </div>
          <div className="mt-3"><Btn variant="soft" onClick={() => showToast('QR do teu bilhete mostrado para troca de contactos.')}>Mostrar QR para troca</Btn></div>
        </Card>

        <Card variant="navy">
          <div className="flex gap-3 items-center">
            <div className="shrink-0" dangerouslySetInnerHTML={{ __html: `
              <svg width="104" height="104" viewBox="0 0 110 110" role="img" aria-label="${done} de 8 conversas">
                <circle cx="55" cy="55" r="42" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="10"/>
                <circle cx="55" cy="55" r="42" fill="none" stroke="#f26b0f" stroke-width="10" stroke-linecap="round"
                  stroke-dasharray="${2*Math.PI*42}" stroke-dashoffset="${2*Math.PI*42*(1-done/8)}" transform="rotate(-90 55 55)"/>
                <text x="55" y="61" text-anchor="middle" fill="#fff" font-family="Montserrat" font-weight="800" font-size="26">${done}</text>
              </svg>` }} />
            <div><b>Passaporte</b><p className="text-[.85rem] text-navy-100">{done} de 8 conversas · {connections.length} conexões</p></div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3.5"><b>Prepara-te</b></div>
          {prepChecklist.map(i => <ChecklistItem key={i.label} label={i.label} done={i.done} />)}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3.5"><b>Conquistas</b></div>
          <div className="flex gap-1.5 flex-wrap mt-2.5">
            {badges.map(b => <span key={b.label} className={`rounded-full px-3 py-[5px] text-[.74rem] font-semibold ${b.earned ? 'bg-primary-500 text-white' : 'bg-surface text-ink-muted border border-line opacity-50'}`}>{b.label}</span>)}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3.5"><b>Reservar masterclasses</b></div>
          <p className="text-ink-muted text-[.85rem] mb-2.5">Sem custo.</p>
          {MASTERCLASSES.map((mc, i) => (
            <div key={i} className="flex justify-between items-center mt-2.5 gap-2.5">
              <span className="text-[.85rem] flex-1">{mc.title}</span>
              <Btn variant={masterclassesReserved ? 'soft' : 'primary'} onClick={() => { setMasterclassesReserved(!masterclassesReserved); showToast(!masterclassesReserved ? 'Lugares reservados.' : 'Reservas canceladas.'); }}>{masterclassesReserved ? 'Reservado' : 'Reservar'}</Btn>
            </div>
          ))}
        </Card>

        <Card>
          <b>O meu próximo passo</b>
          {nextStep ? (
            <p className="text-[.85rem] mt-2">Compromisso: <b>{nextStep.text}</b> · até {nextStep.due}</p>
          ) : (
            <NextStepForm onSave={n => { setNextStep(n); showToast('Compromisso guardado. Lembrete automático.'); }} />
          )}
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
          <p className="text-[.85rem] text-navy-100 mt-1.5 mb-3.5">Vê quem conheceste, altera o interesse e fecha o dia.</p>
          <div className="flex gap-2 flex-wrap">
            <Btn onClick={() => setActiveTab('met')}>Ver quem conheci</Btn>
            <Btn variant="soft" onClick={() => setActiveTab('home')}>Fechar o dia</Btn>
          </div>
        </Card>
      );
    } else {
      const mi = mentorForMenteeRound(MY_MENTEE_INDEX);
      const mentor = MENTORS[mi];
      const interest = interestByMentor[mi];
      body = (
        <>
          <Card variant="navy">
            <div className="flex justify-between items-center">
              <span className="text-[.76rem] font-bold text-primary-300 uppercase tracking-wide">Ronda {currentRound} de 4</span>
              <span className="font-extrabold text-[1.7rem]">{formatTime(secondsLeft)}</span>
            </div>
            <div className="my-3 mb-4"><ProgressBar value={(secondsLeft / (isRehearsal ? 30 : 300)) * 100} /></div>
            <div className="flex gap-3 items-center">
              <div className="inline-grid place-items-center w-16 h-16 rounded-[18px] bg-primary-500 text-white text-[1.8rem] font-extrabold shrink-0">{mi + 1}</div>
              <div>
                <p className="text-[.76rem] text-navy-100">Mesa</p>
                <h3 className="text-[1.08rem] font-extrabold">{mentor.name}</h3>
                <p className="text-[.85rem] text-navy-100">{mentor.role}, {mentor.company}</p>
              </div>
            </div>
            <div className="flex gap-1.5 flex-wrap mt-2.5">
              <span className="bg-white/10 text-white rounded-full px-3 py-[5px] text-[.74rem] font-semibold">{mentor.area}</span>
              <span className="bg-white/10 text-white rounded-full px-3 py-[5px] text-[.74rem] font-semibold">{compatibilityScore(MY_MENTEE_INDEX, mi)}% compatível</span>
            </div>
            <div className="mt-3"><Btn variant="soft" onClick={() => showToast('Plano da ronda guardado no dispositivo. Contagem local ativa.')}>Guardar plano (offline)</Btn></div>
          </Card>

          <Card>
            <b className="block mb-2">Quebra-gelos</b>
            <ol className="text-[.85rem] pl-[18px] mt-1 leading-[1.7]">
              <li>Como chegaste à tua área?</li>
              <li>Que erro evitarias no primeiro estágio?</li>
              <li>O que devo aprender já este ano?</li>
            </ol>
          </Card>

          <Card>
            <b>Queres continuar esta conversa?</b>
            <div className="flex gap-3 mt-3 flex-wrap">
              <Btn onClick={() => {
                setInterestByMentor(p => ({ ...p, [mi]: true }));
                if (MUTUAL_MATCHES.includes(mi)) connectWithMentor(mi, 'mutual');
                else showToast('Interesse guardado.');
              }} variant={interest === true ? 'primary' : 'soft'}>Quero continuar</Btn>
              <Btn variant="soft" onClick={() => { setInterestByMentor(p => ({ ...p, [mi]: false })); showToast('Ok, sem interesse.'); }}>Agora não</Btn>
              <Btn variant="soft" onClick={() => exchangeCode(mi)}>Trocar código</Btn>
            </div>
          </Card>
        </>
      );
    }

    const projectedQ = questions.find(q => q.projected);
    return (
      <>
        {announcements.length > 0 && <div className="bg-gradient-to-br from-primary-500 to-primary-400 text-white px-4 py-3 rounded-2xl mb-3.5 font-semibold text-[.88rem] shadow-md">{announcements[announcements.length-1]}</div>}
        <h2 className="text-[1.45rem] font-extrabold tracking-tight">Agora</h2>
        <p className="text-ink-muted text-[.85rem] mt-1 mb-4">{phaseLabel()}</p>
        {body}

        {projectedQ && (
          <Card variant="orange">
            <div className="text-[.76rem] font-bold text-primary-500 uppercase tracking-wide">Pergunta em destaque</div>
            <b className="block mt-1">{projectedQ.text}</b>
          </Card>
        )}

        <Card>
          <div className="flex items-center justify-between mb-3.5"><b>Perguntas ao orador</b></div>
          {questions.filter(q => q.status !== 'hidden').map((q, i) => (
            <div key={i} className="flex justify-between items-center mt-3 gap-2.5">
              <span className="text-[.85rem] flex-1">{q.status === 'answered' ? '✓ ' : ''}{q.text}</span>
              <Btn variant="soft" onClick={() => setQuestions(prev => prev.map((x, j) => j === i ? { ...x, votes: x.votes + 1 } : x))}>▲ {q.votes}</Btn>
            </div>
          ))}
          <QuestionInput onSubmit={text => { setQuestions(prev => [...prev, { text, votes: 1, mine: true, status: 'visible', projected: false }]); showToast('Pergunta enviada.'); }} />
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3.5"><b>Sondagem</b><span className="text-[.76rem] text-ink-muted">{pollOpen ? 'Aberta' : 'Fechada'}</span></div>
          {POLL_OPTIONS.map((opt, i) => {
            const pct = totalPollVotes ? Math.round((pollVotes[i] / totalPollVotes) * 100) : 0;
            return (
              <div key={opt} className="mt-3">
                <div className="flex justify-between text-[.85rem]"><span>{opt}</span><span className="text-ink-muted">{pct}%</span></div>
                <div className="mt-1.5"><ProgressBar value={pct} /></div>
                {votedOption < 0 && pollOpen && <div className="mt-2"><Btn variant="soft" onClick={() => { setPollVotes(prev => prev.map((v, j) => j === i ? v + 1 : v)); setVotedOption(i); showToast('Voto registado.'); }}>Votar</Btn></div>}
              </div>
            );
          })}
        </Card>

        <Card>
          <b>Inquérito final</b>
          {surveyDone ? <p className="text-[.85rem] text-success mt-1">Obrigado pelo teu contributo!</p> : <SurveyForm onSubmit={() => { setSurveyDone(true); showToast('Resposta registada.'); }} />}
        </Card>
      </>
    );
  };

  const renderMenteeMentors = () => (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Mentores</h2>
      <p className="text-ink-muted text-[.85rem] mt-1 mb-4">Marca até 5. Marcados: {wishedMentors.length}/5</p>
      {MENTORS.map((m, i) => {
        const w = wishedMentors.includes(i);
        return (
          <Card key={i}>
            <PersonRow name={m.name} subtitle={`${m.role}, ${m.company}`} extra={
              <Btn variant={w ? 'primary' : 'soft'} onClick={() => {
                if (w) setWishedMentors(prev => prev.filter(x => x !== i));
                else if (wishedMentors.length >= 5) showToast('Máximo de 5 mentores.');
                else setWishedMentors(prev => [...prev, i]);
              }}>{w ? 'Marcado' : 'Quero'}</Btn>
            } />
            <div className="flex gap-1.5 flex-wrap mt-2.5">
              <span className="bg-surface text-ink-muted border border-line rounded-full px-3 py-[5px] text-[.74rem] font-semibold">{m.area}</span>
              <span className="bg-surface text-ink-muted border border-line rounded-full px-3 py-[5px] text-[.74rem] font-semibold">{compatibilityScore(MY_MENTEE_INDEX, i)}% compatível</span>
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
      {metMentorIndices.length === 0 ? <Card><b>Ainda sem conversas.</b></Card> : metMentorIndices.map(mi => {
        const m = MENTORS[mi];
        const interest = interestByMentor[mi];
        return (
          <Card key={mi}>
            <PersonRow name={m.name} subtitle={`${m.role}, ${m.company}`} />
            <textarea rows="2" placeholder="Nota privada, só tu vês" value={privateNotes[mi] || ''} onChange={e => setPrivateNotes({...privateNotes, [mi]: e.target.value})} className="w-full mt-3 bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 focus:border-primary-500 focus:outline-none" />
            <div className="flex items-center gap-2.5 mt-3 flex-wrap">
              <Btn variant={interest === true ? 'primary' : 'soft'} onClick={() => { setInterestByMentor(p => ({ ...p, [mi]: true })); if (MUTUAL_MATCHES.includes(mi)) connectWithMentor(mi, 'mutual'); }}>Quero continuar</Btn>
              <Btn variant="soft" onClick={() => setInterestByMentor(p => ({ ...p, [mi]: false }))}>Agora não</Btn>
              <span className="text-[.85rem] text-ink-muted">{interest === true ? (MUTUAL_MATCHES.includes(mi) ? 'Interesse mútuo' : 'À espera do mentor') : ''}</span>
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
      {connections.length === 0 ? <Card><b>Sem conexões ainda.</b></Card> : connections.map(c => {
        const m = MENTORS[c.mentorIndex];
        const req = mentorshipRequests.find(r => r.mentorIndex === c.mentorIndex && r.menteeIndex === MY_MENTEE_INDEX);
        const thread = messages.filter(x => x.connectionKey === `me-${c.mentorIndex}`);
        return (
          <Card key={c.mentorIndex}>
            <PersonRow name={m.name} subtitle={m.role} />
            <p className="text-[.85rem] mt-3 mb-2.5">+258 84 000 00{c.mentorIndex}0 · {getFirstName(m.name).toLowerCase()}@exemplo.co.mz</p>
            <div className="flex flex-wrap gap-2 items-center">
              {req ? (
                <span className={`text-[.72rem] font-bold px-3 py-1 rounded-full ${req.status === 'accepted' ? 'bg-success/15 text-success' : 'bg-surface2 text-ink-muted'}`}>
                  {{pending:'Pedido enviado', accepted:'Mentoria ativa', declined:'Pedido recusado'}[req.status]}
                </span>
              ) : (
                <Btn onClick={() => { setMentorshipRequests(prev => [...prev, { mentorIndex: c.mentorIndex, menteeIndex: MY_MENTEE_INDEX, status: 'pending', message: 'Olá, gostava de ter o teu apoio como mentor.' }]); showToast('Pedido enviado.'); }}>Pedir mentoria</Btn>
              )}
              <Btn variant="soft" onClick={() => setChatOpen(chatOpen === c.mentorIndex ? null : c.mentorIndex)}>Mensagens ({thread.length})</Btn>
              <span className="text-[.72rem] text-ink-muted">origem: {c.origin}</span>
            </div>
            {chatOpen === c.mentorIndex && (
              <div className="mt-3 border-t border-line pt-3">
                {thread.map((msg, i) => (
                  <div key={i} className={`text-[.85rem] mb-2 ${msg.from === 'me' ? 'text-right' : ''}`}>
                    <span className="inline-block bg-surface border border-line rounded-xl px-3 py-2">{msg.body}</span>
                    <div className="text-[.7rem] text-ink-muted mt-1">{msg.at} · {msg.read ? 'lida' : 'não lida'}</div>
                  </div>
                ))}
                <MessageInput onSend={body => { setMessages(prev => [...prev, { connectionKey: `me-${c.mentorIndex}`, from: 'me', body, read: true, at: 'agora' }]); }} />
              </div>
            )}
          </Card>
        );
      })}
    </>
  );

  // ─────────────────────────────────────────────
  // MENTOR SCREENS
  // ─────────────────────────────────────────────
  const renderMentorHome = () => {
    const me = MENTORS[MY_MENTOR_INDEX];
    const accepted = mentorshipRequests.filter(r => r.mentorIndex === MY_MENTOR_INDEX && r.status === 'accepted').length;
    if (mentorApproval === 'pending') {
      return (
        <>
          <h2 className="text-[1.45rem] font-extrabold tracking-tight">Olá, {getFirstName(me.name)}.</h2>
          <Card variant="orange"><b>A aguardar aprovação</b><p className="text-[.85rem] mt-1">A equipa organizadora vai validar o teu perfil. Ainda não apareces nas rondas.</p></Card>
        </>
      );
    }
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
          <div className="flex items-center justify-between mb-3.5"><b>Mentorados aceites</b><span className="text-[.76rem] text-ink-muted">{accepted} de {me.maxMentees}</span></div>
          <ProgressBar value={(accepted / me.maxMentees) * 100} />
        </Card>
        <Card><b>Marcado por mentorados</b><p className="text-[.85rem] text-ink-muted mt-1">3 pessoas marcaram-te "quero conhecer". Os nomes aparecem no evento.</p></Card>
      </>
    );
  };

  const renderMentorLive = () => {
    if (mentorApproval === 'pending') return <Card variant="orange"><b>Perfil pendente.</b> Ainda não entras nas rondas.</Card>;
    if (currentRound === 0 || currentRound > 4) {
      return (<><h2 className="text-[1.45rem] font-extrabold tracking-tight">A minha mesa</h2><p className="text-ink-muted text-[.85rem] mt-1 mb-4">{phaseLabel()}</p><Card variant="navy"><h3 className="text-[1.08rem] font-extrabold">{currentRound === 0 ? 'À espera do intervalo' : 'Intervalo concluído'}</h3></Card></>);
    }
    const mi = menteeForRound(MY_MENTOR_INDEX);
    const m = MENTEES[mi];
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
            <div className="inline-grid place-items-center w-16 h-16 rounded-[18px] bg-primary-500 text-white text-[1.8rem] font-extrabold shrink-0">{MY_MENTOR_INDEX + 1}</div>
            <div><p className="text-[.76rem] text-navy-100">Mesa</p><h3 className="text-[1.08rem] font-extrabold">1 mentorado</h3></div>
          </div>
        </Card>
        <Card>
          <PersonRow name={m.name} subtitle={m.course} />
          <p className="text-[.85rem] mt-3"><b>Objetivo:</b> {m.goal}</p>
          <p className="text-[.85rem] mt-1"><b>Pitch:</b> {m.pitch}</p>
        </Card>
        <Card>
          <b className="block mb-2">3 perguntas para fazer</b>
          <ol className="text-[.85rem] pl-[18px] mt-1 leading-[1.7]"><li>O que já tentaste até agora?</li><li>Que obstáculo te trava mais?</li><li>Como posso ajudar já esta semana?</li></ol>
        </Card>
        <Card>
          <b>Queres continuar com {getFirstName(m.name)}?</b>
          <div className="flex gap-3 mt-3 flex-wrap">
            <Btn onClick={() => { if (MUTUAL_MATCHES.includes(MY_MENTOR_INDEX)) connectWithMentor(MY_MENTOR_INDEX, 'mutual'); showToast('Interesse guardado.'); }}>Quero continuar</Btn>
            <Btn variant="soft" onClick={() => showToast('Ok.')}>Agora não</Btn>
            <Btn variant="soft" onClick={() => exchangeCode(MY_MENTOR_INDEX)}>Trocar código</Btn>
          </div>
        </Card>
      </>
    );
  };

  const renderMentorRequests = () => {
    const me = MENTORS[MY_MENTOR_INDEX];
    const my = mentorshipRequests.filter(r => r.mentorIndex === MY_MENTOR_INDEX);
    const accepted = my.filter(r => r.status === 'accepted').length;
    return (
      <>
        <h2 className="text-[1.45rem] font-extrabold tracking-tight">Pedidos de mentoria</h2>
        <p className="text-ink-muted text-[.85rem] mt-1 mb-4">Aceites: {accepted} de {me.maxMentees}. Ao atingir o limite, "Aceitar" fica desativado.</p>
        {my.length === 0 ? <Card><b>Sem pedidos.</b></Card> : my.map(r => (
          <Card key={r.menteeIndex}>
            <PersonRow name={MENTEES[r.menteeIndex].name} subtitle={MENTEES[r.menteeIndex].course} />
            <p className="text-[.85rem] mt-3 mb-2.5">"{r.message}"</p>
            {r.status === 'pending' ? (
              <div className="flex gap-2.5">
                <Btn disabled={accepted >= me.maxMentees} onClick={() => { setMentorshipRequests(prev => prev.map(x => x === r ? { ...x, status: 'accepted' } : x)); showToast('Mentoria aceite.'); }}>Aceitar</Btn>
                <Btn variant="soft" onClick={() => { setMentorshipRequests(prev => prev.map(x => x === r ? { ...x, status: 'declined' } : x)); showToast('Pedido recusado.'); }}>Recusar</Btn>
              </div>
            ) : <span className={`text-[.72rem] font-bold px-3 py-1 rounded-full ${r.status === 'accepted' ? 'bg-success/15 text-success' : 'bg-surface2 text-ink-muted'}`}>{r.status === 'accepted' ? 'Aceite' : 'Recusado'}</span>}
          </Card>
        ))}
      </>
    );
  };

  const renderMentorConnections = () => {
    const idxs = [...new Set(mentorshipRequests.filter(r => r.mentorIndex === MY_MENTOR_INDEX).map(r => r.menteeIndex))];
    return (
      <>
        <h2 className="text-[1.45rem] font-extrabold tracking-tight">Conexões</h2>
        <p className="text-ink-muted text-[.85rem] mt-1 mb-4">Contactos visíveis só entre conectados.</p>
        {idxs.length === 0 ? <Card><b>Sem conexões ainda.</b></Card> : idxs.map(i => (
          <Card key={i}><PersonRow name={MENTEES[i].name} subtitle={MENTEES[i].course} /><p className="text-[.85rem] mt-3">+258 84 100 00{i}0</p></Card>
        ))}
      </>
    );
  };

  // ─────────────────────────────────────────────
  // SHARED PROFILE
  // ─────────────────────────────────────────────
  const renderProfile = (asRole) => {
    const person = asRole === 'mentor' ? MENTORS[MY_MENTOR_INDEX] : MENTEES[MY_MENTEE_INDEX];
    const subtitle = asRole === 'mentor' ? `${person.role}, ${person.company}` : person.course;
    const label = asRole === 'mentor' ? 'Áreas em que ajudas' : 'Pitch (120 caracteres)';
    const val = asRole === 'mentor' ? person.area : person.pitch;
    return (
      <>
        <h2 className="text-[1.45rem] font-extrabold tracking-tight">Perfil</h2>
        <Card className="mt-4">
          <PersonRow name={person.name} subtitle={subtitle} />
          <label className="block text-[.85rem] font-semibold mt-4 mb-1.5">{label}</label>
          <input defaultValue={val} maxLength={120} className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 focus:border-primary-500 focus:outline-none" />
          <div className="mt-3.5"><Btn onClick={() => showToast('Alterações guardadas. Valem a partir da próxima ronda.')}>Guardar</Btn></div>
        </Card>
        <Btn variant="soft" full onClick={() => { setRole(null); window.scrollTo(0,0); }}>Sair</Btn>
      </>
    );
  };

  // ─────────────────────────────────────────────
  // ORGANIZER
  // ─────────────────────────────────────────────
  const renderOrganizerLive = () => (
    <>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 mb-3.5">
        <Card variant="navy">
          <div className="text-[.76rem] font-bold text-primary-300 uppercase tracking-wide">Fase</div>
          <h3 className="mt-1 text-[1.08rem] font-extrabold">{phaseLabel()}</h3>
          <div className="font-extrabold text-[2.8rem] mt-3 tracking-tight tabular-nums">{formatTime(secondsLeft)}</div>
        </Card>
        <Card>
          <b className="block mb-2">Controlo</b>
          <div className="flex flex-wrap gap-2.5 mt-2">
            <Btn onClick={() => currentRound >= 5 ? restartSimulation() : advanceRound()}>
              {currentRound === 0 ? 'Iniciar intervalo 1' : currentRound < 4 ? `Avançar ronda ${currentRound + 1}` : currentRound === 4 ? 'Terminar intervalo' : 'Reiniciar'}
            </Btn>
            <Btn variant="soft" disabled={currentRound < 1 || currentRound > 4} onClick={() => { setIsPaused(p => !p); showToast(!isPaused ? 'Ronda em pausa.' : 'Ronda retomada.'); }}>{isPaused ? 'Retomar' : 'Pausar'}</Btn>
          </div>
          <label className="flex gap-2.5 items-center text-[.85rem] mt-4">
            <input type="checkbox" checked={isRehearsal} onChange={e => { setIsRehearsal(e.target.checked); setSecondsLeft(e.target.checked ? 30 : 300); }} className="w-auto accent-primary-500" />
            Modo ensaio (30 s)
          </label>
        </Card>
      </div>
      <Card>
        <div className="flex items-center justify-between mb-3.5"><b>Pares da ronda</b></div>
        <table className="w-full text-[.88rem] border-collapse">
          <thead><tr>{['Mesa','Mentor','Mentorado','Compat.'].map(h => <th key={h} className="text-left text-[.76rem] uppercase tracking-wide text-ink-muted font-semibold py-[11px] px-2 border-b border-line">{h}</th>)}</tr></thead>
          <tbody>
            {MENTORS.map((m, mi) => {
              const mei = menteeForRound(mi);
              return (<tr key={mi} className="border-b border-line last:border-0"><td className="py-[11px] px-2"><b>{mi+1}</b></td><td className="py-[11px] px-2">{m.name}</td><td className="py-[11px] px-2">{mei == null ? '–' : MENTEES[mei].name}</td><td className="py-[11px] px-2">{mei == null ? '–' : `${compatibilityScore(mei, mi)}%`}</td></tr>);
            })}
          </tbody>
        </table>
        <p className="text-[.85rem] text-ink-muted mt-3">Rácio 1:1 neste ensaio. Alerta acima de 1:3.</p>
      </Card>
    </>
  );

  const renderOrganizerReg = () => {
    const rows = [...MENTEES.map((m, i) => ({ id: `e${i}`, name: m.name, type: 'Mentorado' })), ...MENTORS.map((m, i) => ({ id: `m${i}`, name: m.name, type: 'Mentor' }))];
    return (
      <>
        <Card>
          <div className="flex justify-between items-center"><b>Pendentes de aprovação ({pendingApprovalList.length})</b></div>
          {pendingApprovalList.length === 0 ? <p className="text-[.85rem] text-success mt-2">Sem pendentes.</p> : pendingApprovalList.map((p, i) => (
            <div key={i} className="flex justify-between items-center mt-3 gap-2">
              <PersonRow name={p.name} subtitle={`${p.role} · ${p.area}`} />
              <Btn onClick={() => { setPendingApprovalList(prev => prev.filter((_, j) => j !== i)); showToast('Mentor aprovado. E-mail + WhatsApp enviados.'); }}>Aprovar</Btn>
            </div>
          ))}
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-3.5">
            <b>Check-in ({Object.keys(checkins).length}/{rows.length})</b>
            <div className="flex gap-2">
              <Btn variant="soft" onClick={() => showToast('Leitor de QR aberto (simulado).')}>Ler QR</Btn>
              <Btn variant="soft" onClick={() => { setCheckins(prev => ({ ...prev, [`w${Date.now()}`]: 1 })); showToast('Walk-in registado.'); }}>+ Walk-in</Btn>
            </div>
          </div>
          <table className="w-full text-[.88rem] border-collapse mt-1">
            <tbody>{rows.map(r => (
              <tr key={r.id} className="border-b border-line last:border-0">
                <td className="py-[11px] px-2">{r.name}</td>
                <td className="py-[11px] px-2 text-ink-muted text-[.85rem]">{r.type}</td>
                <td className="py-[11px] px-2 text-right"><Btn variant={checkins[r.id] ? 'soft' : 'primary'} onClick={() => setCheckins(prev => { const n = { ...prev }; if (n[r.id]) delete n[r.id]; else n[r.id] = 1; return n; })}>{checkins[r.id] ? 'Presente ✓' : 'Check-in'}</Btn></td>
              </tr>
            ))}</tbody>
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
          <AnnouncementInput onSubmit={text => { setAnnouncements(prev => [...prev, text]); showToast('Anúncio enviado a todos.'); }} />
        </Card>
        <Card>
          <b>Moderação de perguntas</b>
          {questions.map((q, i) => (
            <div key={i} className="flex justify-between items-center text-[.85rem] mt-2.5 gap-2">
              <span className="flex-1">{q.status === 'hidden' ? '🚫 ' : ''}{q.status === 'answered' ? '✓ ' : ''}▲ {q.votes} · {q.text}</span>
              <div className="flex gap-1">
                <Btn variant="soft" onClick={() => setQuestions(prev => prev.map((x, j) => j === i ? { ...x, status: x.status === 'hidden' ? 'visible' : 'hidden' } : x))}>{q.status === 'hidden' ? 'Mostrar' : 'Ocultar'}</Btn>
                <Btn variant="soft" onClick={() => setQuestions(prev => prev.map((x, j) => j === i ? { ...x, status: 'answered' } : x))}>Responder</Btn>
                <Btn variant="soft" onClick={() => setQuestions(prev => prev.map((x, j) => j === i ? { ...x, projected: !x.projected } : { ...x, projected: false }))}>Projetar</Btn>
              </div>
            </div>
          ))}
        </Card>
      </div>
      <Card>
        <div className="flex items-center justify-between mb-3.5"><b>Sondagem ao vivo</b><Btn variant="soft" onClick={() => { setPollOpen(!pollOpen); showToast(pollOpen ? 'Sondagem fechada.' : 'Sondagem aberta.'); }}>{pollOpen ? 'Fechar' : 'Abrir'}</Btn></div>
        {POLL_OPTIONS.map((o, i) => (
          <div key={o} className="flex justify-between items-center text-[.85rem] mt-2.5 gap-2.5">
            <span className="min-w-[120px]">{o}</span>
            <div className="flex-1"><ProgressBar value={(pollVotes[i] / totalPollVotes) * 100} /></div>
            <b>{pollVotes[i]}</b>
          </div>
        ))}
      </Card>
    </>
  );

  const renderOrganizerConfig = () => (
    <>
      <Card>
        <b className="block mb-3">Evento</b>
        {[['Nome','name'],['Local','venue'],['Capacidade','capacity'],['Mesas','tablesCount']].map(([l,k]) => (
          <div key={k} className="mb-2">
            <label className="block text-[.82rem] font-semibold mb-1">{l}</label>
            <input value={config[k]} onChange={e => setConfig({...config, [k]: k === 'capacity' || k === 'tablesCount' ? +e.target.value : e.target.value})} className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 focus:border-primary-500 focus:outline-none" />
          </div>
        ))}
        <div className="grid grid-cols-3 gap-2 mt-2">
          {[['roundMinutes','Duração ronda (min)'],['roundsPerBreak','Rondas/intervalo'],['warnSeconds','Aviso (s)']].map(([k,l]) => (
            <div key={k}><label className="block text-[.78rem] font-semibold mb-1">{l}</label><input type="number" value={config[k]} onChange={e => setConfig({...config, [k]: +e.target.value})} className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-2 py-2 focus:border-primary-500 focus:outline-none" /></div>
          ))}
        </div>
        <div className="mt-3"><Btn onClick={() => showToast('Configuração guardada.')}>Guardar</Btn></div>
      </Card>
      <Card>
        <b className="block mb-3">Pesos do matching</b>
        {Object.entries(config.matchWeights).map(([k,v]) => (
          <div key={k} className="flex justify-between items-center text-[.85rem] mt-2">
            <span className="capitalize">{k}</span>
            <input type="number" value={v} onChange={e => setConfig({...config, matchWeights: { ...config.matchWeights, [k]: +e.target.value }})} className="w-20 text-base bg-surface border-2 border-line rounded-[10px] px-2 py-1 focus:border-primary-500 focus:outline-none" />
          </div>
        ))}
      </Card>
      <Card>
        <b className="block mb-3">Orçamento / notas</b>
        <p className="text-[.85rem] text-ink-muted">WhatsApp Business e SMS: modelos aprovados pela Meta. SPF/DKIM/DMARC configurados no domínio.</p>
      </Card>
    </>
  );

  const renderOrganizerReports = () => {
    const conversations = (furthestRoundCompleted || 0) * 6;
    const kpis = [
      { l: 'Inscritos', v: '38 / 120' },
      { l: 'Presença', v: `${Math.round((Object.keys(checkins).length / 12) * 100)}%` },
      { l: 'Conversas', v: `${conversations} (meta 8)` },
      { l: 'Interesse mútuo', v: conversations ? `${Math.round(Math.min(40, 30 + connections.length * 2))}%` : '0%' },
      { l: 'Mentorias ativas', v: mentorshipRequests.filter(r => r.status === 'accepted').length },
      { l: 'Satisfação', v: '4,6 / 5' },
      { l: 'NPS', v: '42' },
      { l: 'Conexões ativas aos 30 dias', v: '— (F3)' },
    ];
    return (
      <>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
          {kpis.map(k => <Card key={k.l}><span className="text-ink-muted text-[.85rem]">{k.l}</span><b className="block text-[1.7rem] font-extrabold leading-none tracking-tight mt-1">{k.v}</b></Card>)}
        </div>
        <Card>
          <b>Oferta e procura por área</b>
          {[{ a: 'Tecnologia e TI', s: 70, d: 30 },{ a: 'Finanças e Banca', s: 45, d: 40 },{ a: 'Direito', s: 20, d: 25 },{ a: 'Agricultura', s: 15, d: 10 }].map(r => (
            <div key={r.a} className="flex justify-between items-center text-[.85rem] mt-3 gap-2.5">
              <span className="min-w-[110px]">{r.a}</span>
              <div className="flex-1"><ProgressBar value={r.s} /></div>
              <span className="text-[.76rem] text-ink-muted whitespace-nowrap">{r.s}% · {r.d}%</span>
            </div>
          ))}
          <div className="flex flex-wrap gap-2.5 mt-4">
            <Btn variant="soft" onClick={() => showToast('Exportação CSV simulada.')}>Exportar CSV</Btn>
            <Btn variant="soft" onClick={() => showToast('Plano em PDF simulado.')}>Plano em PDF</Btn>
          </div>
        </Card>
      </>
    );
  };

  const renderOrganizer = () => {
    const tabs = ORGANIZER_TABS.find(t => t.key === activeTab) ? activeTab : 'live';
    const views = { live: renderOrganizerLive, reg: renderOrganizerReg, int: renderOrganizerInteraction, cfg: renderOrganizerConfig, rep: renderOrganizerReports };
    return (
      <div className="max-w-[1040px] mx-auto pt-[18px] px-4 pb-10">
        <div className="flex justify-between items-center mb-3.5">
          <div className="font-extrabold text-[1.35rem] italic tracking-tight leading-none">Career<i className="text-primary-500 not-italic">Connect</i> <span className="text-ink-muted text-[.85rem] not-italic font-semibold">· Painel</span></div>
          <Btn variant="soft" onClick={() => { setRole(null); window.scrollTo(0,0); }}>Sair</Btn>
        </div>
        {announcements.length > 0 && <div className="bg-gradient-to-br from-primary-500 to-primary-400 text-white px-4 py-3 rounded-2xl mb-3.5 font-semibold text-[.88rem] shadow-md">{announcements[announcements.length-1]}</div>}
        <div className="flex gap-1 bg-surface-soft p-1 rounded-full mb-5 overflow-x-auto">
          {ORGANIZER_TABS.map(t => <button key={t.key} onClick={() => setActiveTab(t.key)} className={`rounded-full px-[18px] py-2.5 font-semibold text-[.85rem] whitespace-nowrap transition ${tabs === t.key ? 'bg-navy-800 text-white' : 'text-ink-muted'}`}>{t.label}</button>)}
        </div>
        {views[tabs]()}
      </div>
    );
  };

  // ─────────────────────────────────────────────
  // TV / PROJECTOR
  // ─────────────────────────────────────────────
  const [tvCode, setTvCode] = useState('');
  const renderTv = () => {
    if (tvCode !== EVENT.tvCode) {
      return (
        <div className="min-h-screen grid place-items-center bg-navy-900 text-white p-6">
          <Card variant="navy" className="max-w-sm w-full">
            <b className="block mb-3">Código do evento</b>
            <input placeholder="CC-TV-2026" value={tvCode} onChange={e => setTvCode(e.target.value)} className="w-full text-base bg-white/10 text-white border-2 border-white/20 rounded-[14px] px-3.5 py-3 focus:border-primary-500 focus:outline-none" />
            <div className="mt-3"><Btn onClick={() => { if (tvCode !== EVENT.tvCode) showToast('Código inválido. Usa CC-TV-2026.'); }}>Entrar</Btn></div>
          </Card>
        </div>
      );
    }
    const conversations = (furthestRoundCompleted || 0) * 6;
    const projectedQ = questions.find(q => q.projected);
    return (
      <div className="bg-navy-900 text-white min-h-screen pt-[calc(env(safe-area-inset-top,0px)+34px)] px-[5vw] pb-[34px]" style={{ background: 'radial-gradient(circle at 30% 10%, #172554 0%, #0b1126 70%)' }}>
        <div className="flex justify-between items-center">
          <span className="font-extrabold text-[1.35rem] italic tracking-tight leading-none">Career<i className="text-primary-500 not-italic">Connect</i></span>
          <Btn variant="soft" onClick={() => { setRole(null); setTvCode(''); }}>Sair</Btn>
        </div>
        {announcements.length > 0 && <div className="bg-gradient-to-br from-primary-500 to-primary-400 text-white px-4 py-3 rounded-2xl mt-5 font-semibold text-[1.2rem] shadow-md">{announcements[announcements.length-1]}</div>}
        <p className="mt-[30px] text-[1.3rem] text-navy-100">{phaseLabel()}</p>
        {currentRound >= 1 && currentRound <= 4 ? (
          <>
            <div className="font-extrabold text-[clamp(4.5rem,16vw,11rem)] text-primary-500 leading-none" style={{ textShadow: '0 10px 40px rgba(242,107,15,.4)' }}>{formatTime(secondsLeft)}</div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5 mt-[30px]">
              {MENTORS.map((m, mi) => {
                const mei = menteeForRound(mi);
                return <div key={mi} className="bg-white/[.06] border border-white/[.08] rounded-[22px] p-5 backdrop-blur-md"><span className="text-[.76rem] font-bold text-primary-300 uppercase tracking-wide">Mesa {mi+1}</span><b className="block text-[1.1rem] mt-1.5">{m.name}</b><p className="text-navy-100 mt-1">{mei == null ? '–' : MENTEES[mei].name}</p></div>;
              })}
            </div>
          </>
        ) : (
          <>
            <div className="font-extrabold text-primary-500 leading-none" style={{ fontSize: 'clamp(2.8rem,9vw,5.5rem)', textShadow: '0 10px 40px rgba(242,107,15,.4)' }}>{currentRound === 0 ? 'A seguir: intervalo de ligações' : 'Obrigado!'}</div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5 mt-[30px]">
              <div className="bg-white/[.06] border border-white/[.08] rounded-[22px] p-5 backdrop-blur-md"><b className="text-[2rem] text-primary-500 block">{conversations}</b><p className="text-navy-100">conversas hoje</p></div>
              <div className="bg-white/[.06] border border-white/[.08] rounded-[22px] p-5 backdrop-blur-md"><b className="text-[2rem] text-primary-500 block">{connections.length}</b><p className="text-navy-100">conexões</p></div>
            </div>
          </>
        )}
        {projectedQ && <div className="mt-6 bg-white/[.06] border border-primary-500/40 rounded-[22px] p-5"><span className="text-[.8rem] font-bold text-primary-300 uppercase tracking-wide">Pergunta em destaque</span><b className="block text-[1.4rem] mt-2">{projectedQ.text}</b></div>}
        {pollOpen && <div className="mt-6 bg-white/[.06] border border-white/[.08] rounded-[22px] p-5"><b className="block mb-2">Sondagem</b>{POLL_OPTIONS.map((o, i) => <div key={o} className="flex justify-between text-[1rem] mt-2"><span>{o}</span><b>{Math.round((pollVotes[i] / totalPollVotes) * 100)}%</b></div>)}</div>}
      </div>
    );
  };

  // ─────────────────────────────────────────────
  // ROUTER
  // ─────────────────────────────────────────────
  const renderMenteeContent = () => {
    const t = NAV_MENTEE.find(x => x.key === activeTab) ? activeTab : 'home';
    return { home: renderMenteeHome, live: renderMenteeLive, mentors: renderMenteeMentors, met: renderMenteeMet, conn: renderMenteeConnections, profile: () => renderProfile('mentee') }[t]();
  };
  const renderMentorContent = () => {
    const t = NAV_MENTOR.find(x => x.key === activeTab) ? activeTab : 'home';
    return { home: renderMentorHome, live: renderMentorLive, req: renderMentorRequests, conn: renderMentorConnections, profile: () => renderProfile('mentor') }[t]();
  };

  const renderNav = (items) => (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-xl border-t border-line flex justify-center pb-[env(safe-area-inset-bottom,0px)] z-[25]">
      <div className="flex w-full max-w-[480px]">
        {items.map(item => (
          <button key={item.key} onClick={() => { setActiveTab(item.key); window.scrollTo(0,0); }} className={`flex-1 flex flex-col items-center justify-center gap-[3px] py-[10px] pb-[9px] min-h-[56px] text-[.68rem] font-semibold transition ${activeTab === item.key ? 'text-primary-500' : 'text-ink-muted'}`}>
            <span className={`text-[1.2rem] leading-none transition ${activeTab === item.key ? 'opacity-100 -translate-y-px' : 'opacity-55'}`}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );

  let content = null;
  if (!role) content = renderLogin();
  else if (role === 'tv') content = renderTv();
  else if (role === 'org') content = renderOrganizer();
  else if (role === 'visitor') {
    if (visitorPage === 'mentee') content = renderLandingMentee();
    else if (visitorPage === 'mentor') content = renderLandingMentor();
    else if (visitorPage === 'register') content = renderRegister(false);
    else content = renderRegister(true);
  } else if (role === 'mentee') {
    content = (<><div className="max-w-[480px] mx-auto pt-[18px] px-4 pb-[calc(112px+env(safe-area-inset-bottom,0px))]">{renderMenteeContent()}</div>{renderNav(NAV_MENTEE)}</>);
  } else if (role === 'mentor') {
    content = (<><div className="max-w-[480px] mx-auto pt-[18px] px-4 pb-[calc(112px+env(safe-area-inset-bottom,0px))]">{renderMentorContent()}</div>{renderNav(NAV_MENTOR)}</>);
  }

  return (
    <div className="min-h-screen bg-surface text-ink font-sans antialiased pb-[env(safe-area-inset-bottom,0px)]">
      {role && (
        <div className="sticky top-0 z-30 flex gap-1.5 items-center overflow-x-auto bg-navy-900 text-white px-3.5 pt-[calc(env(safe-area-inset-top,0px)+8px)] pb-2 text-[.78rem]">
          <b className="mr-auto font-bold tracking-wide whitespace-nowrap opacity-85 text-[.74rem] uppercase">Simulação</b>
          {[{key:'visitor',label:'Visitante'},{key:'mentee',label:'Mentorado'},{key:'mentor',label:'Mentor'},{key:'org',label:'Organizador'},{key:'tv',label:'Ecrã'}].map(a => (
            <button key={a.key} onClick={() => { setRole(a.key); setActiveTab(a.key === 'org' ? 'live' : 'home'); if (a.key === 'visitor') setVisitorPage('mentee'); if (a.key === 'mentor') setMentorApproval('approved'); window.scrollTo(0,0); }} className={`rounded-full px-3.5 py-[7px] font-semibold text-[.78rem] min-h-[34px] whitespace-nowrap transition ${role === a.key ? 'bg-primary-500 text-white' : 'bg-white/10 text-white'}`}>{a.label}</button>
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
  const [v, setV] = useState('');
  return (
    <div className="flex gap-2 mt-3.5">
      <input value={v} onChange={e => setV(e.target.value)} maxLength={200} placeholder="A tua pergunta (máx. 200)" className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 focus:border-primary-500 focus:outline-none" />
      <Btn onClick={() => { const t = v.trim(); if (!t) return; onSubmit(t); setV(''); }}>Enviar</Btn>
    </div>
  );
}

function AnnouncementInput({ onSubmit }) {
  const [v, setV] = useState('');
  return (
    <>
      <input value={v} onChange={e => setV(e.target.value)} placeholder="Ex.: Masterclass 2 começa na sala B" className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 focus:border-primary-500 focus:outline-none mt-3 mb-3" />
      <Btn onClick={() => { const t = v.trim(); if (!t) return; onSubmit(t); setV(''); }}>Enviar anúncio</Btn>
    </>
  );
}

function MessageInput({ onSend }) {
  const [v, setV] = useState('');
  return (
    <div className="flex gap-2 mt-2">
      <input value={v} onChange={e => setV(e.target.value)} placeholder="Escrever mensagem…" className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-2.5 focus:border-primary-500 focus:outline-none" />
      <Btn onClick={() => { const t = v.trim(); if (!t) return; onSend(t); setV(''); }}>Enviar</Btn>
    </div>
  );
}

function NextStepForm({ onSave }) {
  const [text, setText] = useState('');
  const [due, setDue] = useState('');
  return (
    <div className="mt-2">
      <input value={text} onChange={e => setText(e.target.value)} placeholder="Ex.: Marcar café com a Sara" className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 mb-2 focus:border-primary-500 focus:outline-none" />
      <input type="date" value={due} onChange={e => setDue(e.target.value)} className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 mb-2 focus:border-primary-500 focus:outline-none" />
      <Btn onClick={() => { if (!text || !due) return; onSave({ text, due }); }}>Guardar compromisso</Btn>
    </div>
  );
}

function SurveyForm({ onSubmit }) {
  const [rating, setRating] = useState(0);
  const [nps, setNps] = useState(-1);
  const [comment, setComment] = useState('');
  return (
    <div className="mt-2">
      <label className="block text-[.82rem] font-semibold mb-1">Nota (1–5)</label>
      <div className="flex gap-1.5 mb-3">{[1,2,3,4,5].map(n => <button key={n} onClick={() => setRating(n)} className={`w-9 h-9 rounded-full font-bold ${rating === n ? 'bg-primary-500 text-white' : 'bg-surface2 text-ink'}`}>{n}</button>)}</div>
      <label className="block text-[.82rem] font-semibold mb-1">Recomendarias a um amigo? (0–10)</label>
      <div className="flex gap-1 flex-wrap mb-3">{[...Array(11)].map((_, n) => <button key={n} onClick={() => setNps(n)} className={`w-8 h-8 rounded-full font-bold text-[.8rem] ${nps === n ? 'bg-primary-500 text-white' : 'bg-surface2 text-ink'}`}>{n}</button>)}</div>
      <textarea value={comment} onChange={e => setComment(e.target.value)} rows="2" placeholder="Comentário (opcional)" className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 mb-2 focus:border-primary-500 focus:outline-none" />
      <Btn onClick={() => { if (!rating || nps < 0) return; onSubmit({ rating, nps, comment }); }}>Enviar inquérito</Btn>
    </div>
  );
}