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

const MASTERCLASSES = [
  { id: 0, initials: 'VS', name: 'Vicente Sitoe', role: 'Director Geral da SDO Moçambique', theme: 'Acesso ao mercado', title: 'Estratégias para encontrar o primeiro passo', topics: [['Preparar-se', 'Desenvolver competências técnicas e comportamentais e aprofundar o autoconhecimento.'], ['Construir a rede', 'Utilizar plataformas de contacto, redes de contactos e preparar um currículo competitivo.'], ['Destacar-se', 'Preparar-se para entrevistas e comunicar as suas competências com confiança.']], question: 'Qual é o teu maior obstáculo na procura do primeiro passo?' },
  { id: 1, initials: 'AC', name: 'Arafat Cossa', role: 'Director da Arafat Executive Academy', theme: 'Competências e posicionamento', title: 'A arte de criar redes de contactos e transformar ligações em oportunidades', topics: [['Rede estratégica', 'Criar relações genuínas, assentes na confiança e na partilha de valor.'], ['Comunicação e marca pessoal', 'Apresentar-se e comunicar o seu valor com confiança.'], ['Ligações que geram oportunidades', 'Utilizar o LinkedIn, procurar mentoria e aproximar-se do mercado de trabalho.']], question: 'O que gostavas de saber dizer sobre ti em 30 segundos?' },
  { id: 2, initials: 'MC', name: 'Marlena Chambule', role: 'Directora Executiva da Salto Moçambique', theme: 'Integração e crescimento', title: 'O próximo passo depois da contratação: construir uma carreira de sucesso', topics: [['Adaptação', 'Compreender a cultura organizacional e integrar-se nas equipas.'], ['Postura e desempenho', 'Agir com ética, pontualidade e proactividade.'], ['Carreira sustentável', 'Definir objectivos, apostar na aprendizagem contínua e construir uma boa reputação.']], question: 'Que dúvida tens sobre os primeiros meses numa nova função?' },
];

const JOURNEY_STEPS = [
  { title: 'POTENCIAL', text: 'Descobre o teu potencial e aquilo que podes alcançar.' },
  { title: 'DIREÇÃO', text: 'Encontra orientação para definir os teus objetivos profissionais.' },
  { title: 'CONEXÃO', text: 'Liga-te a especialistas, mentores e profissionais experientes.' },
  { title: 'CAPACITAÇÃO', text: 'Adquire conhecimentos e desenvolve competências através das Masterclasses.' },
  { title: 'PRONTIDÃO', text: 'Ganha confiança e prepara-te para enfrentar os desafios do mercado.' },
  { title: 'OPORTUNIDADES', text: 'Amplia os teus horizontes e fica mais aberto a novas oportunidades profissionais, pois quem está capacitado sorri para o mercado.' },
];

const BTN_BASE   = 'inline-block rounded-full bg-primary-500 text-white font-semibold text-base px-7 py-3.5 cursor-pointer no-underline hover:brightness-110 transition';
const BTN_GHOST  = 'bg-transparent text-ink shadow-[inset_0_0_0_2px_var(--color-line)]';
const BTN_SM     = 'px-[18px] py-[9px] text-sm';
const FIELD_BASE = 'w-full font-normal text-base text-ink bg-surface border-2 border-line rounded-field px-3.5 py-3 focus:border-primary-500 focus:outline-none';

// Constrained content wrapper reused by every non-bleed section
const Container = ({ children }) => (
  <div className="max-w-[1080px] mx-auto px-[22px]">{children}</div>
);

