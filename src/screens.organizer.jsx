import React, { useState, useEffect } from 'react';
import {
  formatTime, ORGANIZER_TABS, generateQrSvg,
} from './data';
import {
  ccGetOrganizerDashboard, ccGetOrganizerRegistrations, ccApproveMentor,
  ccGetOrganizerRounds, ccGetOrganizerReports, ccGetAnnouncements,
  ccCreateAnnouncement, ccGetQuestions, ccGetPolls, ccGetBadges,
} from './api/client';
import { PersonRow, ProgressBar, Card, AnnouncementInput } from './ui';

const MENTORS = [
  { name: 'Sara Cumbe',   role: 'Directora de Finanças',  company: 'Standard Bank',      area: 'Finanças e Banca' },
  { name: 'Nuno Bila',    role: 'Engenheiro de Software', company: 'Vodacom',            area: 'Tecnologia e TI' },
  { name: 'Carlos Tembe', role: 'Gestor de Marketing',    company: 'Grupo Madal',        area: 'Marketing e Comunicação' },
  { name: 'Ilda Mussa',   role: 'Advogada',               company: 'Mussa & Associados', area: 'Direito' },
  { name: 'Rui Machava',  role: 'Director de RH',         company: 'Vale Moçambique',    area: 'Recursos Humanos' },
  { name: 'Lídia Zimba',  role: 'Fundadora',              company: 'Zimba Agro',         area: 'Agricultura' },
];

const MENTEES = [
  { name: 'Ana Mondlane',     course: 'Gestão · UEM',                    goal: 'Escolher a minha área',          pitch: 'Quero descobrir que área seguir depois do curso.' },
  { name: 'Bruno Chissano',   course: 'Engenharia Informática · ISCTEM', goal: 'Preparar o primeiro estágio',    pitch: 'Procuro orientação para o meu primeiro estágio.' },
  { name: 'Cláudia Nhantumbo',course: 'Direito · UEM',                   goal: 'Construir a minha marca pessoal', pitch: 'Quero comunicar melhor o que sei fazer.' },
  { name: 'Dino Matola',      course: 'Economia · ISUTC',                goal: 'Desenvolver competências',       pitch: 'Quero reforçar a análise de dados.' },
  { name: 'Elsa Macie',       course: 'Agronomia · UEM',                 goal: 'Criar o meu negócio',            pitch: 'Tenho uma ideia de negócio agrícola.' },
  { name: 'Fátima Sitoe',     course: 'Marketing · ISCIM',               goal: 'Mudar de percurso',              pitch: 'Quero passar de vendas para marketing.' },
];

