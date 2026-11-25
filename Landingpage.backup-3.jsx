import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import mainLogo from './assets/patners/main.png';
import logo from './assets/logo.png';
import mentor1 from './assets/mentors/1.jpeg';
import mentor2 from './assets/mentors/2.jpeg';
import mentor3 from './assets/mentors/3.jpeg';
import partner1 from './assets/patners/1.jpeg';
import partner2 from './assets/patners/2.png';
import partner3 from './assets/patners/3.jpeg';
import partner4 from './assets/patners/4.png';

const PARTNERS = [
  { src: partner1, alt: 'Parceiro 1' },
  { src: partner2, alt: 'Parceiro 2' },
  { src: partner3, alt: 'Parceiro 3' },
  { src: partner4, alt: 'Parceiro 4' },
];

const IMAGES = [
  mentor1,
  mentor2,
  mentor3,
];

const BIOGRAPHIES = [
  { biography: "Mestre em Psicologia e Pedagogia, com experiência em consultoria estratégica, gestão de recursos humanos e desenvolvimento organizacional. É autor de “RH com H de Humano” e de “Para uma Gestão de Pessoas Humanizada”.", works: "Obras: Viagem, pelos trilhos da vida · Avaliação de Desempenho Automatizada, Guia Prático · Para uma Gestão de Pessoas Humanizada · Poemas para Boi Dormir · Ensaio sobre um Manifesto · RH com H de Humano" },
  { biography: "Formado em Comunicação e Relações Empresariais pelo ISCIM, é orador, formador, escritor e consultor. É autor de “Oratória: O Oxigénio das Relações de Influência”." },
  { biography: "Licenciada em Ciências Políticas pela Universidade Eduardo Mondlane (UEM), construiu a sua carreira na Vale Moçambique e na Galp Moçambique. É fundadora da Salto Moçambique, dedicada à formação e à mentoria." }
];

// Themes now match the "Eixos de Actuação"; titles come from the client guide (section 8)
const MASTERCLASSES = [
  { id: 0, initials: 'VS', name: 'Vicente Sitoe', role: 'Director Geral da SDO Moçambique', theme: 'Preparação para o Mercado de Trabalho', title: 'Da Formação para o Mercado de Trabalho: Estratégias para Encontrar o Primeiro Emprego' },
  { id: 1, initials: 'AC', name: 'Arafat Cossa', role: 'Director da Arafat Executive Academy', theme: 'Posicionamento e Oportunidades', title: 'A Arte do Networking: Como Transformar Conexões em Oportunidades de Carreira' },
  { id: 2, initials: 'MC', name: 'Marlene Chambule', role: 'Directora Executiva da Salto Moçambique', theme: 'Desenvolvimento e Crescimento na Carreira', title: 'Fui Contratado. E Agora? Como Construir uma Carreira de Sucesso' },
];

// Section 3 — Ciclo da Conexão: the five moments now live on the existing curved line
const JOURNEY_STEPS = [
  { title: 'APRENDER', text: 'Participação em masterclasses e sessões inspiradoras com especialistas de referência.' },
  { title: 'CONECTAR', text: 'Interação direta com profissionais experientes e potenciais mentores.' },
  { title: 'DESCOBRIR', text: 'Exploração de novas áreas de interesse, oportunidades e tendências do mercado.' },
  { title: 'PARTILHAR', text: 'Troca de experiências, conhecimentos e melhores práticas profissionais.' },
  { title: 'EVOLUIR', text: 'Transformação das conexões criadas em oportunidades de mentoria e desenvolvimento contínuo.' },
];

// ── Section 4: O que vais ganhar ──
const BENEFITS = [
  { title: 'Encontrar um Mentor', text: 'Identifica profissionais experientes que podem orientar a tua jornada profissional.' },
  { title: 'Construir Conexões Profissionais', text: 'Expande a tua rede de contactos através de networking estratégico.' },
  { title: 'Participar em 4 Conversas Estratégicas', text: 'Interage com diferentes profissionais durante sessões rápidas de networking.' },
  { title: 'Transformar Contactos em Oportunidades', text: 'Estabelece relações que poderão evoluir para mentoria, estágios ou oportunidades profissionais.' },
  { title: 'Aprender com Líderes e Especialistas', text: 'Obtém conhecimentos práticos sobre empregabilidade, carreira e desenvolvimento pessoal.' },
];

