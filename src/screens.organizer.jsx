import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Html5Qrcode } from 'html5-qrcode';
import { jsPDF } from 'jspdf';
import {
  formatTime, ORGANIZER_TABS,
} from './data';
import {
  ccGetOrganizerDashboard, ccGetOrganizerRegistrations, ccApproveMentor,
  ccGetOrganizerRounds, ccGetOrganizerReports, ccGetAnnouncements,
  ccCreateAnnouncement, ccGetQuestions, ccGetPolls, ccGetBadges,
  ccGetProfile, ccUpdateProfile, uploadClient,
  ccCheckIn, ccCancelCheckIn, ccWalkIn,
  ccCreatePoll, ccModerateQuestion,
  ccGetTVData, ccGetPollResults,
  ccGenerateMatches, ccGetAllUsers,
  setStoredToken,
  isNative,
  ccCreateRound, ccUpdateRound, ccDeleteRound,
} from './api/client';
import { PersonRow, ProgressBar, Card, AnnouncementInput, Avatar } from './ui';

// ── skeleton primitives ──────────────────────
const SkeletonBar = ({ w = '100%', h = 14, r = 7, className = '', style }) => (
  <div
    className={`animate-pulse bg-surface2 ${className}`}
    style={{ width: w, height: h, borderRadius: r, ...style }}
    aria-hidden="true"
  />
);

const SkeletonPersonRow = () => (
  <div className="flex items-center gap-3" aria-hidden="true">
    <div className="animate-pulse bg-surface2 rounded-full" style={{ width: 44, height: 44 }} />
    <div className="flex-1 space-y-2">
      <SkeletonBar w="55%" h={13} />
      <SkeletonBar w="35%" h={11} />
    </div>
  </div>
);

import logo from './assets/logo.png';

const MENTORS = [
  { name: 'Sara Cumbe',   role: 'Directora de Finanças',  company: 'Standard Bank',      area: 'Finanças e Banca' },
  { name: 'Nuno Bila',    role: 'Engenheiro de Software', company: 'Vodacom',            area: 'Tecnologia e TI' },
  { name: 'Carlos Tembe', role: 'Gestor de Marketing',    company: 'Grupo Madal',        area: 'Marketing e Comunicação' },
  { name: 'Ilda Mussa',   role: 'Advogada',               company: 'Mussa & Associados', area: 'Direito' },
  { name: 'Rui Machava',  role: 'Director de RH',         company: 'Vale Moçambique',    area: 'Recursos Humanos' },
  { name: 'Lídia Zimba',  role: 'Fundadora',              company: 'Zimba Agro',         area: 'Agricultura' },
];

