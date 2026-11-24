import React, { useState, useEffect, useRef } from 'react';
import {
  getFirstName, formatTime,
} from './data';
import {
  ccGetProfile, ccUpdateProfile,
  ccGetEvent, ccGetProgram,
  ccGetMyMatch, ccGetMentorDirectory, ccAddWish, ccRemoveWish, ccGetMyWishes,
  ccGetCurrentRound,
  ccSubmitFeedback, ccGetMyFeedback,
  ccGetConnections,
  ccCreateMentorshipRequest, ccGetMyMentorshipRequests,
  ccGetMessages, ccSendMessage,
  ccGetQuestions, ccCreateQuestion, ccVoteQuestion,
  ccGetPolls, ccVotePoll, ccGetPollResults,
  ccGetAnnouncements,
  ccSubmitSurvey, ccGetSurveyResults,
  ccCreateNextStep, ccGetMyNextStep,
  ccBookSession, ccGetMyBookings,
  ccGetBadges,
  setStoredToken,
} from './api/client';
import { Avatar, PersonRow, ProgressBar, ChecklistItem, Card, QuestionInput, QrCode } from './ui';

const AREAS = [
  'Tecnologia e TI',
  'Finanças e Banca',
  'Engenharia',
  'Saúde',
  'Direito',
  'Marketing e Comunicação',
  'Gestão e Empreendedorismo',
  'Recursos Humanos',
  'Energia e Recursos Naturais',
  'Educação',
  'Agricultura',
  'Logística',
];

const GOALS = [
  'Escolher a minha área',
  'Preparar o primeiro estágio',
  'Construir a minha marca pessoal',
  'Desenvolver competências',
  'Mudar de percurso',
  'Criar o meu negócio',
];

