import React, { useState } from 'react';
import {
  MENTEES, MENTORS, MASTERCLASSES, POLL_OPTIONS, MUTUAL_MATCHES,
  MY_MENTEE_INDEX, ROUNDS, getFirstName, compatibilityScore,
  formatTime, generateQrSvg,
} from './data';
import { Avatar, PersonRow, ProgressBar, ChecklistItem, Card, QuestionInput } from './ui';
// ── HOME ─────────────────────────────────────
export const MenteeHome = ({ wishedMentors, setWishedMentors, connections, mentorshipRequests, furthestRoundCompleted, masterclassesReserved, setMasterclassesReserved, showToast }) => {
  const myMentee = MENTEES[MY_MENTEE_INDEX];
  const conversationsDone = furthestRoundCompleted || 0;
  const prepChecklist = [
    { label: 'Perfil completo', done: true },
    { label: 'Pitch escrito', done: true },
    { label: '3 mentores marcados', done: wishedMentors.length >= 3 },
    { label: 'Masterclasses reservadas', done: masterclassesReserved },
  ];
  const badges = [
    { label: 'Primeira ligação',  earned: conversationsDone >= 1 },
    { label: 'Meio caminho',      earned: conversationsDone >= 4 },
    { label: 'Passaporte completo', earned: conversationsDone >= 8 },
    { label: 'Primeira conexão',  earned: connections.length > 0 },
    { label: 'Mentoria ativa',    earned: mentorshipRequests.some((r) => r.menteeIndex === MY_MENTEE_INDEX && r.status === 'accepted') },
  ];

  return (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Olá, {getFirstName(myMentee.name)}.</h2>
      <p className="text-ink-muted text-[.85rem] mt-1 mb-4">4 Dez 2026 · 14H00 · Hotel Cardoso</p>

      <Card variant="navy">
        <div className="flex gap-3 items-center">
          <div className="flex-1 min-w-0">
            <div className="text-[.76rem] font-bold text-primary-300 uppercase tracking-wide">Bilhete</div>
            <h3 className="mt-1 text-[1.08rem] font-extrabold">{myMentee.name}</h3>
            <p className="text-[.85rem] text-navy-100">Mentorado · {myMentee.course}</p>
            <p className="font-extrabold text-[1.05rem] mt-3 tracking-widest">CC-7K2QF</p>
            <p className="text-[.76rem] text-navy-100 mt-0.5">Disponível sem rede</p>
          </div>
          <div dangerouslySetInnerHTML={{ __html: generateQrSvg('CC-7K2QF') }} />
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
            <p className="text-[.85rem] text-navy-100">{conversationsDone} de 8 conversas · {connections.length} conexões</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3.5"><b>Prepara-te</b></div>
        {prepChecklist.map((item) => (
          <ChecklistItem key={item.label} label={item.label} done={item.done} />
        ))}
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
        {MASTERCLASSES.map((title, index) => (
          <div key={index} className="flex justify-between items-center mt-2.5 gap-2.5">
            <span className="text-[.85rem] flex-1">{title}</span>
            <button
              onClick={() => {
                setMasterclassesReserved((previous) => !previous);
                showToast(!masterclassesReserved ? 'Lugares reservados.' : 'Reservas canceladas.');
              }}
              className={`rounded-full font-bold text-[.76rem] h-[34px] px-3.5 ${
                masterclassesReserved ? 'bg-surface2 text-ink' : 'bg-primary-500 text-white'
              }`}
            >
              {masterclassesReserved ? 'Reservado' : 'Reservar'}
            </button>
          </div>
        ))}
      </Card>
    </>
  );
};