// ── Section 5: Como funcionam as conexões ──
const CONNECTION_STEPS = [
  { step: '1', title: 'Regista-te', text: 'Cria a tua conta em menos de 5 minutos e escolhe o teu perfil:', profiles: ['Participante', 'Mentor'] },
  { step: '2', title: 'Vive o Momento Conexão', text: 'Participa em rondas de networking estruturadas e conversa com diferentes profissionais.' },
  { step: '3', title: 'Mantém a Conexão', text: 'Solicita acompanhamento, troca contactos e inicia uma relação de mentoria duradoura.' },
];

// Put the tutorial video URL here (mp4 file or hosted path). Leave empty to show a placeholder.
const TUTORIAL_VIDEO_URL = '';

// ── Section 6: Eixos de Actuação (replaces "A que desafios responde o Career Connect?") ──
const AXES = [
  { title: 'Preparação para o Mercado de Trabalho', items: ['Estratégias de procura de emprego', 'Construção de CV', 'Preparação para entrevistas'] },
  { title: 'Posicionamento e Oportunidades', items: ['Marca pessoal & Comunicação profissional', 'LinkedIn e presença digital', 'Networking estratégico e desenvolvimento de conexões profissionais', 'Identificação e valorização de competências no mercado'] },
  { title: 'Desenvolvimento e Crescimento na Carreira', items: ['Adaptação à cultura e ao ambiente organizacional', 'Postura profissional, responsabilidade e desempenho', 'Aprendizagem contínua, proactividade e planeamento de carreira'] },
];

// ── FAQ (from the client guide) ──
const FAQS = [
  { q: 'O que é o Career Connect?', a: 'É uma iniciativa da TECNICOL que conecta estudantes finalistas e jovens profissionais a executivos e especialistas de diversas áreas, através de um fórum presencial de capacitação, networking e um programa estruturado de mentoria.' },
  { q: 'Quem pode participar?', a: 'O programa destina-se a estudantes finalistas universitários e do ensino técnico-profissional e jovens profissionais, que procuram a sua inserção no mercado de trabalho, bem como a profissionais experientes interessados em contribuir para o desenvolvimento da próxima geração de talentos, atuando como mentores.' },
  { q: 'A participação tem algum custo?', a: 'As condições variam em cada evento. A 1ª edição é grátis, mas serão selecionados os graduados e mentores com o perfil mais adequado para os objectivos desta edição. Após o registo, a organização terá 48 horas para validar a inscrição.' },
  { q: 'O que acontece durante o evento presencial?', a: 'Os participantes terão acesso a masterclasses com oradores de referência, dinâmicas de networking direcionado e momentos de interação direta com profissionais e mentores experientes.' },
  { q: 'Como funciona o processo de mentoria?', a: 'Após a fase de candidatura, a organização realiza um processo de matching inteligente, ligando mentorados e mentores de acordo com os objetivos profissionais, interesses e áreas de competência, reduzindo a dependência dos modelos tradicionais de seleção baseados apenas em CVs.' },
  { q: 'Ser selecionado garante um emprego ou estágio?', a: 'Não. O Career Connect não garante oportunidades de emprego ou estágio. O objetivo é proporcionar orientação, desenvolvimento de competências e acesso a uma rede de contactos que aumente a empregabilidade e a preparação profissional dos participantes.' },
  { q: 'Como posso tornar-me mentor?', a:'Os profissionais interessados devem preencher o formulário de candidatura para mentores, indicando a sua experiência, área de especialização e disponibilidade.'},
  { q: 'A mentoria termina no dia do evento?', a:'Não. O evento presencial marca apenas o início do programa. Após o fórum, mentor e mentorado seguem um plano de acompanhamento com objetivos, desafios práticos e sessões periódicas de desenvolvimento.'}
];

const BTN_BASE   = 'inline-block rounded-full bg-primary-500 text-white font-semibold text-base px-7 py-3.5 cursor-pointer no-underline hover:brightness-110 transition';
const BTN_GHOST  = 'bg-transparent text-ink shadow-[inset_0_0_0_2px_var(--color-line)]';
const BTN_SM     = 'px-[18px] py-[9px] text-sm';
const FIELD_BASE = 'w-full font-normal text-base text-ink bg-surface border-2 border-line rounded-field px-3.5 py-3 focus:border-primary-500 focus:outline-none';

// Constrained content wrapper reused by every non-bleed section
const Container = ({ children }) => (
  <div className="max-w-[1180px] mx-auto px-[22px]">{children}</div>
);

// Small inline icons for the hero headline
const CalendarIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
    <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
  </svg>
);

const PinIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);