const ROUNDS = [
  { fromMentee: 0, toMentor: 2 },
  { fromMentee: 1, toMentor: 0 },
  { fromMentee: 2, toMentor: 5 },
  { fromMentee: 3, toMentor: 3 },
];

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
    className={`${navy ? 'bg-navy' : 'bg-[rgba(255,255,255,.15)] border-line'} animate-pulse rounded-[18px] p-4 mb-3.5 space-y-3`}
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
export const MenteeHome = ({ showToast }) => {
  const [profile, setProfile] = useState(null);
  const [conversationsDone, setConversationsDone] = useState(0);
  const [connections, setConnections] = useState([]);
  const [badgeData, setBadgeData] = useState([]);
  const [masterclasses, setMasterclasses] = useState([]);
  const [ticketCode, setTicketCode] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [wishes, setWishes] = useState([]);
  const [bookingLoading, setBookingLoading] = useState({});
  // Skeleton shows on every mount (tab entry). Re-renders of an already
  // mounted page don't re-run the fetch effect, so no blink.
  const [loading, setLoading] = useState(true);

  // Stable ref so the fetch effect only runs once per mount, not on every
  // parent re-render that passes a new showToast identity.
  const showToastRef = useRef(showToast);
  useEffect(() => { showToastRef.current = showToast; });

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      setLoading(true);
      try {
        const [profResp, connResp, feedbackResp, badgeResp, progResp, bookingResp, wishResp] = await Promise.all([
          ccGetProfile(),
          ccGetConnections(),
          ccGetMyFeedback(),
          ccGetBadges({ user_id: localStorage.getItem('userId') || '' }),
          ccGetProgram(),
          ccGetMyBookings(),
          ccGetMyWishes(),
        ]);
        if (cancelled) return;
        setProfile(profResp.data?.user || null);
        setConnections(connResp.data?.connections || []);
        const feedbacks = feedbackResp.data?.feedback || [];
        const done = feedbacks.filter((f) => f.wants_to_continue).length;
        setConversationsDone(done);
        setBadgeData(badgeResp.data?.badges || []);
        setMasterclasses(progResp.data?.event?.sessions || []);
        setBookings(bookingResp.data?.bookings || []);
        setWishes(wishResp.data?.wishes || []);
        const reg = profResp.data?.user?.registrations?.[0];
        setTicketCode(reg?.ticket_code || null);
      } catch (err) {
        if (!cancelled) console.error('Failed to load mentee home data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadData();
    return () => { cancelled = true; };
  }, []); // run once per mount

  const bookedSessionIds = new Set(bookings.map((b) => b.session_id));
  const wishedMentorIds = new Set(wishes.map((w) => w.mentor_id));

  const myName = profile?.name || 'Utilizador';
  const myCourse = profile?.menteeProfile?.course || '';
  const connectionsCount = connections.length;
  const badges = [
    { label: 'Primeira ligação',  earned: conversationsDone >= 1 },
    { label: 'Meio caminho',      earned: conversationsDone >= 4 },
    { label: 'Passaporte completo', earned: conversationsDone >= 8 },
    { label: 'Primeira conexão',  earned: connectionsCount > 0 },
    { label: 'Mentoria ativa',    earned: badgeData.some((b) => b.code === 'MENTORIA_ATIVA') },
  ];

  if (loading) {
    return (
      <div role="status" aria-busy="true" aria-label="A carregar">
        <SkeletonBar w="55%" h={26} className="mb-2" />
        <SkeletonBar w="45%" h={12} className="mb-4" />

        <SkeletonCard navy>
          <div className="flex gap-3 items-center">
            <div className="flex-1 space-y-2">
              <SkeletonBar w="30%" h={10} style={{ background: 'rgba(255,255,255,.15)' }} />
              <SkeletonBar w="65%" h={16} style={{ background: 'rgba(255,255,255,.15)' }} />
              <SkeletonBar w="50%" h={11} style={{ background: 'rgba(255,255,255,.15)' }} />
              <SkeletonBar w="40%" h={14} className="mt-3" style={{ background: 'rgba(255,255,255,.15)' }} />
            </div>
            <div className="animate-pulse rounded-[10px]" style={{ width: 104, height: 104, background: 'rgba(255,255,255,.12)' }} />
          </div>
        </SkeletonCard>

        <SkeletonCard navy>
          <div className="flex gap-3 items-center">
            <div className="animate-pulse rounded-full" style={{ width: 104, height: 104, background: 'rgba(255,255,255,.12)' }} />
            <div className="flex-1 space-y-2">
              <SkeletonBar w="40%" h={13} style={{ background: 'rgba(255,255,255,.15)' }} />
              <SkeletonBar w="70%" h={11} style={{ background: 'rgba(255,255,255,.15)' }} />
            </div>
          </div>
        </SkeletonCard>

        {[0, 1].map((i) => (
          <SkeletonCard key={i}>
            <SkeletonBar w="35%" h={14} />
            <div className="flex gap-1.5 flex-wrap mt-2.5">
              {[0, 1, 2, 3].map((j) => (
                <SkeletonBar key={j} w={90} h={26} r={13} />
              ))}
            </div>
          </SkeletonCard>
        ))}

        <SkeletonCard>
          <SkeletonBar w="50%" h={14} />
          <SkeletonBar w="30%" h={11} className="mt-2" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex justify-between items-center mt-2.5 gap-2.5">
              <SkeletonBar w="60%" h={12} />
              <SkeletonBar w={72} h={34} r={17} />
            </div>
          ))}
        </SkeletonCard>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Olá, {getFirstName(myName)}.</h2>
      <p className="text-ink-muted text-[.85rem] mt-1 mb-4">4 Dez 2026 · 14H00 · Hotel Cardoso</p>

      <Card variant="navy">
        <div className="flex gap-3 items-center">
          <div className="flex-1 min-w-0">
            <div className="text-[.76rem] font-bold text-primary-300 uppercase tracking-wide">Bilhete</div>
            <h3 className="mt-1 text-[1.08rem] font-extrabold">{myName}</h3>
            <p className="text-[.85rem] text-navy-100">Mentorado · {myCourse}</p>
            <p className="font-extrabold text-[1.05rem] mt-3 tracking-widest">{ticketCode || 'CC-....'}</p>
            <p className="text-[.76rem] text-navy-100 mt-0.5">Disponível sem rede</p>
          </div>
          <QrCode value={ticketCode || 'CC-7K2QF'} size={104} downloadable />
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
            <p className="text-[.85rem] text-navy-100">{conversationsDone} de 8 conversas · {connectionsCount} conexões</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3.5"><b>Prepara-te</b></div>
        <div className="flex gap-1.5 flex-wrap mt-2.5">
          <ChecklistItem label="Perfil completo" done={!!profile} />
          <ChecklistItem label="Pitch escrito" done={!!(profile?.menteeProfile?.pitch)} />
          <ChecklistItem label="3 mentores marcados" done={wishedMentorIds.size >= 3} />
          <ChecklistItem label="Masterclasses reservadas" done={bookings.length > 0} />
        </div>
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
        {masterclasses.length > 0 ? (
          masterclasses.map((s) => {
            const isBooked = bookedSessionIds.has(s.id);
            return (
              <div key={s.id} className="flex justify-between items-center mt-2.5 gap-2.5">
                <span className="text-[.85rem] flex-1">{s.title}</span>
                <button
                  onClick={async () => {
                    setBookingLoading((p) => ({ ...p, [s.id]: true }));
                    try {
                      await ccBookSession({ session_id: s.id });
                      setBookings((prev) => [...prev, { session_id: s.id }]);
                      bookedSessionIds.add(s.id);
                      showToastRef.current('Masterclass reservada.');
                    } catch (err) {
                      showToastRef.current(err.response?.data?.message || 'Erro ao reservar.');
                    } finally {
                      setBookingLoading((p) => { const { [s.id]: _, ...rest } = p; return rest; });
                    }
                  }}
                  className={`rounded-full font-bold text-[.76rem] h-[34px] px-3.5 ${isBooked || bookingLoading[s.id] ? 'bg-surface2 text-ink-muted' : 'bg-primary-500 text-white'}`}
                  disabled={isBooked || bookingLoading[s.id]}
                >
                  {isBooked ? 'Reservado' : bookingLoading[s.id] ? 'A reservar...' : 'Reservar'}
                </button>
              </div>
            );
          })
        ) : (
          <p className="text-ink-muted text-[.85rem] mt-2">Sem masterclasses disponíveis.</p>
        )}
      </Card>
    </>
  );
};