// ── LIVE ─────────────────────────────────────
export const MenteeLive = ({
  currentRound, secondsLeft, isRehearsal, announcements, phaseLabel,
  mentorForMenteeRound, interestByMentor, setInterestByMentor,
  connectWithMentor, showToast, questions, setQuestions,
  pollVotes, setPollVotes, votedOption, setVotedOption, totalPollVotes,
  setActiveTab,
}) => {
  let body = null;

  if (currentRound === 0) {
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
    const mentorIndex = mentorForMenteeRound(MY_MENTEE_INDEX);
    const mentor = MENTORS[mentorIndex];
    const interest = interestByMentor[mentorIndex];
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
              {mentorIndex + 1}
            </div>
            <div>
              <p className="text-[.76rem] text-navy-100">Mesa</p>
              <h3 className="text-[1.08rem] font-extrabold">{mentor.name}</h3>
              <p className="text-[.85rem] text-navy-100">{mentor.role}, {mentor.company}</p>
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap mt-2.5">
            <span className="bg-white/10 text-white rounded-full px-3 py-[5px] text-[.74rem] font-semibold">{mentor.area}</span>
            <span className="bg-white/10 text-white rounded-full px-3 py-[5px] text-[.74rem] font-semibold">{compatibilityScore(MY_MENTEE_INDEX, mentorIndex)}% compatível</span>
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
              onClick={() => {
                setInterestByMentor((previous) => ({ ...previous, [mentorIndex]: true }));
                if (MUTUAL_MATCHES.includes(mentorIndex)) connectWithMentor(mentorIndex);
                else showToast('Interesse guardado.');
              }}
              className={`rounded-full font-bold text-[.82rem] h-10 px-4 ${interest === true ? 'bg-primary-500 text-white' : 'bg-surface2 text-ink'}`}
            >
              Quero continuar
            </button>
            <button
              onClick={() => { setInterestByMentor((previous) => ({ ...previous, [mentorIndex]: false })); showToast('Ok, sem interesse.'); }}
              className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-surface2 text-ink"
            >
              Agora não
            </button>
          </div>
        </Card>
      </>
    );
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
        {questions.map((question, index) => (
          <div key={index} className="flex justify-between items-center mt-3 gap-2.5">
            <span className="text-[.85rem] flex-1">{question.text}</span>
            <button
              onClick={() => setQuestions((previous) => previous.map((q, i) => (i === index ? { ...q, votes: q.votes + 1 } : q)))}
              className="rounded-full font-bold text-[.76rem] h-[34px] px-3.5 bg-surface2 text-ink"
            >
              ▲ {question.votes}
            </button>
          </div>
        ))}
        <QuestionInput onSubmit={(text) => { setQuestions((previous) => [...previous, { text, votes: 1, mine: true }]); showToast('Pergunta enviada.'); }} />
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3.5">
          <b>Sondagem</b>
          <span className="text-[.76rem] text-ink-muted">Maior obstáculo</span>
        </div>
        {POLL_OPTIONS.map((option, index) => {
          const percentage = totalPollVotes ? Math.round((pollVotes[index] / totalPollVotes) * 100) : 0;
          return (
            <div key={option} className="mt-3">
              <div className="flex justify-between text-[.85rem]">
                <span>{option}</span>
                <span className="text-ink-muted">{percentage}%</span>
              </div>
              <div className="mt-1.5"><ProgressBar value={percentage} /></div>
              {votedOption < 0 && (
                <button
                  onClick={() => {
                    setPollVotes((previous) => previous.map((v, i) => (i === index ? v + 1 : v)));
                    setVotedOption(index);
                    showToast('Voto registado.');
                  }}
                  className="mt-2 rounded-full font-bold text-[.76rem] h-[34px] px-3.5 bg-surface2 text-ink"
                >
                  Votar
                </button>
              )}
            </div>
          );
        })}
      </Card>
    </>
  );
};

// ── MENTORS ──────────────────────────────────
export const MenteeMentors = ({ wishedMentors, setWishedMentors, showToast }) => (
  <>
    <h2 className="text-[1.45rem] font-extrabold tracking-tight">Mentores</h2>
    <p className="text-ink-muted text-[.85rem] mt-1 mb-4">
      Marca até 5. Os marcados ganham bónus no matching. Marcados: {wishedMentors.length}/5
    </p>
    {MENTORS.map((mentor, index) => {
      const isWished = wishedMentors.includes(index);
      return (
        <Card key={index}>
          <PersonRow
            name={mentor.name}
            subtitle={`${mentor.role}, ${mentor.company}`}
            extra={
              <button
                onClick={() => {
                  if (isWished) setWishedMentors((previous) => previous.filter((i) => i !== index));
                  else if (wishedMentors.length >= 5) return showToast('Máximo de 5 mentores.');
                  else setWishedMentors((previous) => [...previous, index]);
                }}
                className={`rounded-full font-bold text-[.76rem] h-[34px] px-3.5 ${isWished ? 'bg-primary-500 text-white' : 'bg-surface2 text-ink'}`}
              >
                {isWished ? 'Marcado' : 'Quero'}
              </button>
            }
          />
          <div className="flex gap-1.5 flex-wrap mt-2.5">
            <span className="bg-surface text-ink-muted border border-line rounded-full px-3 py-[5px] text-[.74rem] font-semibold">{mentor.area}</span>
            <span className="bg-surface text-ink-muted border border-line rounded-full px-3 py-[5px] text-[.74rem] font-semibold">
              {compatibilityScore(MY_MENTEE_INDEX, index)}% compatível
            </span>
          </div>
        </Card>
      );
    })}
  </>
);

