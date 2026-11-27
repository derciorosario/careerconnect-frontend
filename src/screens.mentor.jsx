import React, { useState, useEffect, useRef } from 'react';
import {
  getFirstName, formatTime,
} from './data';
import {
  ccGetProfile, ccGetMentorMatch, ccGetMentorshipRequestsForMentor,
  ccRespondMentorshipRequest, ccGetConnections, ccEnsureConnection, ccGetMessages, ccSendMessage,
  ccGetWishesForMentor, ccSubmitFeedback, ccGetMenteeDirectory,
  ccGetQuestionnaire, ccGetEvent, ccGetSessions,
} from './api/client';
import { PersonRow, PersonDetailsDialog, ProgressBar, Card, QrCode } from './ui';
import { downloadCertificate } from './certificate';

// ── skeleton primitives ──────────────────────
const SkeletonBar = ({ w = '100%', h = 14, r = 7, className = '', style }) => (
  <div
    className={`animate-pulse bg-surface2 ${className}`}
    style={{ width: w, height: h, borderRadius: r, ...style }}
    aria-hidden="true"
  />
);

const SkeletonCard = ({ children, navy = false }) => (
  <div
    className={`${navy ? 'bg-navy' : 'bg-[rgba(255,255,255,.15)]  border-line'} animate-pulse rounded-[18px] p-4 mb-3.5 space-y-3`}
    aria-hidden="true"
  >
    {children}
  </div>
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

// ── HOME ─────────────────────────────────────
export const MentorHome = ({ showToast }) => {
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [maxMentees, setMaxMentees] = useState(3);
  const [wishesReceived, setWishesReceived] = useState([]);
  const [myMatch, setMyMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [certEnabled, setCertEnabled] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [eventName, setEventName] = useState('Career Connect 2026');
  const [sessions, setSessions] = useState([]);

  const showToastRef = useRef(showToast);
  useEffect(() => { showToastRef.current = showToast; });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [profResp, reqResp, wishResp, matchResp, qResp, evResp, sessResp] = await Promise.all([
          ccGetProfile(),
          ccGetMentorshipRequestsForMentor(),
          ccGetWishesForMentor(),
          ccGetMentorMatch({}),
          ccGetQuestionnaire({}),
          ccGetEvent({}),
          ccGetSessions({}),
        ]);
        if (cancelled) return;
        setProfile(profResp.data?.user || null);
        setRequests(reqResp.data?.requests || []);
        setMaxMentees(profResp.data?.user?.mentorProfile?.max_mentees || 3);
        setWishesReceived(wishResp.data?.wishes || []);
        setMyMatch(matchResp.data?.match || null);
        setCertEnabled(qResp.data?.certificate_enabled === true);
        const ev = evResp.data?.event;
        if (ev?.name) setEventName(ev.name);
        setCheckedIn((profResp.data?.user?.registrations || []).some((r) => r.status === 'present'));
        setSessions(sessResp.data?.sessions || []);
      } catch (err) {
        if (!cancelled) console.error('Failed to load mentor home:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div role="status" aria-busy="true" aria-label="A carregar">
        <SkeletonBar w="45%" h={26} className="mb-2" />
        <SkeletonBar w="70%" h={12} className="mb-4" />

        {/* Ticket card */}
        <SkeletonCard navy>
          <div className="flex gap-3 items-center">
            <div className="flex-1 space-y-2">
              <SkeletonBar w="30%" h={10} style={{ background: 'rgba(255,255,255,.15)' }} />
              <SkeletonBar w="65%" h={16} style={{ background: 'rgba(255,255,255,.15)' }} />
              <SkeletonBar w="50%" h={11} style={{ background: 'rgba(255,255,255,.15)' }} />
            </div>
            <div className="animate-pulse rounded-[10px]" style={{ width: 104, height: 104, background: 'rgba(255,255,255,.12)' }} />
          </div>
        </SkeletonCard>

        {/* Accepted mentees progress */}
        <SkeletonCard>
          <div className="flex justify-between items-center">
            <SkeletonBar w="45%" h={14} />
            <SkeletonBar w="15%" h={11} />
          </div>
          <div className="animate-pulse bg-surface2 rounded-full" style={{ height: 8 }} />
        </SkeletonCard>

        {/* Wishes received */}
        <SkeletonCard>
          <div className="flex justify-between items-center">
            <SkeletonBar w="50%" h={14} />
            <SkeletonBar w="10%" h={11} />
          </div>
          {[0, 1].map((i) => (
            <SkeletonPersonRow key={i} />
          ))}
        </SkeletonCard>
      </div>
    );
  }

  const me = profile;
  const acceptedCount = requests.filter((r) => r.status === 'accepted').length;
  const tableNo = myMatch?.table_no || null;

  return (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Olá, {getFirstName(me?.name || 'Mentor')}.</h2>
      <p className="text-ink-muted text-[.85rem] mt-1 mb-4">{me?.phone || 'Mentor'}{me?.mentorProfile?.job_title ? ` · ${me.mentorProfile.job_title}` : ''}{me?.mentorProfile?.company ? ` · ${me.mentorProfile.company}` : ''}{me?.mentorProfile?.approval === 'approved' ? ' · Mentor aprovado' : ' · A aguardar aprovação'}</p>

      <Card variant="navy">
        <div className="flex gap-3 items-center">
          <div className="flex-1 min-w-0">
            <div className="text-[.76rem] font-bold text-primary-300 uppercase tracking-wide">Bilhete</div>
            <PersonRow name={me?.name || 'Mentor'} photoUrl={me?.photo_url} />
            <p className="text-[.85rem] text-navy-100">{tableNo ? `Mesa ${tableNo} fixa nos dois intervalos` : 'Mesa a atribuir no evento'}</p>
          </div>
          {me?.registrations?.[0]?.ticket_code ? (
            <QrCode value={me.registrations[0].ticket_code} size={104} downloadable />
          ) : (
            <QrCode value={me?.ticket_code || 'CC-MENTOR'} size={104} downloadable />
          )}
        </div>
      </Card>

      {certEnabled && checkedIn && (
        <Card variant="navy">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[.76rem] font-bold text-primary-300 uppercase tracking-wide">Conquista</div>
              <b className="text-[1.05rem]">Certificado Digital de Participação</b>
              <p className="text-[.82rem] text-navy-100 mt-1">Descarrega o teu certificado de participação.</p>
            </div>
            <button
              onClick={async () => {
                try {
                  await downloadCertificate({ name: me?.name || 'Mentor', role: 'mentor', eventName });
                  showToastRef.current('Certificado descarregado.');
                } catch (err) {
                  console.error('Erro ao gerar certificado:', err);
                  showToastRef.current('Erro ao gerar certificado.');
                }
              }}
              className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white shrink-0"
            >
              Descarregar
            </button>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-3.5"><b>Programa do Evento</b></div>
        {sessions.length === 0 ? (
          <p className="text-[.85rem] text-ink-muted">Programa ainda não disponível.</p>
        ) : (
          <div className="space-y-3">
            {[...sessions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((s) => {
              const isBreak = s.type === 'break';
              const time = s.starts_at
                ? new Date(s.starts_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
                : '';
              return (
                <div key={s.id} className="flex items-start gap-3">
                  <div className={`inline-grid place-items-center w-11 h-11 rounded-[14px] shrink-0 font-bold ${isBreak ? 'bg-surface2 text-ink' : 'bg-primary-500 text-white'}`}>
                    {isBreak ? '☕' : '▶'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[.72rem] text-ink-muted font-semibold uppercase tracking-wide">
                      {time || '—'} {isBreak ? '· Intervalo' : '· Masterclass'}
                    </p>
                    <p className="text-[.9rem] font-bold whitespace-normal break-words">{s.title || (isBreak ? 'Intervalo' : 'Masterclass')}</p>
                    {!isBreak && s.mentor?.name && (
                      <p className="text-[.78rem] text-ink-muted">{s.mentor.name}{s.theme ? ` · ${s.theme}` : ''}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3.5">
          <b>Mentorados aceites</b>
          <span className="text-[.76rem] text-ink-muted">{acceptedCount} de {maxMentees}</span>
        </div>
        <ProgressBar value={maxMentees > 0 ? (acceptedCount / maxMentees) * 100 : 0} />
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3.5">
          <b>Marcado por mentorados</b>
          <span className="text-[.76rem] text-ink-muted">{wishesReceived.length}</span>
        </div>
        {wishesReceived.length === 0 ? (
          <p className="text-[.85rem] text-ink-muted">Ainda ninguém te marcou. Os nomes aparecem aqui.</p>
        ) : (
          <div className="space-y-2">
            {wishesReceived.map((wish) => {
              const mentee = wish.mentee;
              return (
                <div key={wish.id} className="py-1">
                  <PersonRow
                    name={mentee?.name || 'Mentorado'}
                    subtitle={mentee?.menteeProfile?.goal || ''}
                    photoUrl={mentee?.photo_url}
                    onClick={() => setSelectedMentee({ ...mentee, role: 'mentee' })}
                  />
                  {(mentee?.email || mentee?.phone) && (
                    <div className="text-[.78rem] text-ink-muted mt-1 pl-[46px] space-y-0.5">
                      {mentee?.email && <div>{mentee.email}</div>}
                      {mentee?.phone && <div>{mentee.phone}</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {selectedMentee && (
        <PersonDetailsDialog user={selectedMentee} onClose={() => setSelectedMentee(null)} />
      )}
    </>
  );
};

// ── LIVE ─────────────────────────────────────
export const MentorLive = ({ currentRound, roundsPerBreak = 4, secondsLeft, phaseLabel, showToast }) => {
  const [myMatch, setMyMatch] = useState(null);
  const [allMatches, setAllMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState({});
  const loadedRoundRef = useRef(null);

  const showToastRef = useRef(showToast);
  useEffect(() => { showToastRef.current = showToast; });

  // Load the mentor's matches for ALL rounds so the whole schedule is visible
  // even before the countdown starts.
  useEffect(() => {
    let cancelled = false;
    const loadAll = async () => {
      try {
        const resp = await ccGetMentorMatch({});
        if (!cancelled) setAllMatches(resp.data?.allMatches || []);
      } catch (err) {
        if (!cancelled) console.error('Failed to load all mentor matches:', err);
      }
    };
    loadAll();
    const interval = setInterval(loadAll, 5000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  useEffect(() => {
    // Only fetch when the round actually changes (not every second).
    // loadedRoundRef also prevents a re-fetch on remount if the round is
    // unchanged — but since the component unmounts on tab-away, a fresh
    // mount starts with loadedRoundRef === null and refetches, so the
    // skeleton shows on every entry as requested.
    if (currentRound < 1 || currentRound > roundsPerBreak) {
      setLoading(false);
      return;
    }
    if (loadedRoundRef.current === currentRound) return;
    loadedRoundRef.current = currentRound;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const resp = await ccGetMentorMatch({});
        if (!cancelled) setMyMatch(resp.data?.match || null);
      } catch (err) {
        if (!cancelled) console.error('Failed to load mentor match:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [currentRound]);

  const scheduleCard = (
    <Card>
      <div className="flex items-center justify-between mb-3.5"><b>Os meus mentorandos em todas as rondas</b></div>
      {allMatches.length === 0 ? (
        <p className="text-[.85rem] text-ink-muted">Ainda sem atribuições. O organizador irá gerar os pares.</p>
      ) : (
        <div className="space-y-3">
          {allMatches.map((m) => (
            <div key={m.id || m.round_id} className="flex items-start gap-3">
              <div className="inline-grid place-items-center w-11 h-11 rounded-[14px] bg-primary-500 text-white font-extrabold shrink-0">
                {m.table_no || '–'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[.72rem] text-ink-muted font-semibold uppercase tracking-wide">
                  Ronda {m.round_no ?? '–'}{m.break_no ? ` · Intervalo ${m.break_no}` : ''}
                </p>
                {(m.mentees || []).length > 0 ? (
                  <p className="text-[.88rem] font-semibold">
                    {m.mentees.map((x) => x.name || 'Mentorado').join(', ')}
                  </p>
                ) : (
                  <p className="text-[.85rem] text-ink-muted">Sem mentorandos</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  if (currentRound === 0 || currentRound > roundsPerBreak) {
    return (
      <>
        <h2 className="text-[1.45rem] font-extrabold tracking-tight">A minha mesa</h2>
        <p className="text-ink-muted text-[.85rem] mt-1 mb-4">{phaseLabel()}</p>
        <Card variant="navy">
          <h3 className="text-[1.08rem] font-extrabold">{currentRound === 0 ? 'À espera do intervalo' : 'Intervalo concluído'}</h3>
        </Card>
        {scheduleCard}
      </>
    );
  }

  // Skeleton for the whole round view while the match is being fetched
  // on entry. Only applies when there's nothing to show yet.
  if (loading && !myMatch) {
    return (
      <>
        <h2 className="text-[1.45rem] font-extrabold tracking-tight">A minha mesa</h2>
        <p className="text-ink-muted text-[.85rem] mt-1 mb-4">{phaseLabel()}</p>
        <SkeletonCard navy>
          <div className="flex justify-between items-center">
            <SkeletonBar w="35%" h={12} style={{ background: 'rgba(255,255,255,.15)' }} />
            <SkeletonBar w="18%" h={24} style={{ background: 'rgba(255,255,255,.15)' }} />
          </div>
          <div className="flex gap-3 items-center mt-3.5">
            <div className="animate-pulse rounded-[18px]" style={{ width: 64, height: 64, background: 'rgba(255,255,255,.12)' }} />
            <div className="flex-1 space-y-2">
              <SkeletonBar w="25%" h={10} style={{ background: 'rgba(255,255,255,.15)' }} />
              <SkeletonBar w="55%" h={16} style={{ background: 'rgba(255,255,255,.15)' }} />
            </div>
          </div>
        </SkeletonCard>
        {[0, 1].map((i) => (
          <SkeletonCard key={i}>
            <SkeletonPersonRow />
            <SkeletonBar w="70%" h={11} className="mt-3" />
            <SkeletonBar w="80%" h={11} />
          </SkeletonCard>
        ))}
        {scheduleCard}
      </>
    );
  }

  const mentees = myMatch?.mentees || [];
  const tableNo = myMatch?.table_no || currentRound;

  return (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">A minha mesa</h2>
      <p className="text-ink-muted text-[.85rem] mt-1 mb-4">{phaseLabel()}</p>

      <Card variant="navy">
        <div className="flex justify-between items-center">
          <span className="text-[.76rem] font-bold text-primary-300 uppercase tracking-wide">Ronda {currentRound} de {roundsPerBreak}</span>
          <span className="font-extrabold text-[1.7rem]">{formatTime(secondsLeft)}</span>
        </div>
        <div className="flex gap-3 items-center mt-3.5">
          <div className="inline-grid place-items-center w-16 h-16 rounded-[18px] bg-primary-500 text-white text-[1.8rem] font-extrabold shrink-0">
            {tableNo}
          </div>
          <div>
            <p className="text-[.76rem] text-navy-100">Mesa</p>
            <h3 className="text-[1.08rem] font-extrabold">{mentees.length} mentorado{mentees.length !== 1 ? 's' : ''}</h3>
          </div>
        </div>
      </Card>

      {/* Loading indicator shown above the list — does NOT unmount existing cards */}
      {loading && mentees.length === 0 && (
        <Card><p className="text-ink-muted text-[.85rem]">A carregar mentorados...</p></Card>
      )}

      {!loading && mentees.length === 0 && (
        <Card>
          <b>Sem mentorados atribuídos.</b>
          <p className="text-ink-muted text-[.85rem] mt-1.5">O organizador ainda não atribuiu mentorados a esta mesa.</p>
        </Card>
      )}

      {/* Cards stay mounted across re-fetches so scroll position is preserved */}
      {mentees.map((mentee) => (
        <div key={mentee.user_id}>
          <Card>
            <PersonRow name={mentee.name || 'Mentorado'} subtitle={mentee.goal || ''} photoUrl={mentee.photo_url} />
            <p className="text-[.85rem] mt-3"><b>Objetivo:</b> {mentee.goal || 'Não definido'}</p>
            <p className="text-[.85rem] mt-1"><b>Pitch:</b> {mentee.pitch || 'Não definido'}</p>
            <div className="flex gap-1.5 flex-wrap mt-2.5">
              <span className="bg-surface text-ink-muted border border-line rounded-full px-3 py-[5px] text-[.74rem] font-semibold">
                compatível
              </span>
            </div>
          </Card>

          {/**<Card>
            <div className="flex items-center justify-between mb-3.5"><b>3 perguntas para fazer</b></div>
            <ol className="text-[.85rem] pl-[18px] mt-1 leading-[1.7]">
              <li>O que já tentaste até agora?</li>
              <li>Que obstáculo te trava mais?</li>
              <li>Como posso ajudar já esta semana?</li>
            </ol>
          </Card> */}

          <Card>
            <b>Queres continuar com {mentee.name ? getFirstName(mentee.name) : 'este mentorado'}?</b>
            <div className="flex gap-3 mt-3">
              <button
                onClick={async () => {
                  try {
                    await ccSubmitFeedback({
                      match_id: myMatch.id,
                      to_user_id: mentee.user_id,
                      wants_to_continue: true,
                    });
                    setFeedbackStatus((p) => ({ ...p, [mentee.user_id]: 'continue' }));
                    showToastRef.current('Interesse enviado.');
                  } catch (err) {
                    showToastRef.current(err.response?.data?.message || 'Erro ao guardar interesse.');
                  }
                }}
                className={`rounded-full font-bold text-[.82rem] h-10 px-4 ${feedbackStatus[mentee.user_id] === 'continue' ? 'bg-primary-500 text-white' : 'bg-surface2 text-ink'}`}
              >
                {feedbackStatus[mentee.user_id] === 'continue' ? 'Interesse enviado ✓' : 'Quero continuar'}
              </button>
              <button
                onClick={async () => {
                  try {
                    await ccSubmitFeedback({
                      match_id: myMatch.id,
                      to_user_id: mentee.user_id,
                      wants_to_continue: false,
                    });
                    setFeedbackStatus((p) => ({ ...p, [mentee.user_id]: 'no' }));
                    showToastRef.current('Sem interesse.');
                  } catch (err) {
                    showToastRef.current(err.response?.data?.message || 'Erro ao guardar.');
                  }
                }}
                className={`rounded-full font-bold text-[.82rem] h-10 px-4 ${feedbackStatus[mentee.user_id] === 'no' ? 'bg-surface2 text-ink' : 'bg-surface2 text-ink'}`}
              >
                {feedbackStatus[mentee.user_id] === 'no' ? 'Sem interesse ✓' : 'Agora não'}
              </button>
            </div>
          </Card>
        </div>
      ))}
      {scheduleCard}
    </>
  );
};

// ── REQUESTS ─────────────────────────────────
export const MentorRequests = ({ showToast }) => {
  const [requests, setRequests] = useState([]);
  const [maxMentees, setMaxMentees] = useState(3);
  const [actionLoading, setActionLoading] = useState({});
  const [loading, setLoading] = useState(true);

  const showToastRef = useRef(showToast);
  useEffect(() => { showToastRef.current = showToast; });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [reqResp, profResp] = await Promise.all([
          ccGetMentorshipRequestsForMentor(),
          ccGetProfile(),
        ]);
        if (cancelled) return;
        setRequests(reqResp.data?.requests || []);
        setMaxMentees(profResp.data?.user?.mentorProfile?.max_mentees || 3);
      } catch (err) {
        if (!cancelled) console.error('Failed to load requests:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const accepted = requests.filter((r) => r.status === 'accepted').length;

  const handleRespond = async (request, status) => {
    if (actionLoading[request.id]) return;
    setActionLoading((p) => ({ ...p, [request.id]: true }));
    try {
      await ccRespondMentorshipRequest({ request_id: request.id, status });
      setRequests((prev) => prev.map((r) => r.id === request.id ? { ...r, status } : r));
      showToastRef.current(status === 'accepted' ? 'Mentoria aceite.' : 'Pedido recusado.');
    } catch (err) {
      showToastRef.current(err.response?.data?.message || 'Erro ao responder.');
    } finally {
      setActionLoading((p) => { const { [request.id]: _, ...rest } = p; return rest; });
    }
  };

  if (loading) {
    return (
      <div role="status" aria-busy="true" aria-label="A carregar pedidos">
        <SkeletonBar w="50%" h={26} className="mb-2" />
        <SkeletonBar w="80%" h={12} className="mb-4" />
        {[0, 1, 2].map((i) => (
          <SkeletonCard key={i}>
            <SkeletonPersonRow />
            <SkeletonBar w="85%" h={11} className="mt-3" />
            <div className="flex gap-2.5 mt-3">
              <SkeletonBar w={88} h={40} r={20} />
              <SkeletonBar w={88} h={40} r={20} />
            </div>
          </SkeletonCard>
        ))}
      </div>
    );
  }

  return (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Pedidos de mentoria</h2>
      <p className="text-[.85rem] text-ink-muted mt-1 mb-4">
        Aceites: {accepted} de {maxMentees}. Ao atingir o limite, "Aceitar" fica desativado.
      </p>
      {requests.length === 0 ? (
        <Card><b>Sem pedidos.</b></Card>
      ) : requests.map((request) => {
        const menteeGoal = request.mentee?.menteeProfile?.goal || '';
        const menteeCourse = request.mentee?.menteeProfile?.course || '';
        const menteeInstitution = request.mentee?.menteeProfile?.institution || '';
        const subtitle = [menteeGoal, menteeCourse && `${menteeCourse}${menteeInstitution ? ` · ${menteeInstitution}` : ''}`].filter(Boolean).join(' · ');
        return (
          <Card key={request.id}>
            <PersonRow name={request.mentee?.name || 'Mentorado'} subtitle={subtitle} photoUrl={request.mentee?.photo_url} />
            {(request.mentee?.phone || request.mentee?.email) && (
              <div className="mt-2.5 space-y-1 min-w-0">
                {request.mentee?.phone && (
                  <a href={`tel:${request.mentee.phone}`} className="flex items-center gap-2 text-[.82rem] font-semibold text-primary-500 hover:underline break-all min-w-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    {request.mentee.phone}
                  </a>
                )}
                {request.mentee?.email && (
                  <a href={`mailto:${request.mentee.email}`} className="flex items-center gap-2 text-[.82rem] font-semibold text-primary-500 hover:underline break-all min-w-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></svg>
                    {request.mentee.email}
                  </a>
                )}
              </div>
            )}
            <p className="text-[.85rem] mt-3 mb-2.5">"{request.message || ''}"</p>
            {request.status != "pending" && <span className={`text-[.72rem] font-bold px-3 py-1 rounded-full mb-2 inline-block ${request.status === 'accepted' ? 'bg-success/15 text-success' : request.status === 'declined' ? 'bg-surface2 text-ink-muted' : 'bg-primary-50/15 text-primary-500'}`}>
              {request.status === 'accepted' ? 'Aceite' : request.status === 'declined' ? 'Recusado' : 'Pendente'}
            </span>}
            {request.status === 'pending' ? (
              <div className="flex gap-2.5">
                <button
                  onClick={() => handleRespond(request, 'accepted')}
                  disabled={accepted >= maxMentees || actionLoading[request.id]}
                  className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white disabled:opacity-40"
                >
                  {actionLoading[request.id] ? '...' : 'Aceitar'}
                </button>
                <button
                  onClick={() => handleRespond(request, 'declined')}
                  disabled={actionLoading[request.id]}
                  className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-surface2 text-ink disabled:opacity-40"
                >
                  Recusar
                </button>
              </div>
            ) : request.status === 'accepted' ? (
              <div className="flex gap-2.5">
                <button
                  onClick={() => handleRespond(request, 'declined')}
                  disabled={actionLoading[request.id]}
                  className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-surface2 text-ink disabled:opacity-40"
                >
                  Recusar
                </button>
                {/** Leave Hidden **/ <button
                  onClick={() => handleRespond(request, 'pending')}
                  disabled={actionLoading[request.id]}
                  className="hidden rounded-full font-bold text-[.82rem] h-10 px-4 bg-surface text-ink disabled:opacity-40"
                >
                  Pendente
                </button>}
              </div>
            ) : (
              <div className="flex gap-2.5">
                <button
                  onClick={() => handleRespond(request, 'accepted')}
                  disabled={accepted >= maxMentees || actionLoading[request.id]}
                  className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white disabled:opacity-40"
                >
                  Aceitar
                </button>
               {/** Leave Hidden **/  <button
                  onClick={() => handleRespond(request, 'pending')}
                  disabled={actionLoading[request.id]}
                  className="hidden rounded-full font-bold text-[.82rem] h-10 px-4 bg-surface text-ink disabled:opacity-40"
                >
                  Pendente
                </button>}
              </div>
            )}
          </Card>
        );
      })}
    </>
  );
};

// ── CONNECTIONS ──────────────────────────────
export const MentorConnections = ({ showToast }) => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  const showToastRef = useRef(showToast);
  useEffect(() => { showToastRef.current = showToast; });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const resp = await ccGetConnections();
        if (cancelled) return;
        setConnections(resp.data?.connections || []);
      } catch (err) {
        if (!cancelled) console.error('Failed to load connections:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div role="status" aria-busy="true" aria-label="A carregar conexões">
        <SkeletonBar w="35%" h={26} className="mb-2" />
        <SkeletonBar w="65%" h={12} className="mb-4" />
        {[0, 1, 2].map((i) => (
          <SkeletonCard key={i}>
            <SkeletonPersonRow />
            <SkeletonBar w="45%" h={11} className="mt-3" />
            <SkeletonBar w="55%" h={11} />
          </SkeletonCard>
        ))}
      </div>
    );
  }

  const menteeConnections = connections.filter((c) => c.contact.role === 'mentee');

  return (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Conexões</h2>
      <p className="text-[.85rem] text-ink-muted mt-1 mb-4">Contactos visíveis só entre conectados.</p>
      {menteeConnections.length === 0 ? (
        <Card>
          <b>Sem conexões ainda.</b>
          <p className="text-[.85rem] text-ink-muted mt-1.5">Aceita pedidos de mentoria ou marca interesse depois de cada conversa.</p>
        </Card>
      ) : menteeConnections.map((c) => {
        const contact = c.contact;
        return (
          <Card key={c.id}>
            <PersonRow name={contact.name} subtitle={contact.role || ''} />
            <div className="mt-3 space-y-1">
              {contact.phone && <p className="text-[.85rem]">{contact.phone}</p>}
              {contact.email && <p className="text-[.85rem] text-ink-muted">{contact.email}</p>}
              {!contact.phone && !contact.email && (
                <p className="text-[.85rem] text-ink-muted">Sem contacto disponível.</p>
              )}
            </div>
          </Card>
        );
      })}
    </>
  );
};


// ── MESSAGES ─────────────────────────────────
export const MentorMessages = ({ showToast, messageTarget, clearMessageTarget }) => {
  const [drafts, setDrafts] = useState({});
  const [conv, setConv] = useState({});
  const [connections, setConnections] = useState([]);
  const [sending, setSending] = useState({});
  const [loading, setLoading] = useState(true);

  // Stable ref for showToast so the load effect doesn't re-run when the
  // parent re-renders and passes a new function identity.
  const showToastRef = useRef(showToast);
  useEffect(() => { showToastRef.current = showToast; });

  // Keep the latest message target / clear callback in refs so the load
  // effect (which runs once) can read them without re-subscribing.
  const messageTargetRef = useRef(messageTarget);
  useEffect(() => { messageTargetRef.current = messageTarget; });
  const clearMessageTargetRef = useRef(clearMessageTarget);
  useEffect(() => { clearMessageTargetRef.current = clearMessageTarget; });

  // Refs to each conversation's scroll container
  const scrollRefs = useRef({});

  // Refs to each conversation's message input (for autofocus).
  const inputRefs = useRef({});
  // Connection id whose input should be focused as soon as it mounts.
  const pendingFocusRef = useRef(null);

  const scrollToNewest = (connectionId) => {
    const el = scrollRefs.current[connectionId];
    if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Callback ref: focus the input as soon as the target conversation mounts.
  const setInputRef = (connectionId) => (el) => {
    inputRefs.current[connectionId] = el;
    if (el && pendingFocusRef.current === connectionId) {
      pendingFocusRef.current = null;
      el.focus();
      requestAnimationFrame(() => el.focus());
      setTimeout(() => el.focus(), 80);
    }
  };

  // Runs once per mount. Uses showToastRef so [showToast] never needs to
  // be a dependency — prevents the loading skeleton from blinking on every
  // parent render.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const resp = await ccGetConnections();
        if (cancelled) return;
        let conns = resp.data?.connections || [];

        // If the user arrived from Participantes with a chosen recipient,
        // make sure a conversation with them exists (no prior connection needed).
        const target = messageTargetRef.current;
        if (target && !conns.some((c) => c.contact?.id === target.id)) {
          try {
            const eResp = await ccEnsureConnection({ to_user_id: target.id });
            const ensured = eResp.data?.connection;
            if (ensured) conns = [ensured, ...conns];
          } catch (err) {
            showToastRef.current(err.response?.data?.message || 'Erro ao abrir conversa.');
          }
        }
        if (cancelled) return;

        const targetConn = target ? conns.find((c) => c.contact?.id === target.id) : null;
        const menteeConns = conns.filter((c) => c.contact?.role === 'mentee');
        setConnections(menteeConns);
        if (target) {
          if (targetConn) pendingFocusRef.current = targetConn.id;
          clearMessageTargetRef.current?.();
        }

        const entries = await Promise.all(
          menteeConns.map(async (c) => {
            try {
              const mResp = await ccGetMessages({ connection_id: c.id });
              const msgs = (mResp.data?.messages || []).map((m) => ({
                id: m.id,
                body: m.body,
                mine: m.from_user_id !== c.contact?.id,
                created_at: m.created_at,
              }));
              return [String(c.id), msgs];
            } catch {
              return [String(c.id), []];
            }
          })
        );
        if (cancelled) return;

        setConv((previous) => Object.fromEntries(entries.map(([key, loaded]) => {
          const loadedIds = new Set(loaded.map((m) => m.id).filter(Boolean));
          const localOnly = (previous[key] || []).filter((m) => !m.id || !loadedIds.has(m.id));
          return [key, [...loaded, ...localOnly]];
        })));
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load connections:', err);
          showToastRef.current('Erro ao carregar conversas.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const handleSend = async (connection) => {
    const key = String(connection.id);
    const msg = (drafts[key] || '').trim();
    if (!msg || sending[connection.id]) return;

    setSending((p) => ({ ...p, [connection.id]: true }));

    // Optimistic append — appears instantly at the top (newest-first sort)
    const optimistic = {
      id: `local-${Date.now()}`,
      body: msg,
      mine: true,
      created_at: new Date().toISOString(),
    };
    setConv((p) => ({ ...p, [key]: [optimistic, ...(p[key] || [])] }));
    setDrafts((p) => ({ ...p, [key]: '' }));

    // Scroll to newest (top) immediately
    requestAnimationFrame(() => scrollToNewest(connection.id));

    try {
      const resp = await ccSendMessage({ connection_id: connection.id, body: msg });
      const sent = resp.data?.message;
      setConv((p) => ({
        ...p,
        [key]: (p[key] || []).map((m) =>
          m.id === optimistic.id
            ? { ...m, id: sent?.id || m.id, created_at: sent?.created_at || m.created_at }
            : m
        ),
      }));
      requestAnimationFrame(() => scrollToNewest(connection.id));
      showToastRef.current('Mensagem enviada.');
    } catch (err) {
      // Roll back optimistic message and restore draft
      setConv((p) => ({
        ...p,
        [key]: (p[key] || []).filter((m) => m.id !== optimistic.id),
      }));
      setDrafts((p) => ({ ...p, [key]: msg }));
      showToastRef.current(err.response?.data?.message || 'Erro ao enviar.');
    } finally {
      setSending((p) => {
        const { [connection.id]: _, ...rest } = p;
        return rest;
      });
    }
  };

  // Enter sends; Shift+Enter inserts a newline
  const handleKeyDown = (e, connection) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(connection);
    }
  };

  return (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Mensagens</h2>
      <p className="text-ink-muted text-[.85rem] mt-1 mb-4">
        Escreve a mentorados para começares uma conversa.
      </p>

      {/* Header never unmounts — only the body below swaps, so no blink */}
      {loading ? (
        <div role="status" aria-busy="true" aria-label="A carregar conversas">
          {[0, 1].map((i) => (
            <div key={i} className="border border-line rounded-[16px] p-3.5 mb-3">
              <div className="flex justify-between items-center mb-2.5 gap-2">
                <SkeletonPersonRow />
                <SkeletonBar w={24} h={18} r={9} />
              </div>
              <div className="space-y-1.5 mb-2.5">
                <SkeletonBar w="55%" h={30} r={10} />
                <SkeletonBar w="45%" h={30} r={10} className="ml-auto" />
                <SkeletonBar w="60%" h={30} r={10} />
              </div>
              <div className="flex gap-2 max-md:flex-col">
                <SkeletonBar w="100%" h={38} r={10} />
                <SkeletonBar w={72} h={38} r={19} />
              </div>
            </div>
          ))}
        </div>
      ) : connections.length === 0 ? (
        <Card>
          <b>Sem conversas ainda.</b>
          <p className="text-ink-muted text-[.85rem] mt-1.5">
            Abre a lista de Participantes e toca em “Mensagem” para falar com um mentorado.
          </p>
        </Card>
      ) : (
        <div className="space-y-3 mb-5">
          {connections.map((c) => {
            const contact = c.contact;
            const key = String(c.id);
            const msgs = [...(conv[key] || [])].sort((a, b) => {
              const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
              const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
              return timeB - timeA;
            });
            const isSending = !!sending[c.id];

            return (
              <div key={c.id} className="border border-line rounded-[16px] p-3.5">
                <div className="flex justify-between items-center mb-2.5 gap-2">
                  <PersonRow name={contact.name} subtitle={contact.role || ''} />
                  <span className="text-[.72rem] font-bold px-2 py-0.5 rounded-full bg-surface2 text-ink-muted">
                    {msgs.length}
                  </span>
                </div>

                {/* Scroll container — ref so we can scroll it after send */}
                <div
                  ref={(el) => { scrollRefs.current[c.id] = el; }}
                  className="max-h-[180px] overflow-y-auto mb-2.5 space-y-1.5 text-[.85rem] scroll-smooth"
                  aria-live="polite"
                >
                  {msgs.length === 0 ? (
                    <p className="text-ink-muted">Sem mensagens ainda.</p>
                  ) : (
                    msgs.map((m) => (
                      <div
                        key={m.id}
                        className={`text-[.85rem] rounded-[10px] px-3 py-1.5 max-w-[80%] ${
                          m.mine ? 'ml-auto bg-primary-500 text-white' : 'bg-surface-soft text-ink'
                        } ${m.id?.toString().startsWith('local-') ? 'opacity-70' : ''}`}
                      >
                        {m.body}
                        {m.created_at && (
                          <div className="mt-1 text-[.68rem] opacity-75">
                            {new Date(m.created_at).toLocaleString('pt-PT', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2 max-md:flex-col">
                  <input
                    ref={setInputRef(c.id)}
                    value={drafts[key] || ''}
                    onChange={(e) => setDrafts((p) => ({ ...p, [key]: e.target.value }))}
                    onKeyDown={(e) => handleKeyDown(e, c)}
                    placeholder="Escreve uma mensagem…"
                    className="flex-1 bg-surface border-2 border-line rounded-[10px] px-3 py-2 text-base focus:border-primary-500 focus:outline-none"
                    disabled={isSending}
                  />
                  <button
                    onClick={() => handleSend(c)}
                    disabled={isSending || !(drafts[key] || '').trim()}
                    className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white disabled:opacity-50"
                  >
                    {isSending ? '...' : 'Enviar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

// ── MENTEES DIRECTORY ────────────────────────
export const MentorMentees = ({ showToast }) => {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentee, setSelectedMentee] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const resp = await ccGetMenteeDirectory({});
        if (cancelled) return;
        setMentees(resp.data?.mentees || []);
      } catch (err) {
        if (!cancelled) console.error('Failed to load mentees:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div role="status" aria-busy="true" aria-label="A carregar mentorados">
        <SkeletonBar w="40%" h={26} className="mb-2" />
        <SkeletonBar w="80%" h={12} className="mb-4" />
        {[0, 1, 2, 3].map((i) => (
          <SkeletonCard key={i}>
            <SkeletonPersonRow />
          </SkeletonCard>
        ))}
      </div>
    );
  }

  return (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Mentorados</h2>
      <p className="text-ink-muted text-[.85rem] mt-1 mb-4">
        Lista de todos os mentorados da plataforma. Total: {mentees.length}
      </p>
      {mentees.length === 0 && (
        <Card>
          <p className="text-ink-muted text-[.85rem]">Sem mentorados por agora.</p>
        </Card>
      )}
      {mentees.map((mentee) => (
        <Card key={mentee.id}>
          <PersonRow
            name={mentee.name}
            subtitle={[mentee.menteeProfile?.course, mentee.menteeProfile?.institution].filter(Boolean).join(' · ') || 'Mentorado'}
            photoUrl={mentee.photo_url}
            onClick={() => setSelectedMentee({ ...mentee, role: 'mentee' })}
          />
          {mentee.menteeProfile?.goal && (
            <div className="mt-2.5">
              <span className="bg-surface text-ink-muted border border-line rounded-full px-3 py-[5px] text-[.74rem] font-semibold">
                {mentee.menteeProfile.goal}
              </span>
            </div>
          )}
          {(mentee.phone || mentee.email) && (
            <div className="mt-2.5 space-y-1">
              {mentee.phone && (
                <a href={`tel:${mentee.phone}`} className="flex items-center gap-2 text-[.82rem] font-semibold text-primary-500 hover:underline">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  {mentee.phone}
                </a>
              )}
              {mentee.email && (
                <a href={`mailto:${mentee.email}`} className="flex items-center gap-2 text-[.82rem] font-semibold text-primary-500 hover:underline break-all">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></svg>
                  {mentee.email}
                </a>
              )}
            </div>
          )}
        </Card>
      ))}
      {selectedMentee && (
        <PersonDetailsDialog user={selectedMentee} onClose={() => setSelectedMentee(null)} />
      )}
    </>
  );
};