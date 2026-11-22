import React, { useState, useEffect } from 'react';
import {
  getFirstName, formatTime, generateQrSvg,
} from './data';
import {
  ccGetProfile, ccGetMyMatch, ccGetMentorshipRequestsForMentor,
  ccRespondMentorshipRequest, ccGetConnections, ccGetMessages, ccSendMessage,
} from './api/client';
import { PersonRow, ProgressBar, Card } from './ui';

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

// ── HOME ─────────────────────────────────────
export const MentorHome = ({ showToast }) => {
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [maxMentees, setMaxMentees] = useState(3);

  useEffect(() => {
    const load = async () => {
      try {
        const [profResp, reqResp] = await Promise.all([
          ccGetProfile(),
          ccGetMentorshipRequestsForMentor(),
        ]);
        setProfile(profResp.data?.user || null);
        setRequests(reqResp.data?.requests || []);
        setMaxMentees(profResp.data?.user?.mentorProfile?.max_mentees || 3);
      } catch (err) {
        console.error('Failed to load mentor home:', err);
      }
    };
    load();
  }, [showToast]);

  const me = profile || MENTORS[2];
  const acceptedCount = requests.filter((r) => r.status === 'accepted').length;

  return (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Olá, {getFirstName(me.name)}.</h2>
      <p className="text-ink-muted text-[.85rem] mt-1 mb-4">{me.phone || 'Mentor'} · {me.mentorProfile?.job_title || me.company || ''} · {profile?.mentorProfile?.approval === 'approved' ? 'Mentor aprovado' : 'A aguardar aprovação'}</p>

      <Card variant="navy">
        <div className="flex gap-3 items-center">
          <div className="flex-1 min-w-0">
            <div className="text-[.76rem] font-bold text-primary-300 uppercase tracking-wide">Bilhete</div>
            <h3 className="mt-1 text-[1.08rem] font-extrabold">{me.name}</h3>
            <p className="text-[.85rem] text-navy-100">Mesa {me.mentorProfile?.id ? 'fixa' : '1'} fixa nos dois intervalos</p>
          </div>
          <div dangerouslySetInnerHTML={{ __html: generateQrSvg('CC-MENTOR-C') }} />
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3.5">
          <b>Mentorados aceites</b>
          <span className="text-[.76rem] text-ink-muted">{acceptedCount} de {maxMentees}</span>
        </div>
        <ProgressBar value={(acceptedCount / maxMentees) * 100} />
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3.5"><b>Marcado por mentorados</b></div>
        <p className="text-[.85rem] text-ink-muted">Pessoas marcaram-te "quero conhecer". Os nomes aparecem no evento.</p>
      </Card>
    </>
  );
};

// ── LIVE ─────────────────────────────────────
export const MentorLive = ({ currentRound, secondsLeft, phaseLabel, showToast }) => {
  const [myMatch, setMyMatch] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (currentRound >= 1 && currentRound <= 4) {
        try {
          const resp = await ccGetMentorMatch({});
          setMyMatch(resp.data?.match || null);
        } catch (err) {
          console.error('Failed to load mentor match:', err);
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
  const mentee = mentees[0] || MENTEES[0];

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
            1
          </div>
          <div>
            <p className="text-[.76rem] text-navy-100">Mesa</p>
            <h3 className="text-[1.08rem] font-extrabold">{mentees.length} mentorado</h3>
          </div>
        </div>
      </Card>

      <Card>
        <PersonRow name={mentee.name || 'Mentorado'} subtitle={mentee.goal || ''} />
        <p className="text-[.85rem] mt-3"><b>Objetivo:</b> {mentee.goal || ''}</p>
        <p className="text-[.85rem] mt-1"><b>Pitch:</b> {mentee.pitch || ''}</p>
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
          <button onClick={() => showToast('Interesse guardado.')} className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white">Quero continuar</button>
          <button onClick={() => showToast('Ok.')} className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-surface2 text-ink">Agora não</button>
        </div>
      </Card>
    </>
  );
};

// ── REQUESTS ─────────────────────────────────
export const MentorRequests = ({ showToast }) => {
  const [requests, setRequests] = useState([]);
  const [maxMentees, setMaxMentees] = useState(3);

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

  return (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Pedidos de mentoria</h2>
      <p className="text-ink-muted text-[.85rem] mt-1 mb-4">
        Aceites: {accepted} de {maxMentees}. Ao atingir o limite, "Aceitar" fica desativado.
      </p>
      {requests.length === 0 ? (
        <Card><b>Sem pedidos.</b></Card>
      ) : requests.map((request) => {
        const mentee = MENTEES.find((m) => m.name === request.mentee?.name || m.name === 'Ana Mondlane') || MENTEES[0];
        return (
          <Card key={request.id}>
            <PersonRow name={request.mentee?.name || 'Mentorado'} subtitle={request.mentee?.goal || ''} />
            <p className="text-[.85rem] mt-3 mb-2.5">"{request.message || ''}"</p>
            {request.status === 'pending' ? (
              <div className="flex gap-2.5">
                <button
                  onClick={() => {
                    ccRespondMentorshipRequest({ request_id: request.id, status: 'accepted' });
                    setRequests(requests.map((r) => r.id === request.id ? { ...r, status: 'accepted' } : r));
                    showToast('Mentoria aceite.');
                  }}
                  disabled={accepted >= maxMentees}
                  className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white disabled:opacity-40"
                >
                  Aceitar
                </button>
                <button
                  onClick={() => {
                    ccRespondMentorshipRequest({ request_id: request.id, status: 'declined' });
                    setRequests(requests.map((r) => r.id === request.id ? { ...r, status: 'declined' } : r));
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
      <p className="text-ink-muted text-[.85rem] mt-1 mb-4">Contactos visíveis só entre conectados.</p>
      {menteeConnections.length === 0 ? (
        <Card><b>Sem conexões ainda.</b></Card>
      ) : menteeConnections.map((c) => {
        const contact = c.contact;
        return (
          <Card key={c.id}>
            <PersonRow name={contact.name} subtitle={contact.role || ''} />
            <p className="text-[.85rem] mt-3">{contact.phone || '+258 84 100 0000'}</p>
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
                      onClick={() => {
                        ccSendMessage({ connection_id: c.id, body: msg });
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