// ── LIVE ─────────────────────────────────────
export const MenteeLive = ({
  currentRound, secondsLeft, isRehearsal, announcements, phaseLabel,
  mentorForMenteeRound, setActiveTab, showToast,
  questions, setQuestions, pollOptions, setPollOptions, pollVotes, setPollVotes, votedOption, setVotedOption, totalPollVotes,
  roundDataVersion,
}) => {
  const [roundData, setRoundData] = useState(null);
  const [mentorDirectory, setMentorDirectory] = useState([]);
  const [myMatches, setMyMatches] = useState(null);
  const [feedbackStatus, setFeedbackStatus] = useState(null);
  // Skeleton only matters for the async round card. Starts true on mount
  // when there is a round to load.
  const [loadingRound, setLoadingRound] = useState(
    currentRound >= 1 && currentRound <= 4
  );

  const showToastRef = useRef(showToast);
  useEffect(() => { showToastRef.current = showToast; });

  useEffect(() => {
    let cancelled = false;
    const loadRound = async () => {
      if (currentRound >= 1 && currentRound <= 4) {
        setLoadingRound(true);
        try {
          const [roundResp, matchResp] = await Promise.all([
            ccGetCurrentRound({}),
            ccGetMyMatch({}),
          ]);
          if (cancelled) return;
          setRoundData(roundResp.data?.round || null);
          setMyMatches(matchResp.data?.match || null);
        } catch (err) {
          if (!cancelled) console.error('Failed to load round data:', err);
        } finally {
          if (!cancelled) setLoadingRound(false);
        }
      } else {
        setLoadingRound(false);
      }
    };
    loadRound();
    return () => { cancelled = true; };
    // Re-run when the round actually changes or the parent signals new data,
    // but NOT on every render (showToast is behind a ref).
  }, [currentRound, roundDataVersion]);

  // Realtime polling for questions and polls during live rounds
  useEffect(() => {
    if (currentRound < 1 || currentRound > 4) return;
    let active = true;
    const interval = setInterval(async () => {
      try {
        const [qResp, pResp, prResp] = await Promise.all([
          ccGetQuestions({}),
          ccGetPolls({}),
          ccGetPollResults({}),
        ]);
        if (!active) return;
        setQuestions(qResp.data?.questions || []);
        const pollData = pResp.data?.poll || pResp.data?.polls?.[0] || null;
        if (pollData) {
          setPollOptions(Array.isArray(pollData.options) ? pollData.options : []);
        }
        const results = prResp.data?.results || prResp.data?.poll_results || [];
        if (results.length > 0) {
          const merged = results.map((r) => r.vote_count || r.count || r.votes || 0);
          if (merged.length > 0) setPollVotes(merged);
          const votedIdx = prResp.data?.voted_index;
          if (typeof votedIdx === 'number') setVotedOption(votedIdx);
        }
      } catch (err) {
        console.error('Realtime poll update failed:', err);
      }
    }, 5000);
    return () => { active = false; clearInterval(interval); };
  }, [currentRound, setQuestions, setPollOptions, setPollVotes, setVotedOption]);

  let body = null;

  if (currentRound >= 1 && currentRound <= 4 && loadingRound) {
    body = (
      <SkeletonCard navy>
        <div className="flex justify-between items-center">
          <SkeletonBar w="35%" h={12} style={{ background: 'rgba(255,255,255,.15)' }} />
          <SkeletonBar w="18%" h={24} style={{ background: 'rgba(255,255,255,.15)' }} />
        </div>
        <div className="animate-pulse rounded-full" style={{ height: 8, background: 'rgba(255,255,255,.12)' }} />
        <div className="flex gap-3 items-center mt-3">
          <div className="animate-pulse rounded-[18px]" style={{ width: 64, height: 64, background: 'rgba(255,255,255,.12)' }} />
          <div className="flex-1 space-y-2">
            <SkeletonBar w="25%" h={10} style={{ background: 'rgba(255,255,255,.15)' }} />
            <SkeletonBar w="60%" h={16} style={{ background: 'rgba(255,255,255,.15)' }} />
            <SkeletonBar w="45%" h={11} style={{ background: 'rgba(255,255,255,.15)' }} />
          </div>
        </div>
      </SkeletonCard>
    );
  } else if (currentRound === 0) {
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
    const match = myMatches;
    const mentor = match?.mentor;
    const menteeIds = match?.mentee_ids || [];
    const tableNo = match?.table_no || currentRound;
    const isMatched = !!mentor;

    if (!isMatched) {
      body = (
        <Card variant="navy">
          <div className="flex justify-between items-center">
            <span className="text-[.76rem] font-bold text-primary-300 uppercase tracking-wide">Ronda {currentRound} de 4</span>
            <span className="font-extrabold text-[1.7rem]">{formatTime(secondsLeft)}</span>
          </div>
          <div className="my-3 mb-4"><ProgressBar value={(secondsLeft / (isRehearsal ? 30 : 300)) * 100} /></div>
          <div className="text-center py-6">
            <p className="text-ink-muted text-[.85rem] mb-2">À espera de atribuição de mesa…</p>
            <p className="text-[.85rem] text-ink-muted">O organizador ainda não atribuiu um mentor para esta ronda.</p>
          </div>
        </Card>
      );
    } else {
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
                  {tableNo}
                </div>
              <div>
                <p className="text-[.76rem] text-navy-100">Mesa</p>
                <h3 className="text-[1.08rem] font-extrabold">{mentor.name}</h3>
                <p className="text-[.85rem] text-navy-100">{mentor.profile?.job_title || ''}, {mentor.profile?.company || ''}</p>
              </div>
            </div>
            <div className="flex gap-1.5 flex-wrap mt-2.5">
              <span className="bg-white/10 text-white rounded-full px-3 py-[5px] text-[.74rem] font-semibold">{mentor.profile?.sector || 'Área'}</span>
              <span className="bg-white/10 text-white rounded-full px-3 py-[5px] text-[.74rem] font-semibold">compatível</span>
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
                onClick={async () => {
                  try {
                    await ccSubmitFeedback({
                      match_id: match.id,
                      to_user_id: mentor.id,
                      wants_to_continue: true,
                    });
                    setFeedbackStatus('continue');
                    showToastRef.current('Interesse enviado.');
                  } catch (err) {
                    showToastRef.current(err.response?.data?.message || 'Erro ao guardar interesse.');
                  }
                }}
                className={`rounded-full font-bold text-[.82rem] h-10 px-4 ${feedbackStatus === 'continue' ? 'bg-primary-500 text-white' : 'bg-surface2 text-ink'}`}
              >
                {feedbackStatus === 'continue' ? 'Interesse enviado ✓' : 'Quero continuar'}
              </button>
              <button
                onClick={async () => {
                  try {
                    await ccSubmitFeedback({
                      match_id: match.id,
                      to_user_id: mentor.id,
                      wants_to_continue: false,
                    });
                    setFeedbackStatus('no');
                    showToastRef.current('Sem interesse.');
                  } catch (err) {
                    showToastRef.current(err.response?.data?.message || 'Erro ao guardar.');
                  }
                }}
                className={`rounded-full font-bold text-[.82rem] h-10 px-4 ${feedbackStatus === 'no' ? 'bg-surface2 text-ink' : 'bg-surface2 text-ink'}`}
              >
                {feedbackStatus === 'no' ? 'Sem interesse ✓' : 'Agora não'}
              </button>
            </div>
          </Card>
        </>
      );
    }
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
        {questions.length === 0 && (
          <p className="text-ink-muted text-[.85rem] mt-2">Sem perguntas ainda. Envia a primeira.</p>
        )}
        {questions.map((question, index) => (
          <div key={question.id || index} className="flex justify-between items-center mt-3 gap-2.5">
            <span className="text-[.85rem] flex-1">{question.body || question.text}</span>
            <button
              onClick={async () => {
                try {
                  const resp = await ccVoteQuestion({ question_id: question.id });
                  setQuestions((previous) => previous.map((q, i) => (i === index ? { ...q, votes: resp.data?.votes ?? q.votes, voted: resp.data?.voted } : q)));
                } catch (err) {
                  showToastRef.current(err.response?.data?.message || 'Erro ao votar.');
                }
              }}
              className={`rounded-full font-bold text-[.76rem] h-[34px] px-3.5 ${question.voted ? 'bg-primary-500 text-white' : 'bg-surface2 text-ink'}`}
            >
              ▲ {question.votes || 0}
            </button>
          </div>
        ))}
        <QuestionInput onSubmit={async (text) => {
          try {
            const resp = await ccCreateQuestion({ session_id: 'current', body: text });
            const created = resp.data?.question;
            setQuestions((previous) => [...previous, { ...created, votes: 0, mine: true }]);
            showToastRef.current('Pergunta enviada.');
          } catch (err) {
            showToastRef.current(err.response?.data?.message || 'Erro ao enviar pergunta.');
          }
        }} />
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3.5">
          <b>Sondagem</b>
          <span className="text-[.76rem] text-ink-muted">Maior obstáculo</span>
        </div>
        {pollOptions.map((option, index) => {
          const percentage = totalPollVotes ? Math.round((pollVotes[index] / totalPollVotes) * 100) : 0;
          const isVoted = votedOption === index;
          return (
            <div key={option} className="mt-3">
              <div className="flex justify-between text-[.85rem]">
                <span>{option}</span>
                <span className="text-ink-muted">{percentage}%</span>
              </div>
              <div className="mt-1.5"><ProgressBar value={percentage} /></div>
              <button
                onClick={async () => {
                  try {
                    const resp = await ccVotePoll({ poll_id: 'current', option_index: index });
                    setVotedOption(resp.data?.option_index ?? index);
                    showToastRef.current(resp.data?.voted ? (resp.data?.message === 'Vote changed' ? 'Voto alterado.' : 'Voto registado.') : 'Voto removido.');
                    const prResp = await ccGetPollResults({});
                    const results = prResp.data?.results || [];
                    if (results.length > 0) {
                      const merged = results.map((r) => r.votes || 0);
                      if (merged.length > 0) setPollVotes(merged);
                    }
                  } catch (err) {
                    showToastRef.current(err.response?.data?.message || 'Erro ao votar.');
                  }
                }}
                className={`mt-2 rounded-full font-bold text-[.76rem] h-[34px] px-3.5 ${isVoted ? 'bg-primary-500 text-white' : 'bg-surface2 text-ink'}`}
              >
                {isVoted ? 'Votado ✓' : 'Votar'}
              </button>
            </div>
          );
        })}
      </Card>
    </>
  );
};

