import React, { useState, useEffect } from 'react';
import {
  getFirstName, formatTime, generateQrSvg,
} from './data';
import {
  ccGetProfile, ccGetMentorMatch, ccGetMentorshipRequestsForMentor,
  ccRespondMentorshipRequest, ccGetConnections, ccGetMessages, ccSendMessage,
  ccGetWishesForMentor, ccSubmitFeedback,
} from './api/client';
import { PersonRow, ProgressBar, Card } from './ui';

// ── HOME ─────────────────────────────────────
export const MentorHome = ({ showToast }) => {
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [maxMentees, setMaxMentees] = useState(3);
  const [wishesReceived, setWishesReceived] = useState([]);
  const [myMatch, setMyMatch] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [profResp, reqResp, wishResp, matchResp] = await Promise.all([
          ccGetProfile(),
          ccGetMentorshipRequestsForMentor(),
          ccGetWishesForMentor(),
          ccGetMentorMatch({}),
        ]);
        setProfile(profResp.data?.user || null);
        setRequests(reqResp.data?.requests || []);
        setMaxMentees(profResp.data?.user?.mentorProfile?.max_mentees || 3);
        setWishesReceived(wishResp.data?.wishes || []);
        setMyMatch(matchResp.data?.match || null);
      } catch (err) {
        console.error('Failed to load mentor home:', err);
      }
    };
    load();
  }, [showToast]);

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
            <h3 className="mt-1 text-[1.08rem] font-extrabold">{me?.name || 'Mentor'}</h3>
            <p className="text-[.85rem] text-navy-100">{tableNo ? `Mesa ${tableNo} fixa nos dois intervalos` : 'Mesa a atribuir no evento'}</p>
          </div>
          {me?.registrations?.[0]?.ticket_code ? (
            <div dangerouslySetInnerHTML={{ __html: generateQrSvg(me.registrations[0].ticket_code) }} />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: generateQrSvg('CC-MENTOR') }} />
          )}
        </div>
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
                <div key={wish.id} className="flex items-center gap-2.5 py-1">
                  <PersonRow
                    name={mentee?.name || 'Mentorado'}
                    subtitle={mentee?.menteeProfile?.goal || ''}
                  />
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
};

// ── LIVE ─────────────────────────────────────
export const MentorLive = ({ currentRound, secondsLeft, phaseLabel, showToast }) => {
  const [myMatch, setMyMatch] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (currentRound >= 1 && currentRound <= 4) {
        setLoading(true);
        try {
          const resp = await ccGetMentorMatch({});
          setMyMatch(resp.data?.match || null);
        } catch (err) {
          console.error('Failed to load mentor match:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    load();
  }, [currentRound, showToast]);

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

  const mentees = myMatch?.mentees || [];
  const tableNo = myMatch?.table_no || currentRound;

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
            {tableNo}
          </div>
          <div>
            <p className="text-[.76rem] text-navy-100">Mesa</p>
            <h3 className="text-[1.08rem] font-extrabold">{mentees.length} mentorado{mentees.length !== 1 ? 's' : ''}</h3>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card><p className="text-ink-muted text-[.85rem]">A carregar mentorados...</p></Card>
      ) : mentees.length === 0 ? (
        <Card>
          <b>Sem mentorados atribuídos.</b>
          <p className="text-ink-muted text-[.85rem] mt-1.5">O organizador ainda não atribuiu mentorados a esta mesa.</p>
        </Card>
      ) : (
        mentees.map((mentee) => (
          <div key={mentee.user_id}>
            <Card>
              <PersonRow name={mentee.name || 'Mentorado'} subtitle={mentee.goal || ''} />
              <p className="text-[.85rem] mt-3"><b>Objetivo:</b> {mentee.goal || 'Não definido'}</p>
              <p className="text-[.85rem] mt-1"><b>Pitch:</b> {mentee.pitch || 'Não definido'}</p>
              <div className="flex gap-1.5 flex-wrap mt-2.5">
                <span className="bg-surface text-ink-muted border border-line rounded-full px-3 py-[5px] text-[.74rem] font-semibold">
                  compatível
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
                      showToast('Interesse guardado.');
                    } catch (err) {
                      showToast(err.response?.data?.message || 'Erro ao guardar interesse.');
                    }
                  }}
                  className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white"
                >
                  Quero continuar
                </button>
                <button
                  onClick={async () => {
                    try {
                      await ccSubmitFeedback({
                        match_id: myMatch.id,
                        to_user_id: mentee.user_id,
                        wants_to_continue: false,
                      });
                      showToast('Ok.');
                    } catch (err) {
                      showToast(err.response?.data?.message || 'Erro ao guardar.');
                    }
                  }}
                  className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-surface2 text-ink"
                >
                  Agora não
                </button>
              </div>
            </Card>
          </div>
        ))
      )}
    </>
  );
};