// ── ORGANIZER LIVE ───────────────────────────
export const OrganizerLive = ({
  phaseLabel, secondsLeft, currentRound, isPaused, isRehearsal,
  setIsRehearsal, setSecondsLeft, setIsPaused, showToast,
  advanceRound, handlePause, restartSimulation,
}) => {
  const [rounds, setRounds] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [usersById, setUsersById] = useState({});

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [roundResp, annResp, usersResp] = await Promise.all([
          ccGetOrganizerRounds(),
          ccGetAnnouncements({}),
          ccGetAllUsers(),
        ]);
        if (!active) return;
        setRounds(roundResp.data?.rounds || []);
        setAnnouncements(annResp.data?.announcements || []);
        const byId = {};
        (usersResp.data?.users || []).forEach((u) => { byId[u.id] = u; });
        setUsersById(byId);

        // Auto-generate matches if a round is running but has none
        const running = (roundResp.data?.rounds || []).find((r) => r.status === 'running');
        if (running && (!running.matches || running.matches.length === 0)) {
          try {
            await ccGenerateMatches({});
            if (active) {
              const refreshed = await ccGetOrganizerRounds();
              setRounds(refreshed.data?.rounds || []);
            }
          } catch {
            // Non-blocking
          }
        }
      } catch (err) {
        console.error('Failed to load organizer live data:', err);
      }
    };
    load();
    const interval = setInterval(load, 2000);
    return () => { active = false; clearInterval(interval); };
  }, []); // 👈 stable deps — interval + one initial load only

  const current = rounds.find((r) => r.status === 'running') || rounds[rounds.length - 1] || null;

  // Deduplicate matches by table_no so the same table is never rendered twice.
  // Keeps the first occurrence for a given table (entries are already ordered).
  const uniqueMatches = (() => {
    const seen = new Set();
    const out = [];
    (current?.matches || []).forEach((match, index) => {
      const key = match.table_no != null ? `t-${match.table_no}` : `i-${match.id ?? index}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push(match);
    });
    return out;
  })();

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
              onClick={handlePause}
              disabled={currentRound < 1 || currentRound > 4}
              className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-surface2 text-ink disabled:opacity-40"
            >
              {isPaused ? 'Retomar' : 'Pausar'}
            </button>
            <button
              onClick={async () => {
                try {
                  await ccGenerateMatches({});
                  showToast('Pares gerados.');
                } catch (err) {
                  showToast(err.response?.data?.message || 'Erro ao gerar pares.');
                }
              }}
              className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-600 text-white"
            >
              Gerar pares
            </button>
            <button
              onClick={restartSimulation}
              className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-red-600 text-white"
            >
              Terminar
            </button>
          </div>
          <label className="flex gap-2.5 items-center text-[.85rem] mt-4 hidden">
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
              <th className="text-left text-[.76rem] uppercase tracking-wide text-ink-muted font-semibold py-[11px] px-2 border-b border-line">Mentorados</th>
              <th className="text-left text-[.76rem] uppercase tracking-wide text-ink-muted font-semibold py-[11px] px-2 border-b border-line">Compat.</th>
            </tr>
          </thead>
          <tbody>
            {uniqueMatches.length > 0 ? (
              uniqueMatches.map((match, matchIndex) => {
                const menteeIds = Array.isArray(match.mentee_ids) ? match.mentee_ids : [];
                const menteeNames = menteeIds.map((id) => usersById[id]?.name || `Utilizador ${id.slice(0, 4)}`).join(', ');
                return (
                  <tr key={match.table_no != null ? `t-${match.table_no}` : (match.id || matchIndex)} className="border-b border-line last:border-0">
                    <td className="py-[11px] px-2"><b>{match.table_no || matchIndex + 1}</b></td>
                    <td className="py-[11px] px-2">{match.mentor?.name || '–'}</td>
                    <td className="py-[11px] px-2 text-[.82rem]">{menteeNames || '–'}</td>
                    <td className="py-[11px] px-2">{menteeIds.length > 0 ? `${match.score || 85}%` : '–'}</td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan="4" className="py-3 text-center text-ink-muted text-[.85rem]">Sem pares nesta ronda.</td></tr>
            )}
          </tbody>
        </table>
        <p className="text-[.85rem] text-ink-muted mt-3">Rácio 1:1 neste ensaio. O alerta dispara acima de 1:3.</p>
      </Card>
    </>
  );
};

// ── REGISTRATION DETAILS DIALOG ────────────────
const RegistrationDetailsDialog = ({ reg, onClose }) => {
  const user = reg?.user || {};
  const isMentor = user.role === 'mentor';
  const profile = isMentor ? user.mentorProfile : user.menteeProfile;
  const profileLabel = isMentor ? 'Perfil de mentor' : 'Perfil de mentorado';

  const rows = [
    { label: 'Nome', value: user.name || '–' },
    { label: 'E-mail', value: user.email || '–' },
    { label: 'Telefone', value: user.phone || '–' },
    { label: 'Perfil', value: isMentor ? 'Mentor' : 'Mentorado' },
    { label: 'Bilhete', value: reg?.ticket_code || '–' },
    { label: 'Estado', value: reg?.status || '–' },
    { label: 'Check-in', value: reg?.checked_in_at ? new Date(reg.checked_in_at).toLocaleString('pt-PT') : 'Não feito' },
    { label: 'LinkedIn', value: user.linkedin_url || '–' },
  ];

  const profileRows = [];
  if (isMentor && profile) {
    profileRows.push(
      { label: 'Cargo', value: profile.job_title || '–' },
      { label: 'Empresa', value: profile.company || '–' },
      { label: 'Setor', value: profile.sector || '–' },
      { label: 'Anos de experiência', value: profile.years != null ? String(profile.years) : '–' },
      { label: 'Tipo de apoio', value: profile.support_type || '–' },
      { label: 'Áreas de ajuda', value: Array.isArray(profile.interests) ? profile.interests.join(', ') || '–' : '–' },
      { label: 'Aprovação', value: profile.approval || '–' }
    );
  } else if (!isMentor && profile) {
    profileRows.push(
      { label: 'Situação', value: profile.level || '–' },
      { label: 'Curso', value: profile.course || '–' },
      { label: 'Instituição', value: profile.institution || '–' },
      { label: 'Áreas de interesse', value: Array.isArray(profile.interests) ? profile.interests.join(', ') || '–' : '–' },
      { label: 'Objetivo', value: profile.goal || '–' },
      { label: 'Pitch', value: profile.pitch || '–' }
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface rounded-[24px] p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[1.1rem] font-extrabold">Detalhes da inscrição</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface2 text-ink flex items-center justify-center hover:bg-primary-500 hover:text-white transition">
            ✕
          </button>
        </div>
        <div className="flex flex-col items-center mb-6">
          <Avatar name={user.name || 'Participante'} photoUrl={user.photo_url} size="lg" variant="orange" />
          <span className="mt-2.5 text-[.9rem] font-bold">{user.name || 'Participante'}</span>
          <span className="text-ink-muted text-[.8rem]">{user.role === 'mentor' ? 'Mentor' : 'Mentorado'}</span>
        </div>
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.label} className="flex justify-between text-[.85rem]">
              <span className="text-ink-muted">{r.label}</span>
              <span className="text-ink whitespace-nowrap">{r.value}</span>
            </div>
          ))}
        </div>
        {profileRows.length > 0 && (
          <div className="mt-6 pt-4 border-t border-line">
            <h4 className="text-[.8rem] font-bold text-primary-300 uppercase tracking-wide mb-3">{profileLabel}</h4>
            <div className="space-y-2">
              {profileRows.map((r) => (
                <div key={r.label} className="flex justify-between text-[.85rem]">
                  <span className="text-ink-muted">{r.label}</span>
                  <span className="text-ink whitespace-nowrap">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── ORGANIZER REG ────────────────────────────
export const OrganizerReg = ({ showToast }) => {
  const [registrations, setRegistrations] = useState([]);
  const [pendingMentors, setPendingMentors] = useState([]);
  const [actionLoading, setActionLoading] = useState({});
  const [search, setSearch] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [selectedReg, setSelectedReg] = useState(null);

  const qrScannerRef = useRef(null);
  const handledRef = useRef(false);          // prevents duplicate decode callbacks
  const registrationsRef = useRef([]);       // always-fresh registrations for the scan callback
  const scanHandlerRef = useRef(null);       // always-fresh scan handler

  registrationsRef.current = registrations;

  useEffect(() => {
    const load = async () => {
      try {
        const regResp = await ccGetOrganizerRegistrations({});
        const regs = regResp.data?.registrations || [];
        setRegistrations(regs);
        setPendingMentors(
          regs.filter((r) => r.user?.role === 'mentor' && r.user?.mentorProfile?.approval === 'pending')
        );
      } catch (err) {
        console.error('Failed to load registrations:', err);
      }
    };
    load();
  }, [showToast]);

  // ── Start/stop the camera AFTER the #reader element is in the DOM ──
  useEffect(() => {
    if (!scanning) return undefined;

    handledRef.current = false;
    setScanError(null);

    const scanner = new Html5Qrcode('reader'); // #reader exists now (overlay rendered)
    qrScannerRef.current = scanner;

    const startPromise = scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        if (handledRef.current) return;
        handledRef.current = true;
        scanHandlerRef.current?.(decodedText);
      },
      () => {
        // per-frame "no QR found" errors, ignore
      }
    );

    startPromise.catch((e) => {
      console.error('Scanner start failed:', e);
      setScanError('Não foi possível aceder à câmara. Verifique as permissões.');
    });

    return () => {
      startPromise
        .then(() => scanner.stop())
        .catch(() => {})
        .then(() => {
          try { scanner.clear(); } catch { /* ignore */ }
        });
      qrScannerRef.current = null;
    };
  }, [scanning]);

  const filteredRegs = registrations.filter((reg) =>
    (reg.user?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleCheckIn = async (reg) => {
    if (!reg) return;
    setActionLoading((p) => ({ ...p, [reg.id]: true }));
    try {
      if (reg.status === 'present') {
        await ccCancelCheckIn({ registration_id: reg.id });
        setRegistrations((prev) => prev.map((r) => (r.id === reg.id ? { ...r, status: 'cancelled' } : r)));
        showToast('Check-in cancelado.');
      } else {
        await ccCheckIn({ user_id: reg.user_id });
        setRegistrations((prev) => prev.map((r) => (r.id === reg.id ? { ...r, status: 'present' } : r)));
        showToast('Check-in efetuado.');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Erro no check-in.');
    } finally {
      setActionLoading((p) => { const { [reg.id]: _, ...rest } = p; return rest; });
    }
  };

  const handleWalkIn = async () => {
    const name = window.prompt('Nome do walk-in:');
    if (!name) return;
    const role = window.prompt('Perfil (mentee/mentor):', 'mentee') || 'mentee';
    try {
      await ccWalkIn({ name, role });
      showToast('Walk-in registado e presente.');
      const regResp = await ccGetOrganizerRegistrations({});
      setRegistrations(regResp.data?.registrations || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Erro ao registar walk-in.');
    }
  };

  const startScanner = () => {
    setScanError(null);
    setScanning(true); // overlay renders -> effect above starts the camera
  };

  const stopScanner = () => {
    setScanning(false); // effect cleanup stops the camera
  };

  const handleScanResult = async (decodedText) => {
    // Close overlay (cleanup stops the camera)
    setScanning(false);

    let ticketCode = (decodedText || '').trim();
    try {
      const url = new URL(ticketCode);
      ticketCode = url.searchParams.get('ticket_code') || ticketCode;
    } catch {
      // not a URL, use as-is
    }

    if (!ticketCode) {
      showToast('Código de bilhete inválido.');
      return;
    }

    const reg = registrationsRef.current.find((r) => r.ticket_code === ticketCode);
    if (!reg) {
      showToast('Bilhete não encontrado nos registos.');
      return;
    }
    if (reg.status === 'present') {
      showToast(`${reg.user?.name || 'Participante'} já está presente.`);
      return;
    }
    await handleCheckIn(reg);
  };
  scanHandlerRef.current = handleScanResult;

  const renderScanner = () => (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={stopScanner}
          className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center backdrop-blur-sm hover:bg-white/20 transition"
        >
          ✕
        </button>
      </div>
      <div className="max-w-[400px] w-full bg-surface rounded-[24px] p-6 shadow-2xl relative">
        <h3 className="text-[1.1rem] font-extrabold mb-1">Escanear bilhete</h3>
        <p className="text-[.8rem] text-ink-muted mb-4">Aponte a câmara ao QR code do bilhete</p>
        <div id="reader" className="w-full aspect-square bg-black rounded-[16px] overflow-hidden mx-auto" />
        {scanError && (
          <div className="mt-3 p-3 rounded-lg bg-red-500/10 text-red-500 text-[.8rem] text-center">
            {scanError}
          </div>
        )}
        <div className="mt-4 text-[.78rem] text-ink-muted text-center">
          {isNative ? 'Câmara nativa' : 'Câmara do navegador'}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Card>
        <div className="flex justify-between items-center"><b>Pendentes de aprovação</b></div>
        {pendingMentors.length > 0 ? (
          pendingMentors.map((r) => (
            <div key={r.id} className="flex justify-between items-center mt-3">
              <PersonRow name={r.user?.name || 'Mentor'} subtitle={r.user?.mentorProfile?.company || '-'} photoUrl={r.user?.photo_url} />
              <button
                onClick={async () => {
                  try {
                    await ccApproveMentor({ mentor_id: r.user_id, action: 'approve' });
                    setPendingMentors((prev) => prev.filter((x) => x.id !== r.id));
                    showToast('Mentor aprovado.');
                  } catch (err) {
                    showToast(err.response?.data?.message || 'Erro ao aprovar.');
                  }
                }}
                className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white"
              >
                Aprovar
              </button>
            </div>
          ))
        ) : (
          <p className="text-[.85rem] text-success mt-2">Sem pendentes.</p>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3.5 gap-2">
          <b>Check-in ({registrations.filter((r) => r.status === 'present').length}/{registrations.length})</b>
          <button
            onClick={startScanner}
            disabled={scanning}
            className="rounded-full font-bold text-[.76rem] h-[34px] px-3.5 bg-primary-500 text-white disabled:opacity-50"
          >
            Escanear QR
          </button>
          {/** Leave it hidden */}
          <button onClick={handleWalkIn} className="rounded-full hidden font-bold text-[.76rem] h-[34px] px-3.5 bg-surface2 text-ink">
            + Walk-in
          </button>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por nome..."
          className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-2.5 mb-2 focus:border-primary-500 focus:outline-none"
        />
       

       <div className="mt-1 max-h-[60vh] overflow-auto rounded-[14px] border border-line">
  <table className="w-full min-w-[640px] text-[.88rem] border-collapse">
    <thead className="sticky top-0 z-10 bg-surface">
      <tr>
        <th className="text-left text-[.76rem] uppercase tracking-wide text-ink-muted font-semibold py-[11px] px-2 border-b border-line">Nome</th>
        <th className="text-left text-[.76rem] uppercase tracking-wide text-ink-muted font-semibold py-[11px] px-2 border-b border-line">Perfil</th>
        <th className="text-left text-[.76rem] uppercase tracking-wide text-ink-muted font-semibold py-[11px] px-2 border-b border-line">Bilhete</th>
        <th className="text-right text-[.76rem] uppercase tracking-wide text-ink-muted font-semibold py-[11px] px-2 border-b border-line">Estado</th>
        <th className="text-right text-[.76rem] uppercase tracking-wide text-ink-muted font-semibold py-[11px] px-2 border-b border-line">Ações</th>
      </tr>
    </thead>
    <tbody>
      {filteredRegs.map((reg) => (
        <tr key={reg.id} className="border-b border-line last:border-0">
          <td className="py-[11px] px-2" onClick={() => setSelectedReg(reg)} style={{ cursor: 'pointer' }}>
            <div className="flex items-center gap-2">
              <Avatar name={reg.user?.name || 'Participante'} photoUrl={reg.user?.photo_url} />
              <span className="whitespace-nowrap text-[.82rem]">{reg.user?.name || '–'}</span>
            </div>
          </td>
          <td className="py-[11px] px-2 text-ink-muted text-[.85rem]">{reg.user?.role === 'mentor' ? 'Mentor' : 'Mentorado'}</td>
          <td className="py-[11px] px-2 text-[.82rem] font-mono text-ink-muted">{reg.ticket_code || '–'}</td>
          <td className="py-[11px] px-2 text-right">
            <button
              onClick={() => handleCheckIn(reg)}
              disabled={actionLoading[reg.id]}
              className={`rounded-full font-bold text-[.76rem] h-[34px] px-3.5 whitespace-nowrap ${reg.status === 'present' ? 'bg-surface2 text-ink' : 'bg-primary-500 text-white'} disabled:opacity-50`}
            >
              {actionLoading[reg.id] ? '...' : reg.status === 'present' ? 'Presente ✓' : 'Check-in'}
            </button>
          </td>
          <td className="py-[11px] px-2 text-right">
            {reg.status === 'present' && (
              <button
                onClick={() => handleCheckIn(reg)}
                disabled={actionLoading[reg.id]}
                className="rounded-full font-bold text-[.76rem] h-[34px] px-3.5 bg-red-500 text-white disabled:opacity-50 ml-2 whitespace-nowrap"
              >
                Cancelar check-in
              </button>
            )}
          </td>
        </tr>
      ))}
      {filteredRegs.length === 0 && (
        <tr><td colSpan="5" className="py-3 text-center text-ink-muted text-[.85rem]">Sem registos.</td></tr>
      )}
    </tbody>
  </table>
</div>


      </Card>

      {scanning && renderScanner()}
      {selectedReg && (
        <RegistrationDetailsDialog reg={selectedReg} onClose={() => setSelectedReg(null)} />
      )}
    </>
  );
};

// ── ORGANIZER INTERACTION ────────────────────
export const OrganizerInteraction = ({ showToast }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [polls, setPolls] = useState([]);
  const [pollResults, setPollResults] = useState({});
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollOptions, setNewPollOptions] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [annResp, qResp, pResp] = await Promise.all([
          ccGetAnnouncements({}),
          ccGetQuestions({ status: 'all' }),
          ccGetPolls({}),
        ]);
        if (!active) return;
        setAnnouncements(annResp.data?.announcements || []);
        setQuestions(qResp.data?.questions || []);
        const loadedPolls = pResp.data?.polls || [];
        setPolls(loadedPolls);
        // Fetch live results for each poll
        const resultsEntries = await Promise.all(
          loadedPolls.map(async (poll) => {
            try {
              const rResp = await ccGetPollResults({ poll_id: poll.id });
              return [poll.id, rResp.data?.results || []];
            } catch {
              return [poll.id, []];
            }
          })
        );
        if (active) setPollResults(Object.fromEntries(resultsEntries));
      } catch (err) {
        console.error('Failed to load interaction data:', err);
      }
    };
    load();
    const interval = setInterval(load, 6000);
    return () => { active = false; clearInterval(interval); };
  }, [showToast]);

  const POLL_OPTIONS = ['Falta de experiência', 'Contactos', 'Competências', 'Orientação'];

  return (
    <>
      <div className="grid __grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
        {/** <Card>
          <b>Anúncio a todos</b>
          <AnnouncementInput onSubmit={async (text) => {
            try {
              const resp = await ccCreateAnnouncement({ event_id: 'current', body: text });
              const ann = resp.data?.announcement;
              setAnnouncements([...(ann ? [ann] : []), ...announcements]);
              showToast('Anúncio enviado a todos.');
            } catch (err) {
              showToast(err.response?.data?.message || 'Erro ao enviar anúncio.');
            }
          }} />
        </Card> */}
        <Card>
          <b>Perguntas para moderar</b>
          {questions.map((question, index) => (
            <div key={question.id || index} className="flex justify-between items-center mt-2.5 gap-2.5">
              <p className="text-[.85rem] flex-1">▲ {question.votes || 0} · {question.body || question.text}</p>
              {question.status !== 'visible' && (
                <button
                  onClick={async () => {
                    try {
                      await ccModerateQuestion({ question_id: question.id, status: 'visible' });
                      setQuestions((prev) => prev.map((q, i) => i === index ? { ...q, status: 'visible' } : q));
                      showToast('Pergunta visível.');
                    } catch (err) {
                      showToast(err.response?.data?.message || 'Erro ao moderar.');
                    }
                  }}
                  className="rounded-full font-bold text-[.72rem] h-[30px] px-3 bg-primary-500 text-white"
                >
                  Mostrar
                </button>
              )}
              {question.status === 'visible' && (
                <button
                  onClick={async () => {
                    try {
                      await ccModerateQuestion({ question_id: question.id, status: 'hidden' });
                      setQuestions((prev) => prev.map((q, i) => i === index ? { ...q, status: 'hidden' } : q));
                      showToast('Pergunta oculta.');
                    } catch (err) {
                      showToast(err.response?.data?.message || 'Erro ao moderar.');
                    }
                  }}
                  className="rounded-full font-bold text-[.72rem] h-[30px] px-3 bg-surface2 text-ink"
                >
                  Ocultar
                </button>
              )}
            </div>
          ))}
          {questions.length === 0 && (
            <p className="text-[.85rem] text-ink-muted mt-2">Sem perguntas ainda.</p>
          )}
        </Card>
      </div>
      <Card>
        <div className="flex items-center justify-between mb-3.5"><b>Sondagem ao vivo</b></div>
        {polls.length > 0 ? (
          polls.map((poll) => {
            const results = pollResults[poll.id] || [];
            const totalVotes = results.reduce((sum, r) => sum + (r.votes || 0), 0);
            return (
              <div key={poll.id} className="mt-3">
                <div className="flex justify-between text-[.85rem] mb-1">
                  <span>{poll.question}</span>
                  <span className="text-[.76rem] text-ink-muted">{totalVotes} votos</span>
                </div>
                {(poll.options || []).map((opt, idx) => {
                  const found = results.find((r) => r.index === idx);
                  const votes = found ? (found.votes || 0) : 0;
                  const pct = totalVotes ? Math.round((votes / totalVotes) * 100) : 0;
                  return (
                    <div key={idx} className="flex justify-between text-[.85rem] mt-1 gap-2.5 items-center">
                      <span className="min-w-[120px] flex-1">{typeof opt === 'object' ? opt.option : opt}</span>
                      <div className="w-[120px]"><ProgressBar value={pct} /></div>
                      <b className="w-[70px] text-right">{pct}%</b>
                    </div>
                  );
                })}
              </div>
            );
          })
        ) : (
          POLL_OPTIONS.map((option) => (
            <div key={option} className="flex justify-between items-center text-[.85rem] mt-2.5 gap-2.5">
              <span className="min-w-[120px]">{option}</span>
              <div className="flex-1"><ProgressBar value={0} /></div>
              <b>0</b>
            </div>
          ))
        )}
        <div className="mt-4 pt-3 border-t border-line">
          <b className="text-[.85rem] block mb-2">Criar sondagem</b>
          <input value={newPollQuestion} onChange={(e) => setNewPollQuestion(e.target.value)} placeholder="Pergunta da sondagem" className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-2.5 mb-2 focus:border-primary-500 focus:outline-none" />
          <input value={newPollOptions} onChange={(e) => setNewPollOptions(e.target.value)} placeholder="Opções separadas por vírgula" className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-2.5 mb-2 focus:border-primary-500 focus:outline-none" />
          <button
            onClick={async () => {
              if (!newPollQuestion.trim() || !newPollOptions.trim()) {
                showToast('Preenche a pergunta e as opções.');
                return;
              }
              setCreating(true);
              try {
                const options = newPollOptions.split(',').map((o) => o.trim()).filter(Boolean);
                const resp = await ccCreatePoll({ question: newPollQuestion.trim(), options });
                setPolls((prev) => [resp.data?.poll, ...prev]);
                setNewPollQuestion('');
                setNewPollOptions('');
                showToast('Sondagem criada.');
              } catch (err) {
                showToast(err.response?.data?.message || 'Erro ao criar sondagem.');
              } finally {
                setCreating(false);
              }
            }}
            disabled={creating}
            className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white disabled:opacity-50"
          >
            {creating ? 'A criar...' : 'Criar sondagem'}
          </button>
        </div>
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

  const exportExcel = () => {
    try {
      const wsData = [
        ['Career Connect - Relatório'],
        [''],
        ['Indicador', 'Valor'],
        ['Inscritos', r.totalRegistrations || 0],
        ['Presença (%)', r.presenceRate ? Math.round(r.presenceRate) : 0],
        ['Conversas', r.conversations || 0],
        ['Interesse mútuo', r.mutualConnections || 0],
        ['Mentorias ativas', r.mentorships || 0],
        ['Satisfação (/5)', r.avgRating ? r.avgRating.toFixed(1) : 0],
        ['Total inquéritos', r.totalSurveys || 0],
        [''],
        ['Oferta e procura por área', ''],
        ['Área', 'Oferta (%)', 'Procura (%)'],
        ...areaSupplyDemand.map((a) => [a.area, a.supply, a.demand]),
      ];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Relatorio');
      XLSX.writeFile(wb, 'career-connect-relatorio.xlsx');
      showToast('Relatório Excel exportado.');
    } catch (err) {
      showToast('Erro ao exportar Excel.');
      console.error(err);
    }
  };

  const exportPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 20;
      doc.setFontSize(18);
      doc.text('Career Connect - Relatório', 20, y);
      y += 15;
      doc.setFontSize(12);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-PT')}`, 20, y);
      y += 15;
      doc.setFontSize(14);
      doc.text('Indicadores', 20, y);
      y += 10;
      const col1X = 20;
      const col2X = 120;
      kpis.forEach((k) => {
        doc.setFontSize(11);
        doc.text(k.label, col1X, y);
        doc.text(k.value, col2X, y);
        y += 8;
      });
      y += 10;
      doc.setFontSize(14);
      doc.text('Oferta e procura por área', 20, y);
      y += 10;
      doc.setFontSize(11);
      const headerY = y;
      doc.text('Área', col1X, headerY);
      doc.text('Oferta (%)', col2X, headerY);
      doc.text('Procura (%)', col2X + 60, headerY);
      y += 8;
      areaSupplyDemand.forEach((a) => {
        doc.text(a.area, col1X, y);
        doc.text(a.supply + '%', col2X, y);
        doc.text(a.demand + '%', col2X + 60, y);
        y += 7;
      });
      doc.save('career-connect-relatorio.pdf');
      showToast('Relatório PDF exportado.');
    } catch (err) {
      showToast('Erro ao exportar PDF.');
      console.error(err);
    }
  };

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
          <button onClick={exportExcel} className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white">
            Exportar Excel
          </button>
          {/** Leave hidden */}
          <button onClick={exportPDF} className="rounded-full hidden  font-bold text-[.82rem] h-10 px-4 bg-surface2 text-ink">
            Plano em PDF
          </button>
        </div>
      </Card>
    </>
  );
};