// ── MENTORS ──────────────────────────────────
export const MenteeMentors = ({ showToast }) => {
  const [mentors, setMentors] = useState([]);
  const [wished, setWished] = useState([]);
  const [loading, setLoading] = useState(true);

  const showToastRef = useRef(showToast);
  useEffect(() => { showToastRef.current = showToast; });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [dirResp, wishResp] = await Promise.all([
          ccGetMentorDirectory({}),
          ccGetMyWishes(),
        ]);
        if (cancelled) return;
        setMentors(dirResp.data?.mentors || []);
        setWished((wishResp.data?.wishes || []).map((w) => w.mentor_id));
      } catch (err) {
        if (!cancelled) console.error('Failed to load mentors:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div role="status" aria-busy="true" aria-label="A carregar mentores">
        <SkeletonBar w="40%" h={26} className="mb-2" />
        <SkeletonBar w="80%" h={12} className="mb-4" />
        {[0, 1, 2, 3].map((i) => (
          <SkeletonCard key={i}>
            <SkeletonPersonRow />
            <div className="flex gap-1.5 flex-wrap mt-2.5">
              <SkeletonBar w={100} h={26} r={13} />
              <SkeletonBar w={80} h={26} r={13} />
            </div>
          </SkeletonCard>
        ))}
      </div>
    );
  }

  return (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Mentores</h2>
      <p className="text-ink-muted text-[.85rem] mt-1 mb-4">
        Marca até 5. Os marcados ganham bónus no matching. Marcados: {wished.length}/5
      </p>
      {mentors.map((mentor, index) => {
        const isWished = wished.includes(mentor.id);
        return (
          <Card key={mentor.id}>
            <PersonRow
              name={mentor.name}
              subtitle={[mentor.mentorProfile?.job_title, mentor.mentorProfile?.company].filter(Boolean).join(', ') || 'Mentor'}
              extra={
                <button
                  onClick={async () => {
                    if (isWished) {
                      try {
                        await ccRemoveWish({ mentor_id: mentor.id });
                        setWished((prev) => prev.filter((id) => id !== mentor.id));
                        showToastRef.current(`Interesse em ${mentor.name} removido.`);
                      } catch (err) {
                        showToastRef.current(err.response?.data?.message || 'Erro ao remover.');
                      }
                      return;
                    }
                    if (wished.length >= 5) return showToastRef.current('Máximo de 5 mentores.');
                    try {
                      await ccAddWish({ mentor_id: mentor.id });
                      setWished([...wished, mentor.id]);
                      showToastRef.current(`Interesse em ${mentor.name} guardado.`);
                    } catch (err) {
                      showToastRef.current(err.response?.data?.message || 'Erro ao guardar.');
                    }
                  }}
                  className={`rounded-full font-bold text-[.76rem] h-[34px] px-3.5 ${isWished ? 'bg-primary-500 text-white' : 'bg-surface2 text-ink'}`}
                >
                  {isWished ? 'Marcado ✓' : 'Quero'}
                </button>
              }
            />
            <div className="flex gap-1.5 flex-wrap mt-2.5">
              <span className="bg-surface text-ink-muted border border-line rounded-full px-3 py-[5px] text-[.74rem] font-semibold">{mentor.mentorProfile?.sector || 'Área'}</span>
              <span className="bg-surface text-ink-muted border border-line rounded-full px-3 py-[5px] text-[.74rem] font-semibold">compatível</span>
            </div>
          </Card>
        );
      })}
    </>
  );
};