// ── REQUESTS ─────────────────────────────────
export const MentorRequests = ({ showToast }) => {
  const [requests, setRequests] = useState([]);
  const [maxMentees, setMaxMentees] = useState(3);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const [reqResp, profResp] = await Promise.all([
          ccGetMentorshipRequestsForMentor(),
          ccGetProfile(),
        ]);
        setRequests(reqResp.data?.requests || []);
        setMaxMentees(profResp.data?.user?.mentorProfile?.max_mentees || 3);
      } catch (err) {
        console.error('Failed to load requests:', err);
      }
    };
    load();
  }, [showToast]);

  const accepted = requests.filter((r) => r.status === 'accepted').length;

  const handleRespond = async (request, status) => {
    if (actionLoading[request.id]) return;
    setActionLoading((p) => ({ ...p, [request.id]: true }));
    try {
      await ccRespondMentorshipRequest({ request_id: request.id, status });
      setRequests((prev) => prev.map((r) => r.id === request.id ? { ...r, status } : r));
      showToast(status === 'accepted' ? 'Mentoria aceite.' : 'Pedido recusado.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Erro ao responder.');
    } finally {
      setActionLoading((p) => { const { [request.id]: _, ...rest } = p; return rest; });
    }
  };

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
            <PersonRow name={request.mentee?.name || 'Mentorado'} subtitle={subtitle} />
            <p className="text-[.85rem] mt-3 mb-2.5">"{request.message || ''}"</p>
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
            ) : (
              <span className={`text-[.72rem] font-bold px-3 py-1 rounded-full ${request.status === 'accepted' ? 'bg-success/15 text-success' : 'bg-surface2 text-ink-muted'}`}>
                {request.status === 'accepted' ? 'Aceite' : 'Recusado'}
              </span>
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

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await ccGetConnections();
        setConnections(resp.data?.connections || []);
      } catch (err) {
        console.error('Failed to load connections:', err);
      }
    };
    load();
  }, [showToast]);

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
export const MentorMessages = ({ showToast }) => {
  const [msg, setMsg] = useState('');
  const [conv, setConv] = useState({});
  const [connections, setConnections] = useState([]);
  const [sending, setSending] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await ccGetConnections();
        const conns = resp.data?.connections || [];
        const menteeConns = conns.filter((c) => c.contact.role === 'mentee');
        setConnections(menteeConns);
        const entries = await Promise.all(
          menteeConns.map(async (c) => {
            try {
              const mResp = await ccGetMessages({ connection_id: c.id });
              const msgs = (mResp.data?.messages || []).map((m) => ({
                body: m.body,
                mine: m.from_user_id !== c.contact?.id,
              }));
              return [String(c.id), msgs];
            } catch {
              return [String(c.id), []];
            }
          })
        );
        setConv(Object.fromEntries(entries));
      } catch (err) {
        console.error('Failed to load connections:', err);
      }
    };
    load();
  }, [showToast]);

  const menteeConnections = connections;

  return (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Mensagens</h2>
      <p className="text-ink-muted text-[.85rem] mt-1 mb-4">
        Escreve apenas a mentorados com quem estás conectado.
      </p>
      {menteeConnections.length === 0 ? (
        <Card>
          <b>Sem conexões ainda.</b>
          <p className="text-ink-muted text-[.85rem] mt-1.5">Aceita pedidos de mentoria para desbloquear mensagens.</p>
        </Card>
      ) : (
        <>
          <div className="space-y-3 mb-5">
            {menteeConnections.map((c) => {
              const contact = c.contact;
              const key = String(c.id);
              const msgs = conv[key] || [];
              return (
                <div key={c.id} className="border border-line rounded-[16px] p-3.5">
                  <div className="flex justify-between items-center mb-2.5">
                    <PersonRow name={contact.name} subtitle={contact.role || ''} />
                    <span className="text-[.72rem] font-bold px-2 py-0.5 rounded-full bg-surface2 text-ink-muted">{msgs.length}</span>
                  </div>
                  <div className="max-h-[140px] overflow-y-auto mb-2.5 space-y-1.5 text-[.85rem]">
                    {msgs.length === 0 ? <p className="text-ink-muted">Sem mensagens ainda.</p> : msgs.map((m, i) => (
                      <div key={i} className={`text-[.85rem] rounded-[10px] px-3 py-1.5 max-w-[80%] ${m.mine ? 'ml-auto bg-primary-500 text-white' : 'bg-surface-soft text-ink'}`}>
                        {m.body}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Escreve uma mensagem…" className="flex-1 bg-surface border-2 border-line rounded-[10px] px-3 py-2 text-base focus:border-primary-500 focus:outline-none" />
                    <button
                      onClick={async () => {
                        if (!msg.trim() || sending[c.id]) return;
                        setSending((p) => ({ ...p, [c.id]: true }));
                        try {
                          const resp = await ccSendMessage({ connection_id: c.id, body: msg });
                          const sent = resp.data?.message;
                          setConv((p) => ({ ...p, [key]: [...(p[key] || []), { body: sent?.body || msg, mine: true }] }));
                          setMsg('');
                          showToast('Mensagem enviada.');
                        } catch (err) {
                          showToast(err.response?.data?.message || 'Erro ao enviar.');
                        } finally {
                          setSending((p) => { const { [c.id]: _, ...rest } = p; return rest; });
                        }
                      }}
                      disabled={sending[c.id]}
                      className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white disabled:opacity-50"
                    >
                      {sending[c.id] ? '...' : 'Enviar'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
};