export default function Landingpage() {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [shareOpen, setShareOpen] = useState(false);
  const [imagesReady, setImagesReady] = useState(false);
  const [activeJourney, setActiveJourney] = useState(null);
  const countdownInterval = useRef(null);

 const VB_W = 1000;
const VB_H = 220;
const TOOLTIP_W = 240;

const PAD_X = 40;
const Y_VALUES = [140, 70, 110, 80, 90, 50]; // keep your original heights
const STEP_X = (VB_W - PAD_X * 2) / (Y_VALUES.length - 1); // 184 → equal spacing

// x: 40, 224, 408, 592, 776, 960
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
                  <img src={mainLogo} alt="Career Connect" className="h-10 md:h-12 w-auto" />
              </Link>
               
            </div>
          </div>
        </header>

        <div className="pt-10 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_.8fr] gap-7.5 items-center">
            <div>
              <h1 className="text-[clamp(2.2rem,5.6vw,4rem)] font-extrabold tracking-tight max-w-[15ch] leading-[1.12]">O teu próximo passo começa numa ligação.</h1>
              <p className="max-w-[52ch] mt-5.5 mb-7.5 text-ink-muted text-lg">
                Uma imersão de percurso profissional, alta performance e conexões para jovens que querem entrar no mercado com confiança.
              </p>
              <Link to="/registo" className={BTN_BASE}>Garantir o meu lugar</Link>
             
             
            
            <div className="flex flex-wrap gap-y-2.5 gap-x-8.5 mt-8.5 max-md:bg-navy-800 max-md:text-white max-md:rounded-card max-md:p-8 max-md:gap-y-4 max-md:gap-x-6">
  <div>
    <b className="block text-[1.05rem]">4 de Dezembro de 2026</b>
    <span className="text-ink-muted max-md:text-navy-100 text-sm">às 14H00</span>
  </div>
  <div>
    <b className="block text-[1.05rem]">Hotel Cardoso</b>
    <span className="text-ink-muted max-md:text-navy-100 text-sm">Maputo</span>
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
        
         {/**  <div className="bg-surface-soft max-md:bg-white/10 rounded-count px-3.5 py-2.5 min-w-[68px] text-center">
            <b className="block text-[1.6rem] leading-none">{countdown.seconds}</b>
            <small className="text-ink-muted max-md:text-navy-100 text-[.72rem]">seg</small>
          </div> */}
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

        {/* ── Journey steps with curved SVG line and floating tooltip ── */}
<div className="mt-14">
  <div className="pt-28">
    {/* This wrapper is the positioning context, so percentages match the SVG exactly */}
    <div className="relative">
      <svg
        className="block w-full h-auto overflow-visible"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label="Percurso: Potencial, Direção, Conexão, Capacitação, Prontidão, Oportunidades"
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
  className="motion-safe:animate-[draw_2.6s_.3s_cubic-bezier(.6,0,.2,1)_forwards]"
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

        {/* F-02: O que ganhas */}
        <section className="py-16 md:py-20">
          <h2 className="text-[clamp(1.8rem,4.5vw,2.8rem)] font-extrabold tracking-tight max-w-[20ch] mb-10">O que ganhas no Career Connect</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5.5">
            {[
              { title: 'Encontrar um mentor', text: 'Profissionais aprovados que orientam a tua carreira antes, durante e depois do evento.' },
              { title: 'Fazer conexões profissionais', text: 'Rondas de 5 minutos com mentores e contacto direto com quem já está no mercado.' },
              { title: '8 conversas num só dia', text: 'Dois intervalos de 20 minutos com 4 rondas cada para conhecer vários mentores.' },
              { title: 'Dar o próximo passo', text: 'Pede mentoria, troca contactos e continua a ligação depois do evento.' },
            ].map((benefit, i) => (
              <div key={i} className="bg-surface-soft rounded-inner p-6">
                <div className="w-10 h-10 rounded-full bg-primary-500 text-white grid place-items-center font-extrabold mb-4">{i + 1}</div>
                <h3 className="text-[1.1rem] font-extrabold mb-2">{benefit.title}</h3>
                <p className="text-ink-muted text-[.88rem]">{benefit.text}</p>
              </div>
            ))}
          </div>
        </section>
      </Container>

      {/* ── F-04: full-width band ── */}
      <section className="py-16 md:py-20 bg-navy-800 text-white w-full">
        <Container>
          <h2 className="text-[clamp(1.8rem,4.5vw,2.8rem)] font-extrabold tracking-tight max-w-[20ch] mb-10">Como funcionam as ligações</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Regista-te', text: 'Cria a tua conta na landing principal em menos de 2 minutos e escolhe se és mentorado ou mentor.' },
              { step: '2', title: 'Conversa nos intervalos', text: 'Durante os dois intervalos de 20 minutos, falas com mentores em rondas de 5 minutos, numa mesa numerada.' },
              { step: '3', title: 'Continua a conexão', text: 'Marca "quero continuar", troca códigos ou pede mentoria e mantém a ligação depois do evento.' },
            ].map((step, i) => (
              <div key={i} className="relative pt-[52px]">
                <div className="absolute top-0 left-0 w-10 h-10 rounded-full bg-primary-500 text-white grid place-items-center font-extrabold">{step.step}</div>
                <h3 className="text-[1.15rem] font-extrabold mb-2">{step.title}</h3>
                <p className="text-navy-100 text-[.9rem]">{step.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Constrained ── */}
      <Container>
        {/* Duas formas de ligação */}
        <section className="py-16 md:py-20">
          <h2 className="text-[clamp(1.8rem,4.5vw,2.8rem)] font-extrabold tracking-tight max-w-[20ch] mb-10">Uma plataforma. Duas formas de ligação.</h2>
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
        </section>

        {/* Desafios */}
      
      <section className="py-16 md:py-20">
          <h2 className="text-[clamp(1.8rem,4.5vw,2.8rem)] font-extrabold tracking-tight max-w-[20ch] mb-10">A que desafios responde o Career Connect.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5.5 mt-10">
          {[
            { title: 'Acesso ao mercado', items: ['Dificuldade em conseguir o primeiro passo', 'Pouca experiência profissional', 'Preparação insuficiente para entrevistas'] },
            { title: 'Competências e posicionamento', items: ['Dificuldade em comunicar competências', 'Marca pessoal e rede de contactos por construir', 'Dificuldade em demonstrar o seu valor'] },
            { title: 'Integração e crescimento', items: ['Adaptação ao ambiente profissional', 'Gestão do desempenho', 'Planeamento de uma carreira sustentável'] },
          ].map((card, i) => (
            <div key={i} className="bg-surface-soft rounded-inner p-6.5">
              <h3 className="text-[1.1rem] font-extrabold mb-3">{card.title}</h3>
              <ul className="m-0 pl-0 text-ink-muted space-y-1.5">
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
      </Container>

      {/* Masterclasses: full-width band */}
      <section className="py-16 md:py-20 bg-navy-800 text-white w-full">
        <Container>
          <h2 className="text-[clamp(1.8rem,4.5vw,2.8rem)] font-extrabold tracking-tight max-w-[20ch] mb-3.5">Para cada desafio, uma masterclass.</h2>
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

      {/* Quem te vai orientar */}
      <Container>
        <section className="py-16 md:py-20">
          <h2 className="text-[clamp(1.8rem,4.5vw,2.8rem)] font-extrabold tracking-tight max-w-[20ch] mb-11">Quem te vai orientar.</h2>
          <div className="mt-11 space-y-14">
            {MASTERCLASSES.map((masterclass, index) => {
              const isReversed = index % 2 === 1;
              return (
                <div key={masterclass.id} className={`grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] gap-8 md:gap-10 items-center ${isReversed ? 'md:grid-cols-[minmax(0,1fr)_200px]' : ''}`}>
                  <img src={IMAGES[index]} alt={masterclass.name} className={`w-[200px] h-[200px] rounded-full object-cover bg-surface-soft shadow-[0_0_0_5px_var(--color-surface),0_0_0_8px_var(--color-primary-500)] mx-auto md:mx-0 ${isReversed ? 'md:order-2 md:justify-self-end' : ''}`} />
                  <div className={isReversed ? 'md:text-right' : ''}>
                    <div className="text-[.78rem] font-semibold text-primary-500">{masterclass.theme}</div>
                    <h3 className="text-2xl font-extrabold">{masterclass.name}</h3>
                    <div className="text-primary-500 font-semibold text-[.92rem] my-1">{masterclass.role}</div>
                    <p className="text-ink-muted">{BIOGRAPHIES[index].biography}</p>
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
            <Link to="/mentor" className={`${BTN_BASE} !bg-primary-400`}>Registar como mentor</Link>
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
        <section className="pt-5 pb-16 md:pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-9 items-start">
            <div>
              <h2 className="text-[clamp(1.8rem,4.5vw,2.8rem)] font-extrabold tracking-tight max-w-[20ch] mb-7">Encontramo-nos no Hotel Cardoso.</h2>
              <div className="mt-7">
              {[
                { q: 'Para quem é o Career Connect?', a: 'Para jovens que querem preparar-se para o primeiro passo profissional e ligar-se a oportunidades reais.' },
                { q: 'O que acontece no encontro presencial?', a: 'Masterclasses, experiências práticas e momentos organizados para criar redes de contactos entre estudantes e profissionais experientes.' },
                { q: 'Sair do evento garante-me trabalho? Não…', a: 'O Career Connect foca-se no percurso e na orientação de carreira, não na colocação direta de emprego.' },
                { q: 'Como reservo lugar nas masterclasses?', a: 'Cria a tua conta na secção de registo, inicia sessão e reserva cada masterclass na tua área pessoal.' },
              ].map((item, i) => (
                <details key={i} open={i === 0} className="border-b border-line py-4">
                  <summary className="font-semibold cursor-pointer">{item.q}</summary>
                  <p className="text-ink-muted mt-2.5">{item.a}</p>
                </details>
              ))}
              </div>
              <div className="mt-8">
                <Link to="/registo" className={BTN_BASE}>Garantir o meu lugar</Link>
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