// ── MET ──────────────────────────────────────
export const MenteeMet = ({ showToast }) => {
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const showToastRef = useRef(showToast);
  useEffect(() => { showToastRef.current = showToast; });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [connResp, reqResp] = await Promise.all([
          ccGetConnections(),
          ccGetMyMentorshipRequests(),
        ]);
        if (cancelled) return;
        setConnections(connResp.data?.connections || []);
        setRequests(reqResp.data?.requests || []);
      } catch (err) {
        if (!cancelled) console.error('Failed to load met data:', err);
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
        {[0, 1].map((i) => (
          <SkeletonCard key={i}>
            <SkeletonPersonRow />
            <SkeletonBar w="60%" h={11} className="mt-3" />
            <SkeletonBar w={120} h={34} r={17} className="mt-3" />
          </SkeletonCard>
        ))}
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <>
        <h2 className="text-[1.45rem] font-extrabold tracking-tight">Quem conheci</h2>
        <p className="text-ink-muted text-[.85rem] mt-1 mb-4">Podes alterar o interesse até 7 dias depois do evento.</p>
        <Card>
          <b>Ainda sem conversas.</b>
          <p className="text-ink-muted text-[.85rem] mt-1.5">Quando o intervalo começar, as pessoas aparecem aqui.</p>
        </Card>
      </>
    );
  }

  return (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Quem conheci</h2>
      <p className="text-ink-muted text-[.85rem] mt-1 mb-4">Podes alterar o interesse até 7 dias depois do evento.</p>
      {connections.map((c) => {
        const contact = c.contact;
        const req = requests.find((r) => r.mentor_id === contact.id);
        return (
          <Card key={c.id}>
            <PersonRow name={contact.name} subtitle={contact.role || ''} />
            {(req?.status !== 'accepted' && req?.status !== 'pending') && (
              <textarea rows="2" placeholder="Nota privada, só tu vês" className="w-full mt-3 mb-0 text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 focus:border-primary-500 focus:outline-none" />
            )}
            <div className="flex items-center gap-2.5 mt-3">
              {req ? (
                <span className={`text-[.72rem] font-bold px-3 py-1 rounded-full ${
                  req.status === 'accepted' ? 'bg-success/15 text-success' : req.status === 'declined' ? 'bg-surface2 text-ink-muted' : 'bg-primary-50/15 text-primary-500'
                }`}>
                  {{ pending: 'Pedido enviado', accepted: 'Mentoria ativa', declined: 'Pedido recusado' }[req.status] || req.status}
                </span>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      await ccCreateMentorshipRequest({ mentor_id: contact.id, message: 'Olá, gostava de ter o teu apoio como mentor.' });
                      setRequests([...requests, { mentor_id: contact.id, status: 'pending', message: 'Olá, gostava de ter o teu apoio como mentor.' }]);
                      showToastRef.current('Pedido de mentoria enviado.');
                    } catch (err) {
                      showToastRef.current(err.response?.data?.message || 'Erro ao enviar pedido.');
                    }
                  }}
                  className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white"
                >
                  Pedir mentoria
                </button>
              )}
            </div>
          </Card>
        );
      })}
    </>
  );
};