// ── ORGANIZER LIVE ───────────────────────────
export const OrganizerLive = ({
  phaseLabel, secondsLeft, currentRound, isPaused, isRehearsal,
  setIsRehearsal, setSecondsLeft, setIsPaused, showToast,
  advanceRound, restartSimulation,
}) => {
  const [rounds, setRounds] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [roundResp, annResp] = await Promise.all([
          ccGetOrganizerRounds(),
          ccGetAnnouncements({}),
        ]);
        setRounds(roundResp.data?.rounds || []);
        setAnnouncements(annResp.data?.announcements || []);
      } catch (err) {
        console.error('Failed to load organizer live data:', err);
      }
    };
    load();
  }, [showToast]);

  const current = rounds.find((r) => r.status === 'running') || rounds[rounds.length - 1] || null;

  return (
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
              const match = current?.matches?.[mentorIndex];
              const mentee = match?.mentees?.[0];
              return (
                <tr key={mentorIndex} className="border-b border-line last:border-0">
                  <td className="py-[11px] px-2"><b>{mentorIndex + 1}</b></td>
                  <td className="py-[11px] px-2">{mentor.name}</td>
                  <td className="py-[11px] px-2">{mentee?.name || '–'}</td>
                  <td className="py-[11px] px-2">{mentee ? '85%' : '–'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="text-[.85rem] text-ink-muted mt-3">Rácio 1:1 neste ensaio. O alerta dispara acima de 1:3.</p>
      </Card>
    </>
  );
};

// ── ORGANIZER REG ────────────────────────────
export const OrganizerReg = ({ showToast }) => {
  const [registrations, setRegistrations] = useState([]);
  const [pendingMentors, setPendingMentors] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [regResp] = await Promise.all([
          ccGetOrganizerRegistrations({}),
        ]);
        setRegistrations(regResp.data?.registrations || []);
        setPendingMentors((regResp.data?.registrations || []).filter((r) => r.user?.role === 'mentor' && r.status === 'registered'));
      } catch (err) {
        console.error('Failed to load registrations:', err);
      }
    };
    load();
  }, [showToast]);

  const rows = [
    ...MENTEES.map((m, i) => ({ id: `e${i}`, name: m.name, type: 'Mentorado' })),
    ...MENTORS.map((m, i) => ({ id: `m${i}`, name: m.name, type: 'Mentor' })),
  ];

  return (
    <>
      <Card>
        <div className="flex justify-between items-center"><b>Pendentes de aprovação</b></div>
        {pendingMentors.length > 0 ? (
          pendingMentors.map((r) => (
            <div key={r.id} className="flex justify-between items-center mt-3">
              <PersonRow name={r.user?.name || 'Mentor'} subtitle={r.user?.mentorProfile?.company || 'Empresa'} />
              <button onClick={() => { ccApproveMentor({ mentor_id: r.user_id, action: 'approve' }); showToast('Mentor aprovado. Recebe e-mail e WhatsApp.'); }} className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white">Aprovar</button>
            </div>
          ))
        ) : (
          <p className="text-[.85rem] text-success mt-2">Sem pendentes.</p>
        )}
      </Card>
      <Card>
        <div className="flex items-center justify-between mb-3.5">
          <b>Check-in ({registrations.filter((r) => r.status === 'present').length}/{rows.length})</b>
          <button onClick={() => showToast('Walk-in registado e presente.')} className="rounded-full font-bold text-[.76rem] h-[34px] px-3.5 bg-surface2 text-ink">+ Walk-in</button>
        </div>
        <table className="w-full text-[.88rem] border-collapse mt-1">
          <tbody>
            {rows.map((row) => {
              const reg = registrations.find((r) => r.user?.name === row.name);
              return (
                <tr key={row.id} className="border-b border-line last:border-0">
                  <td className="py-[11px] px-2">{row.name}</td>
                  <td className="py-[11px] px-2 text-ink-muted text-[.85rem]">{row.type}</td>
                  <td className="py-[11px] px-2 text-right">
                    <button
                      onClick={() => showToast(reg ? 'Check-in cancelado' : 'Check-in efetuado')}
                      className={`rounded-full font-bold text-[.76rem] h-[34px] px-3.5 ${reg?.status === 'present' ? 'bg-surface2 text-ink' : 'bg-primary-500 text-white'}`}
                    >
                      {reg?.status === 'present' ? 'Presente ✓' : 'Check-in'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
};

// ── ORGANIZER INTERACTION ────────────────────
export const OrganizerInteraction = ({ showToast }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [annResp, qResp, pResp] = await Promise.all([
          ccGetAnnouncements({}),
          ccGetQuestions({}),
          ccGetPolls({}),
        ]);
        setAnnouncements(annResp.data?.announcements || []);
        setQuestions(qResp.data?.questions || []);
        setPolls(pResp.data?.polls || []);
      } catch (err) {
        console.error('Failed to load interaction data:', err);
      }
    };
    load();
  }, [showToast]);

  const POLL_OPTIONS = ['Falta de experiência', 'Contactos', 'Competências', 'Orientação'];

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
        <Card>
          <b>Anúncio a todos</b>
          <AnnouncementInput onSubmit={(text) => {
            ccCreateAnnouncement({ event_id: 'current', body: text });
            setAnnouncements([...announcements, text]);
            showToast('Anúncio enviado a todos.');
          }} />
        </Card>
        <Card>
          <b>Perguntas para moderar</b>
          {questions.map((question, index) => (
            <p key={question.id || index} className="text-[.85rem] mt-2.5">▲ {question.votes || 0} · {question.body || question.text}</p>
          ))}
        </Card>
      </div>
      <Card>
        <div className="flex items-center justify-between mb-3.5"><b>Sondagem ao vivo</b></div>
        {polls.length > 0 ? (
          polls.map((poll) => (
            <div key={poll.id} className="mt-3">
              <div className="flex justify-between text-[.85rem] mb-1">
                <span>{poll.question}</span>
              </div>
              {(poll.options || []).map((opt, idx) => (
                <div key={idx} className="flex justify-between text-[.85rem] mt-1 gap-2.5">
                  <span className="min-w-[120px]">{opt}</span>
                  <div className="flex-1"><ProgressBar value={50} /></div>
                  <b>0</b>
                </div>
              ))}
            </div>
          ))
        ) : (
          POLL_OPTIONS.map((option, index) => (
            <div key={option} className="flex justify-between items-center text-[.85rem] mt-2.5 gap-2.5">
              <span className="min-w-[120px]">{option}</span>
              <div className="flex-1"><ProgressBar value={0} /></div>
              <b>0</b>
            </div>
          ))
        )}
      </Card>
    </>
  );
};

