import React, { useState, useEffect, useRef } from 'react';

// --- Data & Constants ---
const IMAGES = [
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrYw6bc7fuDJ-FAgnkm-RS0ETK-NMqkYbKm_V2QG_nyw&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPvYbVOh_TvSjwqlEopCLHMMobZVVhnhhUyyGx_rnpiQ&s=10',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsSb8b0IwOdRxcEHc3sY-kSquLS3hfBY3dllYwuIXCtuKq8nBCCQh27D87&s=10'
];

const BIOGRAPHIES = [
  { biography: "Mestre em Psicologia e Pedagogia, com experiência em consultoria estratégica, gestão de recursos humanos e desenvolvimento organizacional. É autor de “RH com H de Humano” e de “Para uma Gestão de Pessoas Humanizada”.", works: "Obras: Viagem, pelos trilhos da vida · Avaliação de Desempenho Automatizada, Guia Prático · Para uma Gestão de Pessoas Humanizada · Poemas para Boi Dormir · Ensaio sobre um Manifesto · RH com H de Humano" },
  { biography: "Formado em Comunicação e Relações Empresariais pelo ISCIM, é orador, formador, escritor e consultor. É autor de “Oratória: O Oxigénio das Relações de Influência”." },
  { biography: "Licenciada em Ciências Políticas pela Universidade Eduardo Mondlane (UEM), construiu a sua carreira na Vale Moçambique e na Galp Moçambique. É fundadora da Salto Moçambique, dedicada à formação e à mentoria." }
];

const MASTERCLASSES = [
  { id: 0, initials: 'VS', name: 'Vicente Sitoe', role: 'Director Geral da SDO Moçambique', theme: 'Acesso ao mercado', title: 'Estratégias para encontrar o primeiro emprego', topics: [['Preparar-se', 'Desenvolver competências técnicas e comportamentais e aprofundar o autoconhecimento.'], ['Procurar emprego', 'Utilizar plataformas de emprego, redes de contactos e preparar um currículo competitivo.'], ['Destacar-se', 'Preparar-se para entrevistas e comunicar as suas competências com confiança.']], question: 'Qual é o teu maior obstáculo na procura do primeiro emprego?' },
  { id: 1, initials: 'AC', name: 'Arafat Cossa', role: 'Director da Arafat Executive Academy', theme: 'Competências e posicionamento', title: 'A arte de criar redes de contactos e transformar ligações em oportunidades', topics: [['Rede estratégica', 'Criar relações genuínas, assentes na confiança e na partilha de valor.'], ['Comunicação e marca pessoal', 'Apresentar-se e comunicar o seu valor com confiança.'], ['Ligações que geram oportunidades', 'Utilizar o LinkedIn, procurar mentoria e aproximar-se do mercado de trabalho.']], question: 'O que gostavas de saber dizer sobre ti em 30 segundos?' },
  { id: 2, initials: 'MC', name: 'Marlena Chambule', role: 'Directora Executiva da Salto Moçambique', theme: 'Integração e crescimento', title: 'Fui contratado. E agora? Como construir uma carreira de sucesso', topics: [['Adaptação', 'Compreender a cultura organizacional e integrar-se nas equipas.'], ['Postura e desempenho', 'Agir com ética, pontualidade e proactividade.'], ['Carreira sustentável', 'Definir objectivos, apostar na aprendizagem contínua e construir uma boa reputação.']], question: 'Que dúvida tens sobre os primeiros meses num emprego?' }
];

// --- Helper Functions ---
const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

function hashString(inputString) {
  let hashValue = 2166136261;
  for (const character of inputString) {
    hashValue ^= character.charCodeAt(0);
    hashValue = Math.imul(hashValue, 16777619);
  }
  return hashValue >>> 0;
}

function generateQrCode(seed) {
  let hashValue = hashString(seed);
  let output = '';
  const gridSize = 11;
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const isFinderPattern = (x < 3 && y < 3) || (x > 7 && y < 3) || (x < 3 && y > 7);
      hashValue = Math.imul(hashValue ^ (hashValue >>> 13), 1274126177) >>> 0;
      if (isFinderPattern || hashValue % 2) output += `<rect x="${x * 10}" y="${y * 10}" width="10" height="10"/>`;
    }
  }
  return `<svg class="w-28 h-28 bg-white rounded-xl p-2 order-first md:order-none" viewBox="0 0 110 110" fill="#1b2a57" role="img" aria-label="Código do teu passe">${output}</svg>`;
}

