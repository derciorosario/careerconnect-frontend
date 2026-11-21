import React from 'react';
import {
  MENTEES, MENTORS, POLL_OPTIONS, MY_MENTEE_INDEX, MY_MENTOR_INDEX,
  ORGANIZER_TABS, formatTime, generateQrSvg, compatibilityScore,
} from './data';
import { PersonRow, ProgressBar, Card, AnnouncementInput } from './ui';

// ── ORGANIZER LIVE ───────────────────────────
export const OrganizerLive = ({
  phaseLabel, secondsLeft, currentRound, isPaused, isRehearsal,
  setIsRehearsal, setSecondsLeft, setIsPaused, showToast,
  advanceRound, restartSimulation, menteeForRound,
}) => (
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

// ── ORGANIZER REG ────────────────────────────
export const OrganizerReg = ({ hasPendingMentor, setHasPendingMentor, checkins, setCheckins, showToast }) => {
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

// ── ORGANIZER INTERACTION ────────────────────
export const OrganizerInteraction = ({ announcements, setAnnouncements, questions, pollVotes, totalPollVotes, showToast }) => (
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

// ── ORGANIZER REPORTS ────────────────────────
export const OrganizerReports = ({ furthestRoundCompleted, connections, checkins, mentorshipRequests, showToast }) => {
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

// ── PROFILE (shared) ─────────────────────────
export const ProfileScreen = ({ asRole, setRole, showToast }) => {
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

// ── TV / PROJECTOR ───────────────────────────
export const TvScreen = ({ announcements, phaseLabel, currentRound, secondsLeft, furthestRoundCompleted, connections, menteeForRound, setRole }) => {
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

// ── ORGANIZER LAYOUT (tabs wrapper) ──────────
export const OrganizerShell = ({ activeTab, setActiveTab, announcements, setRole, children }) => {
  const activeOrgTab = ORGANIZER_TABS.find((tab) => tab.key === activeTab) ? activeTab : 'live';
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
      {children}
    </div>
  );
};