// ── ORGANIZER REPORTS ────────────────────────
export const OrganizerReports = ({ showToast }) => {
  const [reports, setReports] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await ccGetOrganizerReports();
        setReports(resp.data || null);
      } catch (err) {
        console.error('Failed to load reports:', err);
      }
    };
    load();
  }, [showToast]);

  const r = reports || {};
  const kpis = [
    { label: 'Inscritos', value: `${r.totalRegistrations || 0} / 120` },
    { label: 'Presença', value: `${r.presenceRate ? Math.round(r.presenceRate) : 0}%` },
    { label: 'Conversas', value: `${r.conversations || 0} (meta 8)` },
    { label: 'Interesse mútuo', value: `${r.mutualConnections || 0}` },
    { label: 'Mentorias ativas', value: r.mentorships || 0 },
    { label: 'Satisfação', value: `${r.avgRating ? r.avgRating.toFixed(1) : '0'} / 5` },
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

// ── PROFILE (shared) ─────────────────────────
export const ProfileScreen = ({ asRole, setRole, showToast }) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await ccGetProfile();
        setProfile(resp.data?.user || null);
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    };
    load();
  }, [showToast, asRole]);

  const person = profile || {};
  const subtitle = asRole === 'mentor' ? `${person.phone || person.mentorProfile?.job_title || ''}, ${person.mentorProfile?.company || ''}` : person.menteeProfile?.course || '';
  const fieldLabel = asRole === 'mentor' ? 'Áreas em que ajudas' : 'Pitch (120 caracteres)';
  const fieldValue = asRole === 'mentor' ? person.mentorProfile?.sector || '' : person.menteeProfile?.pitch || '';
  return (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Perfil</h2>
      <Card className="mt-4">
        <PersonRow name={person.name || 'Utilizador'} subtitle={subtitle} />
        <label className="block text-[.85rem] font-semibold mt-4 mb-1.5">{fieldLabel}</label>
        <input defaultValue={fieldValue} maxLength={120} className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 focus:border-primary-500 focus:outline-none" />
        <button onClick={() => showToast('Alterações guardadas. Valem a partir da próxima ronda.')} className="mt-3.5 rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white">Guardar</button>
      </Card>
      <button onClick={() => { setStoredToken(null); localStorage.removeItem('refresh_token'); localStorage.removeItem('userRole'); setRole(null); window.scrollTo(0, 0); }} className="w-full rounded-full font-bold text-[.92rem] h-12 bg-surface2 text-ink">Sair</button>
    </>
  );
};

// ── TV / PROJECTOR ───────────────────────────
export const TvScreen = ({ announcements, phaseLabel, currentRound, secondsLeft, showToast, setRole }) => {
  const [announcementsData, setAnnouncementsData] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await ccGetAnnouncements({});
        setAnnouncementsData(resp.data?.announcements || []);
      } catch (err) {
        console.error('Failed to load TV announcements:', err);
      }
    };
    load();
  }, [showToast]);

  const anns = announcementsData.length > 0 ? announcementsData : announcements;

  return (
    <div className="bg-navy-900 text-white min-h-screen pt-[calc(env(safe-area-inset-top,0px)+34px)] px-[5vw] pb-[34px]" style={{ background: 'radial-gradient(circle at 30% 10%, #172554 0%, #0b1126 70%)' }}>
      <div className="flex justify-between items-center">
        <span className="font-extrabold text-[1.35rem] italic tracking-tight leading-none">
          Career<i className="text-primary-500 not-italic">Connect</i>
        </span>
        <button onClick={() => { setStoredToken(null); localStorage.removeItem('refresh_token'); localStorage.removeItem('userRole'); setRole(null); window.scrollTo(0, 0); }} className="rounded-full font-bold text-[.82rem] h-10 px-4 text-white bg-white/10">Sair</button>
      </div>
      {anns.length > 0 && (
        <div className="bg-gradient-to-br from-primary-500 to-primary-400 text-white px-4 py-3 rounded-2xl mt-5 font-semibold text-[1.2rem] shadow-md">
          {anns[anns.length - 1].body || anns[anns.length - 1]}
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
              return (
                <div key={mentorIndex} className="bg-white/[.06] border border-white/[.08] rounded-[22px] p-5 backdrop-blur-md">
                  <span className="text-[.76rem] font-bold text-primary-300 uppercase tracking-wide">Mesa {mentorIndex + 1}</span>
                  <b className="block text-[1.1rem] mt-1.5">{mentor.name}</b>
                  <p className="text-navy-100 mt-1">–</p>
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
              <b className="text-[2rem] text-primary-500 block">0</b>
              <p className="text-navy-100">conversas hoje</p>
            </div>
            <div className="bg-white/[.06] border border-white/[.08] rounded-[22px] p-5 backdrop-blur-md">
              <b className="text-[2rem] text-primary-500 block">0</b>
              <p className="text-navy-100">conexões</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ── ORGANIZER LAYOUT (tabs wrapper) ──────────
export const OrganizerShell = ({ activeTab, setActiveTab, announcements, setRole, children }) => {
  const activeOrgTab = ORGANIZER_TABS.find((tab) => tab.key === activeTab) ? activeTab : 'live';
  return (
    <div className="max-w-[1040px] mx-auto pt-[18px] px-4 pb-10">
      <div className="flex justify-between items-center mb-3.5">
        <div className="font-extrabold text-[1.35rem] italic tracking-tight leading-none">
          Career<i className="text-primary-500 not-italic">Connect</i> <span className="text-ink-muted text-[.85rem] not-italic font-semibold">· Painel</span>
        </div>
        <button onClick={() => { setStoredToken(null); localStorage.removeItem('refresh_token'); localStorage.removeItem('userRole'); setRole(null); window.scrollTo(0, 0); }} className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-surface2 text-ink">Sair</button>
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
      {children}
    </div>
  );
};