// --- Small reusable class strings ---
const BTN_BASE   = 'inline-block rounded-full bg-primary-500 text-white font-semibold text-base px-7 py-3.5 cursor-pointer no-underline hover:brightness-110 transition';
const BTN_GHOST  = 'bg-transparent text-ink shadow-[inset_0_0_0_2px_var(--color-line)]';
const BTN_SM     = 'px-[18px] py-[9px] text-sm';
const FIELD_BASE = 'w-full font-normal text-base text-ink bg-surface border-2 border-line rounded-field px-3.5 py-3 focus:border-primary-500 focus:outline-none';

// --- Main Component ---
export default function CareerConnect() {
  const [memory, setMemory] = useState({ users: {}, session: null, data: {} });
  const [authMode, setAuthMode] = useState('register');
  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const toastTimer = useRef(null);
  const countdownInterval = useRef(null);

  const STORAGE_KEY = 'cc26';

  // --- Load from localStorage on mount ---
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setMemory(parsedData);
      }
    } catch (error) {
      console.warn('Failed to load from localStorage', error);
    }
    setIsLoaded(true);
  }, []);

  // --- Save to localStorage whenever memory changes ---
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
    } catch (error) {
      console.warn('Failed to save to localStorage', error);
    }
  }, [memory, isLoaded]);

  // --- Toast helper ---
  const showToast = (message) => {
    setToastMessage(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(''), 2400);
  };

  // --- Countdown timer ---
  useEffect(() => {
    const tick = () => {
      const difference = new Date('2026-12-04T14:00:00+02:00') - Date.now();
      if (difference <= 0) {
        setCountdown({ days: 'Hoje', hours: '', minutes: '' });
        return;
      }
      setCountdown({
        days: Math.floor(difference / 864e5),
        hours: Math.floor(difference / 36e5) % 24,
        minutes: Math.floor(difference / 6e4) % 60
      });
    };
    tick();
    countdownInterval.current = setInterval(tick, 30000);
    return () => clearInterval(countdownInterval.current);
  }, []);

  // --- Auth handlers ---
  const handleAuthSubmit = (event) => {
    event.preventDefault();
    setFormError('');
    const getValue = (id) => (document.getElementById(id)?.value || '').trim();
    const email = getValue('email').toLowerCase();

    if (!/^\S+@\S+\.\S+$/.test(email)) return setFormError('Escreve um email válido.');
    if (getValue('password').length < 6) return setFormError('A palavra-passe precisa de pelo menos 6 caracteres.');

    if (authMode === 'register') {
      if (getValue('name').length < 3) return setFormError('Escreve o teu nome completo.');
      const newMemory = {
        ...memory,
        users: {
          ...memory.users,
          [email]: { name: getValue('name'), phone: getValue('phone'), role: getValue('profile'), organization: getValue('institution') }
        },
        session: email,
        data: {
          ...memory.data,
          [email]: memory.data[email] || { reservations: {}, questions: {} }
        }
      };
      setMemory(newMemory);
      showToast('Conta criada. Bem-vindo!');
    } else {
      if (!memory.users[email]) return setFormError('Não encontrámos esta conta. Cria uma conta primeiro.');
      setMemory({ ...memory, session: email });
      showToast('Sessão iniciada.');
    }
  };

  const handleLogout = () => setMemory({ ...memory, session: null });

  const handleReserve = (id) => {
    const email = memory.session;
    if (!email) return;
    const userData = memory.data[email] || { reservations: {}, questions: {} };
    const newReservations = { ...userData.reservations, [id]: !userData.reservations[id] };
    const newData = { ...memory.data, [email]: { ...userData, reservations: newReservations } };
    setMemory({ ...memory, data: newData });
    showToast(newReservations[id] ? 'Lugar reservado. Passe carimbado.' : 'Reserva cancelada.');
  };

  const handleSaveQuestion = (id) => {
    const email = memory.session;
    if (!email) return;
    const questionValue = document.getElementById('question' + id)?.value.trim() || '';
    const userData = memory.data[email] || { reservations: {}, questions: {} };
    const newQuestions = { ...userData.questions, [id]: questionValue };
    const newData = { ...memory.data, [email]: { ...userData, questions: newQuestions } };
    setMemory({ ...memory, data: newData });
    showToast(questionValue ? 'Pergunta guardada.' : 'Escreve a tua pergunta primeiro.');
  };

  // --- Derived state ---
  const isLoggedIn = Boolean(memory.session && memory.users[memory.session]);
  const user = isLoggedIn ? memory.users[memory.session] : null;
  const userData = isLoggedIn ? (memory.data[memory.session] || { reservations: {}, questions: {} }) : { reservations: {}, questions: {} };

  // --- Render: Auth ---
  const renderAuth = () => (
    <div className="grid grid-cols-1 lg:grid-cols-[5fr_6fr] gap-11 items-start">
      <div>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight max-w-[20ch]">Cria a tua conta. Abre as masterclasses.</h2>
        <ul className="list-none mt-6 p-0 grid gap-3">
          {['Programa completo de cada sessão', 'Envia a tua pergunta ao palestrante', 'Reserva lugar e recebe o teu passe digital', 'Entra na rede de mentores e talentos'].map((text, index) => (
            <li key={index} className="flex gap-3 items-center text-ink">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-500)" strokeWidth="2.2" strokeLinecap="round" className="flex-none">
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-surface text-ink rounded-card p-7.5 shadow-card border border-line">
        <div className="flex gap-1.5 bg-surface-soft p-1.5 rounded-full mb-5">
          <button role="tab" aria-selected={authMode === 'register'} onClick={() => setAuthMode('register')} className={`flex-1 rounded-full py-2.5 font-semibold text-sm transition ${authMode === 'register' ? 'bg-navy-800 text-white' : 'bg-transparent text-ink-muted'}`}>Criar conta</button>
          <button role="tab" aria-selected={authMode === 'login'} onClick={() => setAuthMode('login')} className={`flex-1 rounded-full py-2.5 font-semibold text-sm transition ${authMode === 'login' ? 'bg-navy-800 text-white' : 'bg-transparent text-ink-muted'}`}>Entrar</button>
        </div>
        <form onSubmit={handleAuthSubmit} noValidate>
          {authMode === 'register' && (
            <>
              <label htmlFor="name" className="block font-semibold text-sm mt-3.5 mb-1.5">Nome completo</label>
              <input id="name" autoComplete="name" className={FIELD_BASE} />
            </>
          )}
          <label htmlFor="email" className="block font-semibold text-sm mt-3.5 mb-1.5">Email</label>
          <input id="email" type="email" autoComplete="email" className={FIELD_BASE} />
          {authMode === 'register' && (
            <>
              <label htmlFor="phone" className="block font-semibold text-sm mt-3.5 mb-1.5">Telemóvel</label>
              <input id="phone" type="tel" autoComplete="tel" placeholder="+258" className={FIELD_BASE} />
              <label htmlFor="profile" className="block font-semibold text-sm mt-3.5 mb-1.5">Perfil</label>
              <select id="profile" className={FIELD_BASE}>
                <option>Estudante</option>
                <option>Recém-licenciado</option>
                <option>Profissional e mentor</option>
              </select>
              <label htmlFor="institution" className="block font-semibold text-sm mt-3.5 mb-1.5">Universidade ou empresa</label>
              <input id="institution" className={FIELD_BASE} />
            </>
          )}
          <label htmlFor="password" className="block font-semibold text-sm mt-3.5 mb-1.5">Palavra-passe</label>
          <input id="password" type="password" autoComplete={authMode === 'register' ? 'new-password' : 'current-password'} placeholder="Mínimo 6 caracteres" className={FIELD_BASE} />
          <div className="text-danger text-sm min-h-[1.3em] mt-2.5 font-semibold" id="error" role="alert">{formError}</div>
          <button className={`${BTN_BASE} w-full mt-2`} type="submit">
            {authMode === 'register' ? 'Criar conta e aceder' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );

  // --- Render: Pass ---
  const renderPass = () => {
    const totalReservations = Object.values(userData.reservations).filter(Boolean).length;

    return (
      <>
        <div className="flex justify-between items-center mb-5 gap-3 flex-wrap">
          <h2 className="font-extrabold text-3xl tracking-tight max-w-none">Olá, {escapeHtml(user.name.split(' ')[0])}.</h2>
          <button className={`${BTN_BASE} ${BTN_GHOST} ${BTN_SM}`} onClick={handleLogout}>Sair</button>
        </div>

        {/* Pass card */}
        <div className="relative overflow-hidden grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 bg-navy-800 text-white rounded-card p-7">
          <div className="hidden md:block absolute left-[-14px] right-[-14px] bottom-[78px] border-t-[3px] border-dashed border-white/25" />
          <div>
            <div className="text-primary-300 font-semibold text-[.85rem]">Passe Career Connect</div>
            <h3 className="text-2xl font-extrabold mt-1">{escapeHtml(user.name)}</h3>
            <p className="text-navy-100 text-[.92rem] mt-2">
              {escapeHtml(user.role || 'Participante')}
              {user.organization ? ' · ' + escapeHtml(user.organization) : ''}
            </p>
            <div className="font-semibold text-[.95rem] tracking-widest text-primary-300 mt-1.5">CC-26-{hashString(memory.session).toString(36).toUpperCase().slice(0, 5)}</div>
            <p className="mt-2.5 text-[.9rem] text-navy-100">4 Dez 2026 · 14H00 · Hotel Cardoso</p>
          </div>
          <div dangerouslySetInnerHTML={{ __html: generateQrCode(memory.session) }} />
          <div className="col-span-full flex items-center gap-3.5 flex-wrap pt-9">
            {MASTERCLASSES.map(masterclass => (
              <div
                key={masterclass.id}
                title={masterclass.name}
                className={`w-[54px] h-[54px] rounded-full grid place-items-center font-extrabold transition ${
                  userData.reservations[masterclass.id]
                    ? 'border-[3px] border-primary-500 bg-primary-500 text-white -rotate-6 scale-105'
                    : 'border-[3px] border-dashed border-white/40 text-white/50'
                }`}
              >
                {masterclass.initials}
              </div>
            ))}
            <p className="text-[.9rem] text-navy-100 flex-1 min-w-[180px]">
              {totalReservations === 3
                ? 'Passaporte completo. Vemo-nos no Hotel Cardoso!'
                : `${totalReservations} de 3 lugares reservados. Cada reserva carimba o teu passe.`}
            </p>
          </div>
        </div>

        {/* Masterclass cards */}
        {MASTERCLASSES.map(masterclass => {
          const isReserved = userData.reservations[masterclass.id];
          return (
            <article key={masterclass.id} className="bg-surface-soft rounded-inner p-6 mt-5 text-ink">
              <header className="flex gap-4 items-center mb-3.5">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-navy-800 shadow-[0_0_0_3px_var(--color-surface),0_0_0_5px_var(--color-primary-500)] flex-none">
                  <img src={IMAGES[masterclass.id]} alt={masterclass.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-[.78rem] font-semibold text-primary-500">{masterclass.theme}</div>
                  <h3 className="text-lg font-extrabold">{masterclass.title}</h3>
                  <p className="text-ink-muted text-[.88rem]">{masterclass.name} · {masterclass.role}</p>
                </div>
              </header>
              <div className="grid gap-2.5 my-3.5">
                {masterclass.topics.map((topic, topicIndex) => (
                  <div key={topicIndex} className="border-l-[3px] border-primary-500 pl-3.5">
                    <b className="block">{topic[0]}</b>
                    <span className="text-ink-muted text-[.92rem]">{topic[1]}</span>
                  </div>
                ))}
              </div>
              <label htmlFor={`question${masterclass.id}`} className="block font-semibold text-sm mt-3.5 mb-1.5">{masterclass.question}</label>
              <textarea id={`question${masterclass.id}`} rows="2" placeholder={`A tua pergunta para ${masterclass.name.split(' ')[0]}`} defaultValue={userData.questions[masterclass.id] || ''} className={FIELD_BASE} />
              <div className="flex gap-2.5 flex-wrap mt-2.5">
                <button className={`${BTN_BASE} ${BTN_SM} ${isReserved ? BTN_GHOST : ''}`} onClick={() => handleReserve(masterclass.id)}>
                  {isReserved ? 'Cancelar reserva' : 'Reservar lugar'}
                </button>
                <button className={`${BTN_BASE} ${BTN_GHOST} ${BTN_SM}`} onClick={() => handleSaveQuestion(masterclass.id)}>Guardar pergunta</button>
                {isReserved && <span className="text-success font-semibold text-sm self-center">Lugar reservado</span>}
              </div>
            </article>
          );
        })}
      </>
    );
  };

  if (!isLoaded) {
    return <div className="max-w-[1080px] mx-auto px-[22px] py-10 text-center">Carregando…</div>;
  }

  return (
    <div className="min-h-screen bg-surface text-ink font-sans bg-navy-950">
      <div className="max-w-[1080px] mx-auto px-[22px]">

        {/* Header */}
        <header className="flex justify-between items-center py-5">
          <div className="font-extrabold text-2xl italic tracking-tighter leading-none">Career<br />Co<span className="text-primary-500">nn</span>ect</div>
          <a className={`${BTN_BASE} ${BTN_GHOST} ${BTN_SM}`} href="#acesso" id="navBtn">
            {isLoggedIn ? 'O meu passe' : 'Entrar'}
          </a>
        </header>

        {/* Hero */}
        <div className="pt-10 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_.8fr] gap-7.5 items-center">
            <div>
              <h1 className="text-[clamp(2.2rem,5.6vw,4rem)] font-extrabold tracking-tight max-w-[15ch] leading-[1.12]">O teu primeiro emprego começa numa ligação.</h1>
              <p className="max-w-[52ch] mt-5.5 mb-7.5 text-ink-muted text-lg">
                Uma imersão de empregabilidade, alta performance e conexões profissionais para jovens que querem entrar no mercado com confiança.
              </p>
              <a className={BTN_BASE} href="#acesso">Garantir o meu lugar</a>
              <div className="flex flex-wrap gap-y-2.5 gap-x-8.5 mt-8.5">
                <div>
                  <b className="block text-[1.05rem]">4 de Dezembro de 2026</b>
                  <span className="text-ink-muted text-sm">às 14H00</span>
                </div>
                <div>
                  <b className="block text-[1.05rem]">Hotel Cardoso</b>
                  <span className="text-ink-muted text-sm">Maputo</span>
                </div>
                <div>
                  <div className="flex gap-2.5 mt-1.5" aria-live="off">
                    {countdown.days === 'Hoje' ? (
                      <div className="bg-surface-soft rounded-count px-3.5 py-2.5 min-w-[68px] text-center"><b className="block text-[1.6rem] leading-none">Hoje</b><small className="text-ink-muted text-[.72rem]">é o dia</small></div>
                    ) : (
                      <>
                        <div className="bg-surface-soft rounded-count px-3.5 py-2.5 min-w-[68px] text-center"><b className="block text-[1.6rem] leading-none">{countdown.days}</b><small className="text-ink-muted text-[.72rem]">dias</small></div>
                        <div className="bg-surface-soft rounded-count px-3.5 py-2.5 min-w-[68px] text-center"><b className="block text-[1.6rem] leading-none">{countdown.hours}</b><small className="text-ink-muted text-[.72rem]">horas</small></div>
                        <div className="bg-surface-soft rounded-count px-3.5 py-2.5 min-w-[68px] text-center"><b className="block text-[1.6rem] leading-none">{countdown.minutes}</b><small className="text-ink-muted text-[.72rem]">min</small></div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Photo collage */}
            <div className="relative w-full max-w-[420px] aspect-[1/1.08] ml-auto mx-auto md:mt-0 mt-2.5" aria-hidden="true">
              <img className="absolute w-[60%] left-0 top-0 rounded-full object-cover bg-surface-soft shadow-[0_0_0_5px_var(--color-surface),0_0_0_8px_var(--color-primary-500)]" src={IMAGES[0]} alt="" />
              <img className="absolute w-[48%] right-0 top-[30%] rounded-full object-cover bg-surface-soft shadow-[0_0_0_5px_var(--color-surface),0_0_0_8px_var(--color-navy-800)]" src={IMAGES[1]} alt="" />
              <img className="absolute w-[52%] left-[16%] bottom-0 rounded-full object-cover bg-surface-soft shadow-[0_0_0_5px_var(--color-surface),0_0_0_8px_var(--color-primary-500)]" src={IMAGES[2]} alt="" />
              <i className="absolute w-[26px] h-[26px] rounded-full bg-primary-500 right-[30%] top-[12%]" />
            </div>
          </div>

          {/* Thread SVG */}
          <svg className="block w-full h-auto mt-7.5" viewBox="0 0 1000 170" role="img" aria-label="Uma linha laranja liga estudante, mentor, palestrante e profissional">
            <path d="M40 120 C160 120 170 40 290 50 S430 130 520 100 S700 20 790 60 S900 120 960 70" fill="none" stroke="var(--color-primary-500)" strokeWidth="4" strokeLinecap="round" strokeDasharray="1400" strokeDashoffset="1400" className="motion-safe:animate-[draw_2.6s_.3s_cubic-bezier(.6,0,.2,1)_forwards]" />
            <circle cx="40" cy="120" r="12" fill="var(--color-navy-800)" /><circle cx="290" cy="50" r="12" fill="var(--color-navy-800)" /><circle cx="520" cy="100" r="12" fill="var(--color-navy-800)" /><circle cx="790" cy="60" r="12" fill="var(--color-navy-800)" /><circle cx="960" cy="70" r="12" fill="var(--color-navy-800)" />
            <text x="20" y="152" fill="var(--color-ink)" fontSize="13" fontWeight="600" fontFamily="Montserrat, sans-serif">Estudante</text>
            <text x="260" y="26" fill="var(--color-ink)" fontSize="13" fontWeight="600" fontFamily="Montserrat, sans-serif">Mentor</text>
            <text x="478" y="136" fill="var(--color-ink)" fontSize="13" fontWeight="600" fontFamily="Montserrat, sans-serif">Palestrante</text>
            <text x="748" y="36" fill="var(--color-ink)" fontSize="13" fontWeight="600" fontFamily="Montserrat, sans-serif">Profissional</text>
            <text x="900" y="104" fill="var(--color-ink)" fontSize="13" fontWeight="600" fontFamily="Montserrat, sans-serif">Tu, daqui a um ano</text>
          </svg>
        </div>
      </div>

      {/* Section: Duas formas */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1080px] mx-auto px-[22px]">
          <h2 className="text-[clamp(1.8rem,4.5vw,2.8rem)] font-extrabold tracking-tight max-w-[20ch]">Uma plataforma. Duas formas de ligação.</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mt-10">
            <div className="border-l-4 border-primary-500 pl-5">
              <h3 className="text-xl font-extrabold mb-2">Encontros presenciais</h3>
              <p className="text-ink-muted">Masterclasses, experiências práticas e momentos organizados para criar redes de contactos entre estudantes e profissionais experientes.</p>
            </div>
            <div className="border-l-4 border-primary-500 pl-5">
              <h3 className="text-xl font-extrabold mb-2">Plataforma digital</h3>
              <p className="text-ink-muted">Correspondência de perfis para identificar mentores e talentos e manter as ligações activas antes, durante e depois dos encontros.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Desafios */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1080px] mx-auto px-[22px]">
          <h2 className="text-[clamp(1.8rem,4.5vw,2.8rem)] font-extrabold tracking-tight max-w-[20ch]">A que desafios responde o Career Connect.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5.5 mt-10">
            {[
              { title: 'Acesso ao mercado', items: ['Dificuldade em conseguir o primeiro emprego', 'Pouca experiência profissional', 'Preparação insuficiente para o recrutamento'] },
              { title: 'Competências e posicionamento', items: ['Dificuldade em comunicar competências', 'Marca pessoal e rede de contactos por construir', 'Dificuldade em demonstrar o seu valor'] },
              { title: 'Integração e crescimento', items: ['Adaptação ao ambiente profissional', 'Gestão do desempenho', 'Planeamento de uma carreira sustentável'] },
            ].map((card, i) => (
              <div key={i} className="bg-surface-soft rounded-inner p-6.5">
                <h3 className="text-[1.1rem] font-extrabold mb-3">{card.title}</h3>
                <ul className="m-0 pl-4.5 text-ink-muted space-y-1.5">
                  {card.items.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Masterclasses (band) */}
      <section className="py-16 md:py-20 bg-navy-800 text-white">
        <div className="max-w-[1080px] mx-auto px-[22px]">
          <h2 className="text-[clamp(1.8rem,4.5vw,2.8rem)] font-extrabold tracking-tight max-w-[20ch]">Para cada desafio, uma masterclass.</h2>
          <p className="text-navy-100 mt-3.5 max-w-[56ch]">
            Cria a tua conta para ver o programa completo, enviar perguntas aos palestrantes e reservar lugar em cada sessão.
          </p>
          <div className="grid gap-4.5 mt-10">
            {MASTERCLASSES.map(masterclass => (
              <div key={masterclass.id} className="grid grid-cols-[56px_1fr] md:grid-cols-[64px_1fr_auto] gap-4.5 items-center bg-surface-soft text-ink rounded-inner px-6 py-5">
                <div className="w-14 md:w-16 h-14 md:h-16 rounded-full overflow-hidden bg-navy-800 shadow-[0_0_0_3px_var(--color-surface),0_0_0_5px_var(--color-primary-500)]">
                  <img src={IMAGES[masterclass.id]} alt={masterclass.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-[.78rem] font-semibold text-primary-500">{masterclass.theme}</div>
                  <h3 className="text-[1.15rem] font-extrabold">{masterclass.title}</h3>
                  <p className="text-ink-muted text-[.9rem]">{masterclass.name} · {masterclass.role}</p>
                </div>
                <div className="text-[.82rem] text-ink-muted font-semibold col-start-2 md:col-start-auto">
                  {isLoggedIn ? 'Acesso aberto' : 'Com sessão iniciada'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Speakers */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1080px] mx-auto px-[22px]">
          <h2 className="text-[clamp(1.8rem,4.5vw,2.8rem)] font-extrabold tracking-tight max-w-[20ch]">Quem te vai orientar.</h2>
          <div className="mt-2">
            {MASTERCLASSES.map((masterclass, index) => (
              <div
                key={masterclass.id}
                className={`grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8.5 items-center mt-11 ${index % 2 === 1 ? 'md:grid-cols-[1fr_200px]' : ''}`}
              >
                <img
                  src={IMAGES[index]}
                  alt={masterclass.name}
                  className={`w-[200px] h-[200px] rounded-full object-cover bg-surface-soft shadow-[0_0_0_5px_var(--color-surface),0_0_0_8px_var(--color-primary-500)] ${index % 2 === 1 ? 'md:order-2' : ''}`}
                />
                <div>
                  <div className="text-[.78rem] font-semibold text-primary-500">{masterclass.theme}</div>
                  <h3 className="text-2xl font-extrabold">{masterclass.name}</h3>
                  <div className="text-primary-500 font-semibold text-[.92rem] my-1">{masterclass.role}</div>
                  <p className="text-ink-muted">{BIOGRAPHIES[index].biography}</p>
                  {BIOGRAPHIES[index].works && <p className="mt-3 text-[.88rem] text-ink-muted">{BIOGRAPHIES[index].works}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Steps (band) */}
      <section className="py-16 md:py-20 bg-navy-800 text-white">
        <div className="max-w-[1080px] mx-auto px-[22px]">
          <h2 className="text-[clamp(1.8rem,4.5vw,2.8rem)] font-extrabold tracking-tight max-w-[20ch]">Com o Career Connect, os jovens tornam-se…</h2>
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-5 mt-11">
            <div className="hidden md:block absolute left-0 right-0 top-[15px] border-t-[3px] border-primary-500" />
            {[
              { title: 'Posicionados', text: 'Sabem comunicar o seu valor e entram no mercado com confiança.' },
              { title: 'Conectados', text: 'Têm contactos reais com profissionais, mentores e palestrantes.' },
              { title: 'Destacados', text: 'Ganham uma presença digital que atrai e cria oportunidades.' },
              { title: 'Impulsionados', text: 'Ligam-se a parceiros estratégicos e a relações que duram.' },
            ].map((step, i) => (
              <div key={i} className="relative pt-[42px]">
                <div className="absolute top-[6px] left-0 w-5 h-5 rounded-full bg-white border-[5px] border-navy-800" />
                <h3 className="text-[1.15rem] font-extrabold mb-1.5">{step.title}</h3>
                <p className="text-navy-100">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Access */}
      <section id="acesso" className="py-16 md:py-20">
        <div className="max-w-[1080px] mx-auto px-[22px]">
          {isLoggedIn ? renderPass() : renderAuth()}
        </div>
      </section>

      {/* Section: Venue */}
      <section className="pt-5 pb-16 md:pb-20">
        <div className="max-w-[1080px] mx-auto px-[22px] grid grid-cols-1 md:grid-cols-2 gap-9 items-start">
          <div>
            <h2 className="text-[clamp(1.8rem,4.5vw,2.8rem)] font-extrabold tracking-tight max-w-[20ch]">Encontramo-nos no Hotel Cardoso.</h2>
            <div className="mt-7">
              {[
                { q: 'Para quem é o Career Connect?', a: 'Para jovens que querem preparar-se para o primeiro emprego e ligar-se a oportunidades reais.', open: true },
                { q: 'O que acontece no encontro presencial?', a: 'Masterclasses, experiências práticas e momentos organizados para criar redes de contactos entre estudantes e profissionais experientes.' },
                { q: 'E depois do evento?', a: 'A plataforma digital mantém as ligações activas antes, durante e depois dos encontros, com correspondência de perfis para encontrar mentores e talentos.' },
                { q: 'Como reservo lugar nas masterclasses?', a: 'Cria a tua conta na secção de registo, inicia sessão e reserva cada masterclass na tua área pessoal.' },
              ].map((item, i) => (
                <details key={i} open={item.open} className="border-b border-line py-4">
                  <summary className="font-semibold cursor-pointer">{item.q}</summary>
                  <p className="text-ink-muted mt-2.5">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
          <div className="bg-navy-800 text-white rounded-card p-8">
            <small className="text-primary-300 font-semibold block">Data e hora</small>
            <b className="block text-2xl mb-3.5 mt-0.5">4 de Dezembro de 2026, 14H00</b>
            <small className="text-primary-300 font-semibold block">Local</small>
            <b className="block text-2xl mb-3.5 mt-0.5">Hotel Cardoso, Maputo</b>
            <div className="flex gap-2.5 flex-wrap mt-4.5">
              <a className={`${BTN_BASE} ${BTN_SM}`} href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Career+Connect&dates=20261204T120000Z/20261204T150000Z&location=Hotel+Cardoso,+Maputo" target="_blank" rel="noopener noreferrer">Adicionar ao calendário</a>
              <a className={`${BTN_BASE} ${BTN_GHOST} ${BTN_SM} !text-white !shadow-[inset_0_0_0_2px_rgba(255,255,255,.4)]`} href="https://www.google.com/maps/search/?api=1&query=Hotel+Cardoso+Maputo" target="_blank" rel="noopener noreferrer">Ver no mapa</a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-8 pb-12 text-ink-muted text-sm">
        <div className="max-w-[1080px] mx-auto px-[22px]">Career Connect® · 4 de Dezembro de 2026 · 14H00 · Hotel Cardoso, Maputo</div>
      </footer>

      {/* Toast */}
      <div className={`fixed left-1/2 bottom-[calc(24px+env(safe-area-inset-bottom,0px))] -translate-x-1/2 bg-ink text-surface px-5.5 py-3 rounded-full font-semibold pointer-events-none z-20 transition-all duration-300 ${toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`} role="status">
        {toastMessage}
      </div>
    </div>
  );
}