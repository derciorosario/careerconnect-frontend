import React, { useState } from 'react';
import {
  MENTEES, MENTORS, MY_MENTOR_INDEX, getFirstName, compatibilityScore,
  formatTime, generateQrSvg,
} from './data';
import { PersonRow, ProgressBar, Card } from './ui';

// ── HOME ─────────────────────────────────────
export const MentorHome = ({ mentorshipRequests, maxMenteesPerMentor }) => {
  const me = MENTORS[MY_MENTOR_INDEX];
  const acceptedCount = mentorshipRequests.filter((r) => r.mentorIndex === MY_MENTOR_INDEX && r.status === 'accepted').length;
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
        <div className="flex items-center justify-between mb-3.5">
          <b>Mentorados aceites</b>
          <span className="text-[.76rem] text-ink-muted">{acceptedCount} de {maxMenteesPerMentor}</span>
        </div>
        <ProgressBar value={(acceptedCount / maxMenteesPerMentor) * 100} />
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3.5"><b>Marcado por mentorados</b></div>
        <p className="text-[.85rem] text-ink-muted">3 pessoas marcaram-te "quero conhecer". Os nomes aparecem no evento.</p>
      </Card>
    </>
  );
};

// ── LIVE ─────────────────────────────────────
export const MentorLive = ({ currentRound, secondsLeft, phaseLabel, menteeForRound, showToast }) => {
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

  const menteeIndex = menteeForRound(MY_MENTOR_INDEX);
  const mentee = MENTEES[menteeIndex];

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
            {MY_MENTOR_INDEX + 1}
          </div>
          <div>
            <p className="text-[.76rem] text-navy-100">Mesa</p>
            <h3 className="text-[1.08rem] font-extrabold">1 mentorado</h3>
          </div>
        </div>
      </Card>

      <Card>
        <PersonRow name={mentee.name} subtitle={mentee.course} />
        <p className="text-[.85rem] mt-3"><b>Objetivo:</b> {mentee.goal}</p>
        <p className="text-[.85rem] mt-1"><b>Pitch:</b> {mentee.pitch}</p>
        <div className="flex gap-1.5 flex-wrap mt-2.5">
          <span className="bg-surface text-ink-muted border border-line rounded-full px-3 py-[5px] text-[.74rem] font-semibold">
            {compatibilityScore(menteeIndex, MY_MENTOR_INDEX)}% compatível
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
        <b>Queres continuar com {getFirstName(mentee.name)}?</b>
        <div className="flex gap-3 mt-3">
          <button onClick={() => showToast('Interesse guardado.')} className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white">Quero continuar</button>
          <button onClick={() => showToast('Ok.')} className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-surface2 text-ink">Agora não</button>
        </div>
      </Card>
    </>
  );
};

// ── REQUESTS ─────────────────────────────────
export const MentorRequests = ({ mentorshipRequests, setMentorshipRequests, maxMenteesPerMentor, showToast }) => {
  const myRequests = mentorshipRequests.filter((r) => r.mentorIndex === MY_MENTOR_INDEX);
  const accepted = myRequests.filter((r) => r.status === 'accepted').length;
  return (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Pedidos de mentoria</h2>
      <p className="text-ink-muted text-[.85rem] mt-1 mb-4">
        Aceites: {accepted} de {maxMenteesPerMentor}. Ao atingir o limite, "Aceitar" fica desativado.
      </p>
      {myRequests.length === 0 ? (
        <Card><b>Sem pedidos.</b></Card>
      ) : myRequests.map((request) => (
        <Card key={request.menteeIndex}>
          <PersonRow name={MENTEES[request.menteeIndex].name} subtitle={MENTEES[request.menteeIndex].course} />
          <p className="text-[.85rem] mt-3 mb-2.5">"{request.message}"</p>
          {request.status === 'pending' ? (
            <div className="flex gap-2.5">
              <button
                onClick={() => {
                  setMentorshipRequests((previous) => previous.map((r) => r === request ? { ...r, status: 'accepted' } : r));
                  showToast('Mentoria aceite.');
                }}
                disabled={accepted >= maxMenteesPerMentor}
                className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white disabled:opacity-40"
              >
                Aceitar
              </button>
              <button
                onClick={() => {
                  setMentorshipRequests((previous) => previous.map((r) => r === request ? { ...r, status: 'declined' } : r));
                  showToast('Pedido recusado.');
                }}
                className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-surface2 text-ink"
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
      ))}
    </>
  );
};

// ── CONNECTIONS ──────────────────────────────
export const MentorConnections = ({ mentorshipRequests }) => {
  const menteeIndices = [...new Set(mentorshipRequests.filter((r) => r.mentorIndex === MY_MENTOR_INDEX).map((r) => r.menteeIndex))];
  return (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Conexões</h2>
      <p className="text-ink-muted text-[.85rem] mt-1 mb-4">Contactos visíveis só entre conectados.</p>
      {menteeIndices.length === 0 ? (
        <Card><b>Sem conexões ainda.</b></Card>
      ) : menteeIndices.map((menteeIndex) => (
        <Card key={menteeIndex}>
          <PersonRow name={MENTEES[menteeIndex].name} subtitle={MENTEES[menteeIndex].course} />
          <p className="text-[.85rem] mt-3">+258 84 100 00{menteeIndex}0</p>
        </Card>
      ))}
    </>
  );
};

// ── MESSAGES ─────────────────────────────────
export const MentorMessages = ({ mentorshipRequests, showToast }) => {
  const [msg, setMsg] = useState('');
  const [conv, setConv] = useState({});

  const menteeIndices = [...new Set(mentorshipRequests.filter((r) => r.mentorIndex === MY_MENTOR_INDEX).map((r) => r.menteeIndex))];
  const myMentees = menteeIndices.map((i) => MENTEES[i]);
  return (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Mensagens</h2>
      <p className="text-ink-muted text-[.85rem] mt-1 mb-4">
        Escreve apenas a mentorados com quem estás conectado.
      </p>
      {myMentees.length === 0 ? (
        <Card>
          <b>Sem conexões ainda.</b>
          <p className="text-ink-muted text-[.85rem] mt-1.5">Aceita pedidos de mentoria para desbloquear mensagens.</p>
        </Card>
      ) : (
        <>
          <div className="space-y-3 mb-5">
            {myMentees.map((mentee) => {
              const key = String(menteeIndexOf(mentee.name));
              const msgs = conv[key] || [];
              return (
                <div key={mentee.name} className="border border-line rounded-[16px] p-3.5">
                  <div className="flex justify-between items-center mb-2.5">
                    <PersonRow name={mentee.name} subtitle={mentee.course} />
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
                      onClick={() => {
                        const key = String(menteeIndexOf(mentee.name));
                        setConv((p) => ({ ...p, [key]: [...(p[key] || []), { body: msg, mine: true }] }));
                        setMsg('');
                        showToast('Mensagem enviada.');
                      }}
                      className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white"
                    >
                      Enviar
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

function menteeIndexOf(name) {
  return MENTEES.findIndex((m) => m.name === name);
}