// ── CONNECTIONS ──────────────────────────────
export const MenteeConnections = ({ showToast }) => {
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const showToastRef = useRef(showToast);
  useEffect(() => { showToastRef.current = showToast; });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [connResp, reqResp] = await Promise.all([
          ccGetConnections(),
          ccGetMyMentorshipRequests(),
        ]);
        if (cancelled) return;
        setConnections(connResp.data?.connections || []);
        setRequests(reqResp.data?.requests || []);
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
            <SkeletonBar w="60%" h={11} className="mt-3" />
            <SkeletonBar w={120} h={34} r={17} className="mt-3" />
          </SkeletonCard>
        ))}
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <>
        <h2 className="text-[1.45rem] font-extrabold tracking-tight">Conexões</h2>
        <p className="text-ink-muted text-[.85rem] mt-1 mb-4">Telemóvel e e-mail só aparecem aqui.</p>
        <Card>
          <b>Sem conexões ainda.</b>
          <p className="text-ink-muted text-[.85rem] mt-1.5">Marca interesse depois de cada conversa.</p>
        </Card>
      </>
    );
  }

  return (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Conexões</h2>
      <p className="text-ink-muted text-[.85rem] mt-1 mb-4">Telemóvel e e-mail só aparecem aqui.</p>
      {connections.map((c) => {
        const contact = c.contact;
        const req = requests.find((r) => r.mentor_id === contact.id);
        return (
          <Card key={c.id}>
            <PersonRow name={contact.name} subtitle={contact.role || ''} />
            <p className="text-[.85rem] mt-3 mb-2.5">
              {contact.phone || '+258 84 000 0000'} · {contact.email || ''}
            </p>
            {req ? (
              <span className={`text-[.72rem] font-bold px-3 py-1 rounded-full ${
                req.status === 'accepted' ? 'bg-success/15 text-success' : 'bg-surface2 text-ink-muted'
              }`}>
                {{ pending: 'Pedido enviado', accepted: 'Mentoria ativa', declined: 'Pedido recusado' }[req.status] || req.status}
              </span>
            ) : (
              <button
                onClick={() => {
                  ccCreateMentorshipRequest({ mentor_id: contact.id, message: 'Olá, gostava de ter o teu apoio como mentor.' });
                  setRequests([...requests, { mentor_id: contact.id, status: 'pending', message: 'Olá, gostava de ter o teu apoio como mentor.' }]);
                  showToastRef.current('Pedido enviado.');
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
};


// ── MESSAGES ─────────────────────────────────
export const MenteeMessages = ({ showToast }) => {
  const [drafts, setDrafts] = useState({});
  const [conv, setConv] = useState({});
  const [connections, setConnections] = useState([]);
  const [sending, setSending] = useState({});
  const [loading, setLoading] = useState(true);

  // Stable ref for showToast so the load effect doesn't re-run when the
  // parent re-renders and passes a new function identity.
  const showToastRef = useRef(showToast);
  useEffect(() => { showToastRef.current = showToast; });

  // Refs to each conversation's scroll container
  const scrollRefs = useRef({});

  const scrollToNewest = (connectionId) => {
    const el = scrollRefs.current[connectionId];
    if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
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
        const conns = resp.data?.connections || [];
        setConnections(conns);

        const entries = await Promise.all(
          conns.map(async (c) => {
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
        Escreve apenas a mentores com quem estás conectado.
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
          <b>Sem conexões ainda.</b>
          <p className="text-ink-muted text-[.85rem] mt-1.5">
            Marca interesse depois de cada conversa para desbloquear mensagens.
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