// ── MET ──────────────────────────────────────
export const MenteeMet = ({ metMentorIndices, interestByMentor, setInterestByMentor, connectWithMentor }) => (
  <>
    <h2 className="text-[1.45rem] font-extrabold tracking-tight">Quem conheci</h2>
    <p className="text-ink-muted text-[.85rem] mt-1 mb-4">Podes alterar o interesse até 7 dias depois do evento.</p>
    {metMentorIndices.length === 0 ? (
      <Card>
        <b>Ainda sem conversas.</b>
        <p className="text-ink-muted text-[.85rem] mt-1.5">Quando o intervalo começar, as pessoas aparecem aqui.</p>
      </Card>
    ) : metMentorIndices.map((mentorIndex) => {
      const mentor = MENTORS[mentorIndex];
      const interest = interestByMentor[mentorIndex];
      return (
        <Card key={mentorIndex}>
          <PersonRow name={mentor.name} subtitle={`${mentor.role}, ${mentor.company}`} />
          <textarea rows="2" placeholder="Nota privada, só tu vês" className="w-full mt-3 mb-0 text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 focus:border-primary-500 focus:outline-none" />
          <div className="flex items-center gap-2.5 mt-3">
            <button
              onClick={() => {
                setInterestByMentor((previous) => ({ ...previous, [mentorIndex]: true }));
                if (MUTUAL_MATCHES.includes(mentorIndex)) connectWithMentor(mentorIndex);
              }}
              className={`rounded-full font-bold text-[.82rem] h-10 px-4 ${interest === true ? 'bg-primary-500 text-white' : 'bg-surface2 text-ink'}`}
            >
              Quero continuar
            </button>
            <span className="text-[.85rem] text-ink-muted">
              {interest === true ? (MUTUAL_MATCHES.includes(mentorIndex) ? 'Interesse mútuo' : 'À espera do mentor') : ''}
            </span>
          </div>
        </Card>
      );
    })}
  </>
);

// ── CONNECTIONS ──────────────────────────────
export const MenteeConnections = ({ connections, mentorshipRequests, setMentorshipRequests, showToast }) => (
  <>
    <h2 className="text-[1.45rem] font-extrabold tracking-tight">Conexões</h2>
    <p className="text-ink-muted text-[.85rem] mt-1 mb-4">Telemóvel e e-mail só aparecem aqui.</p>
    {connections.length === 0 ? (
      <Card>
        <b>Sem conexões ainda.</b>
        <p className="text-ink-muted text-[.85rem] mt-1.5">Marca interesse depois de cada conversa.</p>
      </Card>
    ) : connections.map((mentorIndex) => {
      const mentor = MENTORS[mentorIndex];
      const request = mentorshipRequests.find((r) => r.mentorIndex === mentorIndex && r.menteeIndex === MY_MENTEE_INDEX);
      return (
        <Card key={mentorIndex}>
          <PersonRow name={mentor.name} subtitle={mentor.role} />
          <p className="text-[.85rem] mt-3 mb-2.5">
            +258 84 000 00{mentorIndex}0 · {getFirstName(mentor.name).toLowerCase()}@exemplo.co.mz
          </p>
          {request ? (
            <span className={`text-[.72rem] font-bold px-3 py-1 rounded-full ${
              request.status === 'accepted' ? 'bg-success/15 text-success' : 'bg-surface2 text-ink-muted'
            }`}>
              {{ pending: 'Pedido enviado', accepted: 'Mentoria ativa', declined: 'Pedido recusado' }[request.status]}
            </span>
          ) : (
            <button
              onClick={() => {
                setMentorshipRequests((previous) => [...previous, { mentorIndex, menteeIndex: MY_MENTEE_INDEX, status: 'pending', message: 'Olá, gostava de ter o teu apoio como mentor.' }]);
                showToast('Pedido enviado.');
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

// ── MESSAGES ─────────────────────────────────
export const MenteeMessages = ({ connections, mentorshipRequests, showToast }) => {
  const [msg, setMsg] = useState('');
  const [conv, setConv] = useState({});

  const myConnections = connections.map((mentorIndex) => MENTORS[mentorIndex]);
  return (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Mensagens</h2>
      <p className="text-ink-muted text-[.85rem] mt-1 mb-4">
        Escreve apenas a mentores com quem estás conectado.
      </p>
      {myConnections.length === 0 ? (
        <Card>
          <b>Sem conexões ainda.</b>
          <p className="text-ink-muted text-[.85rem] mt-1.5">Marca interesse depois de cada conversa para desbloquear mensagens.</p>
        </Card>
      ) : (
        <>
          <div className="space-y-3 mb-5">
            {myConnections.map((mentor) => {
              const key = String(mentorIndexOf(mentor.name));
              const msgs = conv[key] || [];
              return (
                <div key={mentor.name} className="border border-line rounded-[16px] p-3.5">
                  <div className="flex justify-between items-center mb-2.5">
                    <PersonRow name={mentor.name} subtitle={mentor.role} />
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
                        const key = String(mentorIndexOf(mentor.name));
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

function mentorIndexOf(name) {
  return MENTORS.findIndex((m) => m.name === name);
}