export default function Landingpage() {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [shareOpen, setShareOpen] = useState(false);
  const [imagesReady, setImagesReady] = useState(false);
  const [activeJourney, setActiveJourney] = useState(null);
  const countdownInterval = useRef(null);
  const journeyRef = useRef(null);
  const [journeyVisible, setJourneyVisible] = useState(false);

  const VB_W = 1000;
  const VB_H = 220;
  const TOOLTIP_W = 240;

  const PAD_X = 40;
  const Y_VALUES = [140, 70, 110, 70, 90]; // 5 points, one per moment
  const STEP_X = (VB_W - PAD_X * 2) / (Y_VALUES.length - 1); 

  // equal spacing across the viewBox
  const JOURNEY_POINTS = Y_VALUES.map((cy, i) => ({ cx: PAD_X + i * STEP_X, cy }));

  // Smooth curve (Catmull-Rom → cubic Bézier) passing through every point
  function buildSmoothPath(pts, t = 6) {
    let d = `M${pts[0].cx} ${pts[0].cy}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const c1x = p1.cx + (p2.cx - p0.cx) / t;
      const c1y = p1.cy + (p2.cy - p0.cy) / t;
      const c2x = p2.cx - (p3.cx - p1.cx) / t;
      const c2y = p2.cy - (p3.cy - p1.cy) / t;
      d += ` C${c1x} ${c1y} ${c2x} ${c2y} ${p2.cx} ${p2.cy}`;
    }
    return d;
  }

  const JOURNEY_PATH = buildSmoothPath(JOURNEY_POINTS);

  // Preload every image used on the page before revealing content
  useEffect(() => {
    const sources = [...IMAGES, ...PARTNERS.map((p) => p.src), logo, mainLogo];

    let cancelled = false;

    const loadImage = (src) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ src, ok: true });
        img.onerror = () => resolve({ src, ok: false });
        img.src = src;
      });

    Promise.all(sources.map(loadImage)).then(() => {
      if (!cancelled) setImagesReady(true);
    });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const tick = () => {
      const difference = new Date('2026-12-04T14:00:00+02:00') - Date.now();
      if (difference <= 0) {
        setCountdown({ days: 'Hoje', hours: '', minutes: '', seconds: '' });
        return;
      }
      setCountdown({
        days: Math.floor(difference / 864e5),
        hours: Math.floor(difference / 36e5) % 24,
        minutes: Math.floor(difference / 6e4) % 60,
        seconds: Math.floor(difference / 1000) % 60
      });
    };
    tick();
    countdownInterval.current = setInterval(tick, 1000);
    return () => clearInterval(countdownInterval.current);
  }, []);

  // Only draw the curved SVG line once the Journey section enters the viewport
  useEffect(() => {
    if (!imagesReady) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setJourneyVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 },
    );
    if (journeyRef.current) observer.observe(journeyRef.current);
    return () => observer.disconnect();
  }, [imagesReady]);

  const totalCapacity = 120;
  const registeredCount = (() => {
    try {
      const raw = localStorage.getItem('cc26_app');
      if (!raw) return 0;
      const state = JSON.parse(raw);
      return Object.keys(state.registrations || {}).length;
    } catch { return 0; }
  })();
  const vagasRestantes = Math.max(0, totalCapacity - registeredCount);

  const shareText = 'Vou ao Career Connect — 4 de Dezembro, Hotel Cardoso, Maputo. Liga-te a mentores e dá o próximo passo na tua carreira.';
  const shareUrl = window.location.origin;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Career Connect', text: shareText, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => setShareOpen(true));
      setTimeout(() => setShareOpen(false), 2000);
    }
  };

  if (!imagesReady) {
    return (
      <div className="min-h-screen bg-surface text-ink font-sans bg-navy-950 grid place-items-center">
        <div
          className="w-10 h-10 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"
          role="status"
          aria-label="A carregar"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-ink font-sans bg-navy-950 overflow-x-hidden">

      {/* ── Constrained: header + hero ── */}
      <Container>
        <header className="flex justify-between items-center py-5">
          <img src={logo} alt="Career Connect" className="h-10 md:h-12 w-auto" />
          <div className="flex gap-2.5 items-center">
            {/**<Link to="/registo" className={BTN_BASE}>Garantir o meu lugar</Link> */}
            <Link to="/entrar" className={`${BTN_BASE} ${BTN_GHOST}`}>Entrar</Link>
            <div className="h-[20px] w-[1px] bg-gray-500 rounded-4xl mx-1"></div>
            <div>
              <Link to="https://tecnicol.co.mz">
                <img src={mainLogo} alt="Tecnicol" className="h-10 md:h-12 w-auto" />
              </Link>
            </div>
          </div>
        </header>

        {/* ── 1. Banner Principal (Hero) ── */}
        <div className="pt-10 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_.8fr] gap-7.5 items-center">
            <div>
              <h1 className="text-[clamp(2.2rem,5.6vw,4rem)] font-extrabold tracking-tight max-w-[15ch] leading-[1.12]">O teu próximo passo começa com uma Conexão</h1>

              {/* Headline meta: calendar + location icons (per guide) */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 text-primary-500 font-bold text-[1.05rem]">
                <span className="inline-flex items-center gap-2">
                  <CalendarIcon />
                  04 de Dezembro de 2026
                </span>
                <span className="inline-flex items-center gap-2">
                  <PinIcon />
                  Hotel Cardoso | Maputo
                </span>
              </div>

              <p className="max-w-[52ch] mt-5 mb-7.5 text-ink-muted text-lg">
                Uma experiência transformadora de aprendizagem, networking e mentoria que aproxima estudantes finalistas, profissionais júniores e executivos experientes, criando oportunidades reais de desenvolvimento profissional e crescimento de carreira.
              </p>

              <p className="font-bold mb-3">Participa nesta Experiência:</p>
              <div className="flex flex-wrap  gap-3">
                <Link to="/registo" className={`${BTN_BASE} text-center`}>Inscrever-me como Participante</Link>
                <Link to="/registo/mentor" className={`${BTN_BASE} ${BTN_GHOST} text-center`}>Candidatar-me como Mentor</Link>
              </div>

              <div className="flex flex-wrap gap-y-2.5 gap-x-8.5 mt-8.5 max-md:bg-navy-800 max-md:text-white max-md:rounded-card max-md:p-8 max-md:gap-y-4 max-md:gap-x-6">
                <div>
                  <b className="block text-[1.05rem]">Início às 14H00</b>
                  <span className="text-ink-muted max-md:text-navy-100 text-sm">4 de Dezembro de 2026</span>
                </div>
                <div>
                  <div className="flex gap-2.5 mt-1.5 max-md:mt-0 " aria-live="off">
                    {countdown.days === 'Hoje' ? (
                      <div className="bg-surface-soft max-md:bg-white/10 rounded-count px-3.5 py-2.5 min-w-[68px] text-center">
                        <b className="block text-[1.6rem] leading-none">Hoje</b>
                        <small className="text-ink-muted max-md:text-navy-100 text-[.72rem]">é o dia</small>
                      </div>
                    ) : (
                      <>
                        <div className="bg-surface-soft max-md:bg-white/10 rounded-count px-3.5 py-2.5 min-w-[68px] text-center">
                          <b className="block text-[1.6rem] leading-none">{countdown.days}</b>
                          <small className="text-ink-muted max-md:text-navy-100 text-[.72rem]">dias</small>
                        </div>
                        <div className="bg-surface-soft max-md:bg-white/10 rounded-count px-3.5 py-2.5 min-w-[68px] text-center">
                          <b className="block text-[1.6rem] leading-none">{countdown.hours}</b>
                          <small className="text-ink-muted max-md:text-navy-100 text-[.72rem]">horas</small>
                        </div>
                        <div className="bg-surface-soft max-md:bg-white/10 rounded-count px-3.5 py-2.5 min-w-[68px] text-center">
                          <b className="block text-[1.6rem] leading-none">{countdown.minutes}</b>
                          <small className="text-ink-muted max-md:text-navy-100 text-[.72rem]">min</small>
                        </div>

                          <div className="bg-surface-soft max-md:bg-white/10 rounded-count px-3.5 py-2.5 min-w-[68px] text-center">
                          <b className="block text-[1.6rem] leading-none">{countdown.seconds}</b>
                          <small className="text-ink-muted max-md:text-navy-100 text-[.72rem]">seg</small>
                        </div> 
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative w-full max-w-[420px] aspect-[1/1.08] ml-auto mx-auto md:mt-0 mt-2.5" aria-hidden="true">
              <img className="absolute w-[60%] left-0 top-0 rounded-full object-cover bg-surface-soft shadow-[0_0_0_5px_var(--color-surface),0_0_0_8px_var(--color-primary-500)]" src={IMAGES[0]} alt="" />
              <img className="absolute w-[48%] right-0 top-[30%] rounded-full object-cover bg-surface-soft shadow-[0_0_0_5px_var(--color-surface),0_0_0_8px_var(--color-navy-800)]" src={IMAGES[1]} alt="" />
              <img className="absolute w-[52%] left-[16%] bottom-0 rounded-full object-cover bg-surface-soft shadow-[0_0_0_5px_var(--color-surface),0_0_0_8px_var(--color-primary-500)]" src={IMAGES[2]} alt="" />
              <i className="absolute w-[26px] h-[26px] rounded-full bg-primary-500 right-[30%] top-[12%]" />
            </div>
          </div>

          {/* ── Journey steps with curved SVG line and floating tooltip ── */}
          <div className="mt-14" ref={journeyRef}>
            {/* 3. Experiência Career Connect | Ciclo da Conexão */}
            <h2 className="text-[clamp(1.8rem,4.5vw,2.8rem)] font-extrabold tracking-tight max-w-[22ch] mb-3.5">Experiência Career Connect | Ciclo da Conexão</h2>
            <p className="text-primary-500 font-bold text-xl mb-4">Uma Experiência. Cinco Momentos de Impacto.</p>
            <p className="text-ink-muted text-lg max-w-[60ch]">
              O Career Connect foi concebido para proporcionar uma jornada completa de desenvolvimento profissional através de cinco momentos complementares:
            </p>
            <div className="pt-28">
              {/* This wrapper is the positioning context, so percentages match the SVG exactly */}
              <div className="relative">
                <svg
                  className="block w-full h-auto overflow-visible"
                  viewBox={`0 0 ${VB_W} ${VB_H}`}
                  role="img"
                  aria-label="Ciclo da Conexão: Aprender, Conectar, Descobrir, Partilhar, Evoluir"
                >
                  <path
                    d={JOURNEY_PATH}
                    pathLength={1400}
                    fill="none"
                    stroke="var(--color-primary-500)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="1400"
                    strokeDashoffset="1400"
                    className={journeyVisible ? 'draw-animate' : ''}
                  />

                  {JOURNEY_STEPS.map((step, i) => {
                    const p = JOURNEY_POINTS[i];
                    const isFirst = i === 0;
                    const isLast = i === JOURNEY_STEPS.length - 1;
                    const labelY = p.cy < 110 ? p.cy - 22 : p.cy + 32;

                    // Keep first/last labels inside the viewBox
                    const anchor = isFirst ? 'start' : isLast ? 'end' : 'middle';
                    const labelX = isFirst ? p.cx - 12 : isLast ? p.cx + 12 : p.cx;

                    return (
                      <g
                        key={i}
                        className="cursor-pointer"
                        onMouseEnter={() => setActiveJourney(i)}
                        onMouseLeave={() => setActiveJourney(null)}
                        onFocus={() => setActiveJourney(i)}
                        onBlur={() => setActiveJourney(null)}
                        tabIndex={0}
                      >
                        {/* larger invisible hit area for easier hovering */}
                        <circle cx={p.cx} cy={p.cy} r="22" fill="transparent" />
                        <circle
                          cx={p.cx}
                          cy={p.cy}
                          r="12"
                          fill={activeJourney === i ? 'var(--color-primary-500)' : 'var(--color-navy-800)'}
                          className="transition-colors duration-200"
                        />
                        <text
                          x={labelX}
                          y={labelY}
                          textAnchor={anchor}
                          fill="var(--color-ink)"
                          fontSize="13"
                          fontWeight="700"
                          fontFamily="Montserrat, sans-serif"
                        >
                          {step.title}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Floating tooltip: centered on the node, clamped to stay inside the container */}
                {activeJourney !== null && (() => {
                  const p = JOURNEY_POINTS[activeJourney];
                  const half = TOOLTIP_W / 2;
                  const leftPct = (p.cx / VB_W) * 100;

                  // If the title sits above the node, lift the tooltip above the title too
                  const labelAbove = p.cy < 110;
                  const anchorY = labelAbove ? p.cy - 38 : p.cy - 18;
                  const topPct = (anchorY / VB_H) * 100;

                  return (
                    <>
                      <div
                        className="absolute z-10 pointer-events-none"
                        style={{
                          width: TOOLTIP_W,
                          // centered on the node, but never overflowing left/right
                          left: `clamp(${half}px, ${leftPct}%, calc(100% - ${half}px))`,
                          top: `${topPct}%`,
                          transform: 'translate(-50%, -100%)',
                          marginTop: -8,
                        }}
                      >
                        <div className="bg-navy-800 text-white rounded-inner px-4 py-3 shadow-lg text-[.85rem] leading-snug">
                          <div className="font-extrabold text-primary-300 text-[.75rem] mb-1 tracking-wide">
                            {JOURNEY_STEPS[activeJourney].title}
                          </div>
                          {JOURNEY_STEPS[activeJourney].text}
                        </div>
                      </div>

                      {/* Arrow: separate element so it always points at the node, even when the box is clamped */}
                      <div
                        className="absolute z-10 pointer-events-none w-3 h-3 bg-navy-800"
                        style={{
                          left: `${leftPct}%`,
                          top: `${topPct}%`,
                          transform: 'translate(-50%, -50%) rotate(45deg)',
                          marginTop: -8,
                        }}
                      />
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* F-07: vagas restantes */}
        <div className="bg-surface-soft border hidden border-line rounded-card p-5 mb-8 flex flex-wrap items-center justify-between gap-3">
          <span className="text-ink-muted text-sm font-semibold">Vagas restantes</span>
          <b className="text-[2rem] font-extrabold text-primary-500">{vagasRestantes}</b>
          <span className="text-ink-muted text-sm">de {totalCapacity}</span>
          <div className="flex gap-2">
            <button onClick={handleShare} className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white">Partilhar</button>
            <Link to="/registo" className={BTN_BASE}>Inscrever-me</Link>
          </div>
        </div>

        {/* ── 2. Sobre o Career Connect ── */}
        <section className="py-16 md:py-20">
          <h2 className="text-[clamp(1.8rem,4.5vw,2.8rem)] font-extrabold tracking-tight max-w-[20ch] mb-3.5">Sobre o Career Connect</h2>
          <p className="text-primary-500 font-bold text-xl mb-6">Onde o Talento Encontra Oportunidades</p>
          <div className="max-w-[68ch] space-y-4 text-ink-muted text-lg">
            <p>
              O Career Connect é uma iniciativa da TECNICOL que liga jovens talentos a profissionais experientes através de capacitação, networking estruturado, programas de mentoria e oportunidades de estágio pré-profissional.
            </p>
            <p>
              O objetivo é reduzir a distância entre a formação académica e as exigências do mercado de trabalho, promovendo conexões que geram aprendizagem, crescimento e oportunidades.
            </p>
          </div>
        </section>
      </Container>

      {/* ── Constrained ── */}
      <Container>
        {/* ── 4. O Que Vais Ganhar com o Career Connect? ── */}
        <section className="py-16 md:py-20">
          <h2 className="text-[clamp(1.8rem,4.5vw,2.8rem)] font-extrabold tracking-tight max-w-[20ch] mb-3.5">O Que Vais Ganhar com o Career Connect?</h2>
          <p className="text-ink-muted italic text-lg mb-10">Mais do que participar num evento, vais investir no teu futuro profissional.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5.5">
            {BENEFITS.map((benefit, i) => (
              <div key={i} className="bg-surface-soft rounded-inner p-6">
                <div className="w-10 h-10 rounded-full bg-primary-500 text-white grid place-items-center font-extrabold mb-4">{i + 1}</div>
                <h3 className="text-[1.1rem] font-extrabold mb-2">{benefit.title}</h3>
                <p className="text-ink-muted text-[.88rem]">{benefit.text}</p>
              </div>
            ))}
          </div>
        </section>
      </Container>

      {/* ── 5. Como funcionam as conexões: full-width band ── */}
      <section className="py-16 md:py-20 bg-navy-800 text-white w-full">
        <Container>
          <h2 className="text-[clamp(1.8rem,4.5vw,2.8rem)] font-extrabold tracking-tight max-w-[20ch] mb-3.5">Como funcionam as conexões?</h2>
          <p className="text-primary-300 font-bold text-xl mb-10">Três Passos para Criar Conexões Valiosas</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CONNECTION_STEPS.map((step, i) => (
              <div key={i} className="relative pt-[52px]">
                <div className="absolute top-0 left-0 w-10 h-10 rounded-full bg-primary-500 text-white grid place-items-center font-extrabold">{step.step}</div>
                <h3 className="text-[1.15rem] font-extrabold mb-2">{step.title}</h3>
                <p className="text-navy-100 text-[.9rem]">{step.text}</p>
                {step.profiles && (
                  <ul className="mt-3 pl-0 space-y-1.5 list-none">
                    {step.profiles.map((profile) => (
                      <li key={profile} className="flex items-center gap-2.5 text-[.9rem] font-semibold">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-300" aria-hidden="true" />
                        {profile}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Tutorial da Plataforma */}
          <div className="mt-16">
            <h3 className="text-2xl font-extrabold mb-2">Tutorial da Plataforma</h3>
            <p className="text-navy-100 mb-6 max-w-[56ch]">Vê o vídeo e aprende a manusear a app passo a passo.</p>
            <div className="w-full max-w-[760px] aspect-video rounded-card overflow-hidden bg-white/10">
              {TUTORIAL_VIDEO_URL ? (
                <video className="w-full h-full object-cover" src={TUTORIAL_VIDEO_URL} controls preload="metadata" />
              ) : (
                <div className="w-full h-full grid place-items-center text-navy-100 text-center px-6">
                  Vídeo explicativo em breve
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* ── Constrained ── */}
      <Container>
        {/* ── 6. Eixos de Actuação (replaces "A que desafios responde o Career Connect?") ── */}
        <section className="py-16 md:py-20">
          <h2 className="text-[clamp(1.8rem,4.5vw,2.8rem)] font-extrabold tracking-tight max-w-[25ch] mb-3.5">Eixos de Actuação</h2>
          <p className="text-primary-500 font-bold text-xl mb-10">Preparar. Posicionar. Desenvolver.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5.5">
            {AXES.map((card, i) => (
              <div key={i} className="bg-surface-soft rounded-inner p-6.5">
                <div className="w-10 h-10 rounded-full bg-primary-500 text-white grid place-items-center font-extrabold mb-4">{i + 1}</div>
                <h3 className="text-[1.1rem] font-extrabold mb-3">{card.title}</h3>
                <ul className="m-0 pl-0 text-ink-muted space-y-1.5 list-none">
                  {card.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2.5">
                      <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── 7. Uma plataforma. Duas formas de conexão. ── */}
        <section className="pb-16 md:pb-20">
          <h2 className="text-[clamp(1.8rem,4.5vw,2.8rem)] font-extrabold tracking-tight max-w-[20ch] mb-10">Uma plataforma. Duas formas de conexão.</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mt-10">
            <div className="border-l-4 border-primary-500 pl-5">
              <h3 className="text-xl font-extrabold mb-2">Conexão Presencial</h3>
              <p className="text-ink-muted">Encontros, masterclasses, conferências, experiências práticas e momentos de networking que promovem a partilha de conhecimento tácito, aproximam diferentes gerações profissionais e criam oportunidades diretas de conexão.</p>
            </div>
            <div className="border-l-4 border-primary-500 pl-5">
              <h3 className="text-xl font-extrabold mb-2">Conexão Digital</h3>
              <p className="text-ink-muted">Uma plataforma de correspondência de perfis (matching) que facilita a identificação de talentos e potenciais mentores sem burocracia, promovendo conexões relevantes e mantendo as relações ativas antes, durante e depois dos encontros presenciais.</p>
            </div>
          </div>
        </section>
      </Container>

      {/* Masterclasses: full-width band */}
      <section className="py-16 md:py-20 bg-navy-800 text-white w-full">
        <Container>
          <h2 className="text-[clamp(1.8rem,4.5vw,2.8rem)] font-extrabold tracking-tight max-w-[20ch] mb-3.5">Para cada eixo, uma masterclass.</h2>
          <p className="text-navy-100 mt-3.5 max-w-[56ch] mb-10">
            Cria a tua conta para ver o programa completo, enviar perguntas aos palestrantes e reservar lugar em cada sessão.
          </p>
          <div className="grid gap-4.5">
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
                {/** leave it hidden */}
                <div className="text-[.82rem] hidden text-ink-muted font-semibold col-start-2 md:col-start-auto">
                  Com sessão iniciada
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── 8. Oradores e Mentores de Destaque ── */}
      <Container>
        <section className="py-16 md:py-20">
          <h2 className="text-[clamp(1.8rem,4.5vw,2.8rem)] font-extrabold tracking-tight max-w-[20ch] mb-11">Oradores e Mentores de Destaque</h2>
          <div className="mt-11 space-y-14">
            {MASTERCLASSES.map((masterclass, index) => {
              const isReversed = index % 2 === 1;
              return (
                <div key={masterclass.id} className={`grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] gap-8 md:gap-10 items-center ${isReversed ? 'md:grid-cols-[minmax(0,1fr)_200px]' : ''}`}>
                  <img src={IMAGES[index]} alt={masterclass.name} className={`w-[200px] h-[200px] rounded-full object-cover bg-surface-soft shadow-[0_0_0_5px_var(--color-surface),0_0_0_8px_var(--color-primary-500)] mx-auto md:mx-0 ${isReversed ? 'md:order-2 md:justify-self-end' : ''}`} />
                  <div className={isReversed ? 'md:text-right' : ''}>
                    <h3 className="text-2xl font-extrabold">{masterclass.name}</h3>
                    <div className="text-primary-500 font-semibold text-[.92rem] my-1">{masterclass.role}</div>
                    <p className="mt-2 text-[.95rem]"><b>Tema:</b> {masterclass.title}</p>
                    <p className="text-ink-muted mt-3">{BIOGRAPHIES[index].biography}</p>
                    {BIOGRAPHIES[index].works && (<p className="mt-3 text-[.88rem] text-ink-muted">{BIOGRAPHIES[index].works}</p>)}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </Container>

      {/* ── Os jovens tornam-se: full-width band ── */}
      <section className="py-16 md:py-20 bg-navy-800 text-white w-full">
        <Container>
          <h2 className="text-[clamp(1.8rem,4.5vw,2.8rem)] font-extrabold tracking-tight max-w-[20ch] mb-11">Com o Career Connect, os jovens tornam-se…</h2>
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
        </Container>
      </section>

      {/* ── Constrained ── */}
      <Container>
        {/* F-06: Torna-te mentor banner */}
        <section className="py-16 md:py-20">
          <div className="bg-primary-500 text-white rounded-card p-10 md:p-14 text-center">
            <h2 className="text-[clamp(1.8rem,4.5vw,2.6rem)] font-extrabold mb-4">És profissional? Torna-te mentor.</h2>
            <p className="text-primary-100 text-lg max-w-[45ch] mx-auto mb-6">Influencia a carreira de alguém. 40 min no dia, 1 a 3 mentorados depois do evento.</p>
            <Link to="/registo/mentor" className={`${BTN_BASE} !bg-primary-400`}>Candidatar-me como Mentor</Link>
          </div>
        </section>

        {/* Partners */}
        <section className="py-16 md:py-20">
          <h2 className="text-[clamp(1.8rem,4.5vw,2.8rem)] font-extrabold tracking-tight max-w-[20ch] text-center mx-auto mb-10">Os nossos parceiros.</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mt-10 items-center justify-items-center">
            {PARTNERS.map((partner, i) => (
              <div key={i} className="w-full max-w-[160px] h-24 flex items-center justify-center rounded-inner bg-white p-3 border border-line">
                <img src={partner.src} alt={partner.alt} className="max-h-full max-w-full object-contain" />
              </div>
            ))}
          </div>
        </section>

        {/* Venue + FAQ */}
        <section className="pt-5 pb-4 md:pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-9 items-start">
            <div>
              <h2 className="text-[clamp(1.8rem,4.5vw,2.8rem)] font-extrabold tracking-tight max-w-[20ch] mb-7">Perguntas Frequentes (FAQ)</h2>
              <div className="mt-7">
                {FAQS.map((item, i) => (
                  <details key={i} open={i === 0} className="border-b border-line py-4">
                    <summary className="font-semibold cursor-pointer">{item.q}</summary>
                    <p className="text-ink-muted mt-2.5">{item.a}</p>
                  </details>
                ))}
              </div>
            
            </div>

            <div className="bg-navy-800 text-white rounded-card p-8">
              <small className="text-primary-300 font-semibold block">Próxima Masterclass</small>
              <b className="block text-2xl mb-3.5 mt-0.5">Encontramo-nos no Hotel Cardoso</b>
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


        <div className="pb-16 md:pb-20">
          
             <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/registo" className={BTN_BASE}>Inscrever-me como Participante</Link>
                <Link to="/registo/mentor" className={`${BTN_BASE} ${BTN_GHOST}`}>Candidatar-me como Mentor</Link>
             </div>
              
        </div>

        {/* Footer */}
        <footer className="pt-8 pb-12 border-t border-line text-ink-muted text-sm">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <span>Career Connect® · Todos os direitos reservados</span>
            <span>Tecnicol · Maputo, Moçambique</span>
          </div>
        </footer>
      </Container>

      {/* Toast for copy link */}
      {shareOpen && (
        <div className="fixed left-1/2 bottom-24 -translate-x-1/2 bg-ink text-surface px-5.5 py-3 rounded-full font-semibold pointer-events-none z-20 transition-all duration-300 opacity-100 translate-y-0" role="status">
          Link copiado para a área de transferência
        </div>
      )}
    </div>
  );
}