// ── PROFILE (shared) ─────────────────────────
const AREAS = [
  'Tecnologia e TI', 'Finanças e Banca', 'Engenharia', 'Saúde', 'Direito',
  'Marketing e Comunicação', 'Gestão e Empreendedorismo', 'Recursos Humanos',
  'Energia e Recursos Naturais', 'Educação', 'Agricultura', 'Logística',
];
const GOALS = [
  'Escolher a minha área', 'Preparar o primeiro estágio', 'Construir a minha marca pessoal',
  'Desenvolver competências', 'Mudar de percurso', 'Criar o meu negócio',
];
const LEVELS = ['Estudante', 'Recém-graduado'];
const SUPPORT_TYPES = ['Mentor', 'Coach', 'Orientação pontual'];

// ── PROFILE (shared) ─────────────────────────
const EMPTY_MENTOR = {
  name: '', phone: '', job_title: '', company: '', sector: '', years: '',
  support_type: '', interests: [], can_help_goals: [], linkedin_url: '', photo_url: '',
};
const EMPTY_MENTEE = {
  name: '', phone: '', level: '', course: '', institution: '', interests: [], goal: '', pitch: '', linkedin_url: '', photo_url: '',
};

export const ProfileScreen = ({ asRole, setRole, showToast }) => {
  const isMentor = asRole === 'mentor';
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(isMentor ? EMPTY_MENTOR : EMPTY_MENTEE);
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const resp = await ccGetProfile();
        const user = resp.data?.user || null;
        setProfile(user);
        if (isMentor) {
          const mp = user?.mentorProfile || {};
          setForm({
            name: user?.name || '',
            phone: user?.phone || '',
            job_title: mp.job_title || '',
            company: mp.company || '',
            sector: mp.sector || '',
            years: mp.years != null ? String(mp.years) : '',
            support_type: mp.support_type || '',
            interests: Array.isArray(mp.interests) ? mp.interests : [],
            can_help_goals: Array.isArray(mp.can_help_goals) ? mp.can_help_goals : [],
            linkedin_url: user?.linkedin_url || '',
            photo_url: user?.photo_url || '',
          });
        } else {
          const mp = user?.menteeProfile || {};
          setForm({
            name: user?.name || '',
            phone: user?.phone || '',
            level: mp.level || '',
            course: mp.course || '',
            institution: mp.institution || '',
            interests: Array.isArray(mp.interests) ? mp.interests : [],
            goal: mp.goal || '',
            pitch: mp.pitch || '',
            linkedin_url: user?.linkedin_url || '',
            photo_url: user?.photo_url || '',
          });
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [asRole, isMentor]);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  const toggle = (key, val) => setForm((p) => {
    const cur = p[key] || [];
    const next = cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val];
    return { ...p, [key]: next };
  });

  const subtitle = isMentor
    ? [form.job_title, form.company].filter(Boolean).join(', ') || form.name || 'Utilizador'
    : [form.course, form.institution].filter(Boolean).join(' · ') || form.name || 'Utilizador';

  const inputCls = 'w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 focus:border-primary-500 focus:outline-none';
  const labelCls = 'block text-[.85rem] font-semibold mb-1.5';
  const chipCls = (active) => `rounded-full border px-3 py-1.5 text-[.85rem] font-medium transition ${active ? 'bg-primary-500 border-primary-500 text-white' : 'border-line text-ink bg-surface'}`;

  const handleSave = async () => {
    setSaving(true);
    try {
   const fd = new FormData();
    fd.append('name', form.name);
    fd.append('phone', form.phone);
    fd.append('linkedin_url', form.linkedin_url || '');
    if (photoFile) fd.append('photo', photoFile);
    if (isMentor) {
      fd.append('mentorProfile', JSON.stringify({
        job_title: form.job_title,
        company: form.company,
        sector: form.sector,
        years: form.years ? Number(form.years) : null,
        support_type: form.support_type,
        interests: form.interests,
        can_help_goals: form.can_help_goals,
      }));
    } else {
      fd.append('menteeProfile', JSON.stringify({
        level: form.level || null,
        course: form.course,
        institution: form.institution,
        interests: form.interests,
        goal: form.goal,
        pitch: form.pitch,
      }));
    }
    const resp = await uploadClient.put('/users/profile', fd);
    const user = resp.data?.user;
    if (user) setProfile(user);
    showToast('Alterações guardadas.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Erro ao guardar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div role="status" aria-busy="true" aria-label="A carregar">
        <SkeletonBar w="40%" h={26} className="mb-2" />
        <SkeletonBar w="70%" h={12} className="mb-4" />
        {[0, 1].map((i) => (
          <Card key={i} className="mt-4">
            <SkeletonPersonRow />
            <div className="mt-4 space-y-3">
              <SkeletonBar w="35%" h={12} />
              <SkeletonBar w="100%" h={38} r={14} />
              <SkeletonBar w="35%" h={12} />
              <SkeletonBar w="100%" h={38} r={14} />
            </div>
          </Card>
        ))}
        <SkeletonBar w={140} h={40} r={20} className="mt-1" />
      </div>
    );
  }

  return (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Perfil</h2>
      <Card className="mt-4">
        <label className="block cursor-pointer">
        <PersonRow name={profile?.name || 'Utilizador'} subtitle={subtitle} photoUrl={profile?.photo_url} />
        <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; const fd = new FormData(); fd.append('photo', f); try { const resp = await uploadClient.put('/users/profile', fd); const user = resp.data?.user; if (user) setProfile(user); showToast('Foto actualizada.'); } catch (err) { showToast(err.response?.data?.message || 'Erro ao guardar foto.'); } }} />
      </label>

        {isMentor ? (
          <div className="mt-4 space-y-3">
            <div><label className={labelCls}>Nome</label><input value={form.name} onChange={set('name')} className={inputCls} /></div>
            <div><label className={labelCls}>Telemóvel</label><input value={form.phone} onChange={set('phone')} placeholder="+258 84 000 0000" className={inputCls} /></div>
            <div><label className={labelCls}>Cargo</label><input value={form.job_title} onChange={set('job_title')} placeholder="Ex.: Engenheiro de Software" className={inputCls} /></div>
            <div><label className={labelCls}>Empresa</label><input value={form.company} onChange={set('company')} placeholder="Ex.: Vodacom" className={inputCls} /></div>
            <div><label className={labelCls}>Setor</label><input value={form.sector} onChange={set('sector')} placeholder="Ex.: Tecnologia e TI" className={inputCls} /></div>
            <div><label className={labelCls}>Anos de experiência</label><input type="number" min="0" value={form.years} onChange={set('years')} className={inputCls} /></div>
            <div>
              <label className={labelCls}>Tipo de apoio</label>
              <select value={form.support_type} onChange={set('support_type')} className={inputCls}>
                {SUPPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Áreas em que ajuda (até 3)</label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {AREAS.map((a) => (
                  <button key={a} type="button" onClick={() => toggle('interests', a)} className={chipCls(form.interests.includes(a))}>{a}</button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Objetivos em que pode ajudar</label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {GOALS.map((g) => (
                  <button key={g} type="button" onClick={() => toggle('can_help_goals', g)} className={chipCls(form.can_help_goals.includes(g))}>{g}</button>
                ))}
              </div>
            </div>
            <div><label className={labelCls}>LinkedIn</label><input value={form.linkedin_url} onChange={set('linkedin_url')} placeholder="https://linkedin.com/in/..." className={inputCls} /></div>

          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div><label className={labelCls}>Nome</label><input value={form.name} onChange={set('name')} className={inputCls} /></div>
            <div><label className={labelCls}>Telemóvel</label><input value={form.phone} onChange={set('phone')} placeholder="+258 84 000 0000" className={inputCls} /></div>
            <div>
              <label className={labelCls}>Situação</label>
              <select value={form.level} onChange={set('level')} className={inputCls}>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Curso</label><input value={form.course} onChange={set('course')} className={inputCls} /></div>
            <div><label className={labelCls}>Instituição</label><input value={form.institution} onChange={set('institution')} className={inputCls} /></div>
            <div>
              <label className={labelCls}>Áreas de interesse (até 3)</label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {AREAS.map((a) => (
                  <button key={a} type="button" onClick={() => toggle('interests', a)} className={chipCls(form.interests.includes(a))}>{a}</button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Objetivo</label>
              <select value={form.goal} onChange={set('goal')} className={inputCls}>
                {GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Pitch (120 caracteres)</label><textarea value={form.pitch} onChange={set('pitch')} maxLength={120} rows="3" className={inputCls} /></div>

          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white disabled:opacity-50"
        >
          {saving ? 'A guardar...' : 'Guardar'}
        </button>
      </Card>
      <button onClick={() => { setStoredToken(null); localStorage.removeItem('refresh_token'); localStorage.removeItem('userRole'); setRole(null); window.location.href = '/entrar'; }} className="w-full rounded-full font-bold text-[.92rem] h-12 bg-surface2 text-ink">Sair</button>
    </>
  );
};
// ── TV / PROJECTOR ───────────────────────────
export const TvScreen = ({ announcements, phaseLabel, currentRound, secondsLeft, showToast }) => {
  const [tvData, setTvData] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const resp = await ccGetTVData({});
        if (active) setTvData(resp.data || null);
      } catch (err) {
        console.error('Failed to load TV data:', err);
      }
    };
    load();
    const interval = setInterval(load, 5000);
    return () => { active = false; clearInterval(interval); };
  }, []);

  const anns = (tvData?.announcements?.length > 0 ? tvData.announcements : []).length > 0
    ? (tvData.announcements || [])
    : (announcements || []);
  const tablesRaw = tvData?.tables || [];
  // Dedup rows by table number so the same table never repeats on screen
  const seenTables = new Set();
  const tables = tablesRaw.filter((t) => {
    if (seenTables.has(t.table)) return false;
    seenTables.add(t.table);
    return true;
  });
  const tvPhase = tvData?.phase || phaseLabel();

  return (
    <div className="bg-navy-900 text-white min-h-screen pt-[calc(env(safe-area-inset-top,0px)+34px)] px-[5vw] pb-[34px]" style={{ background: 'radial-gradient(circle at 30% 10%, #172554 0%, #0b1126 70%)' }}>
      <div className="flex justify-between items-center">
        <span className="font-extrabold text-[1.35rem] italic tracking-tight leading-none"></span>
        <button
          onClick={() => {
            const prev = localStorage.getItem('previousRole') || null;
            localStorage.removeItem('previousRole');
            window.location.href = prev === 'org' ? '/app/org' : prev === 'mentee' ? '/app/mentee' : prev === 'mentor' ? '/app/mentor' : '/';
          }}
          className="rounded-full font-bold text-[.82rem] h-10 px-4 text-white bg-white/10"
        >
          Voltar
        </button>
      </div>
      {anns.length > 0 && (
        <div className="bg-gradient-to-br from-primary-500 to-primary-400 text-white px-4 py-3 rounded-2xl mt-5 font-semibold text-[1.2rem] shadow-md">
          {anns[anns.length - 1].body || anns[anns.length - 1]}
        </div>
      )}
      <p className="mt-[30px] text-[1.3rem] text-navy-100">{tvPhase}</p>
      {currentRound >= 1 && currentRound <= 4 ? (
        <>
          <div className="font-extrabold text-[clamp(4.5rem,16vw,11rem)] text-primary-500 leading-none" style={{ textShadow: '0 10px 40px rgba(242,107,15,.4)' }}>
            {formatTime(secondsLeft)}
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5 mt-[30px]">
            {tables.length > 0 ? (
              tables.map((table, tableIndex) => (
                <div key={tableIndex} className="bg-white/[.06] border border-white/[.08] rounded-[22px] p-5 backdrop-blur-md">
                  <span className="text-[.76rem] font-bold text-primary-300 uppercase tracking-wide">Mesa {table.table}</span>
                  <b className="block text-[1.1rem] mt-1.5">{table.mentor || 'Livre'}</b>
                  {table.mentees && table.mentees.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {table.mentees.map((m, mi) => (
                        <span key={mi} className="bg-white/[.12] text-white text-[.72rem] font-semibold px-2 py-1 rounded-[8px]">{m}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-navy-100 mt-1">–</p>
                  )}
                </div>
              ))
            ) : (
              MENTORS.map((mentor, mentorIndex) => (
                <div key={mentorIndex} className="bg-white/[.06] border border-white/[.08] rounded-[22px] p-5 backdrop-blur-md">
                  <span className="text-[.76rem] font-bold text-primary-300 uppercase tracking-wide">Mesa {mentorIndex + 1}</span>
                  <b className="block text-[1.1rem] mt-1.5">{mentor.name}</b>
                  <p className="text-navy-100 mt-1">–</p>
                </div>
              ))
            )}
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
        <div className="font-extrabold text-[1.35rem] italic tracking-tight leading-none flex gap-2">
         
         </div>
        <button onClick={() => { setStoredToken(null); localStorage.removeItem('refresh_token'); localStorage.removeItem('userRole'); setRole(null); window.location.href = '/entrar'; }} className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-surface2 text-ink">Sair</button>
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