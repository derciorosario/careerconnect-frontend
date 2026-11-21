import React, { useState } from 'react';
import { MENTEES, MY_MENTEE_INDEX } from './data';
import { Card, ProgressBar } from './ui';

const BTN_BASE = 'inline-block rounded-full bg-primary-500 text-white font-semibold text-base px-7 py-3.5 cursor-pointer no-underline hover:brightness-110 transition';

// ── SURVEY (F-53) ────────────────────────────
export const SurveyScreen = ({ showToast }) => {
  const [rating, setRating] = useState(null);
  const [nps, setNps] = useState(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <>
        <h2 className="text-[1.45rem] font-extrabold tracking-tight">Obrigado pelo teu feedback.</h2>
        <p className="text-ink-muted text-[.85rem] mt-1 mb-6">A tua opinião ajuda a melhorar o próximo evento.</p>
        <Card variant="navy">
          <div className="text-center">
            <div className="text-3xl font-extrabold text-primary-500 mb-2">✓</div>
            <p className="text-navy-100">Inquérito submetido com sucesso.</p>
          </div>
        </Card>
        <button onClick={() => showToast('Resultado guardado.')} className={BTN_BASE} style={{ marginTop: 10 }}>Fechar</button>
      </>
    );
  }

  return (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Inquérito final</h2>
      <p className="text-ink-muted text-[.85rem] mt-1 mb-6">
        Quanto foi o teu nível de satisfação com o evento? A tua resposta é anónima.
      </p>

      <Card>
        <div className="flex items-center justify-between mb-3.5"><b>Avaliação geral (1 a 5)</b></div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((r) => (
            <button
              key={r}
              onClick={() => setRating(r)}
              className={`w-12 h-12 rounded-full font-bold flex items-center justify-center transition ${rating === r ? 'bg-primary-500 text-white' : 'bg-surface-soft text-ink border border-line'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </Card>

      <Card className="mt-5">
        <div className="flex items-center justify-between mb-3.5"><b>Recomendarias a um amigo? (0 a 10)</b></div>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <button
              key={n}
              onClick={() => setNps(n)}
              className={`w-8 h-8 rounded-full text-[.75rem] font-bold transition ${nps === n ? 'bg-primary-500 text-white' : 'bg-surface-soft text-ink border border-line'}`}
            >
              {n}
            </button>
          ))}
        </div>
      </Card>

      <Card className="mt-5">
        <label className="block text-[.85rem] font-semibold mb-1.5">Comentário</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows="3" placeholder="O que gostaste mais? O que podíamos melhorar?" className={FIELD_BASE} />
      </Card>

      <button
        onClick={() => { setSubmitted(true); showToast('Inquérito submetido.'); }}
        disabled={rating === null || nps === null}
        className={`${BTN_BASE} w-full mt-6 ${rating === null || nps === null ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        Submeter inquérito
      </button>
    </>
  );
};

// ── NEXT STEP (F-52) ─────────────────────────
export const NextStepScreen = ({ showToast }) => {
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [saved, setSaved] = useState(false);

  if (saved) {
    return (
      <>
        <h2 className="text-[1.45rem] font-extrabold tracking-tight">Compromisso guardado.</h2>
        <p className="text-ink-muted text-[.85rem] mt-1 mb-6">Receberás um lembrete nessa data.</p>
        <Card variant="navy">
          <div className="text-center">
            <div className="text-3xl font-extrabold text-primary-500 mb-2">✓</div>
            <p className="text-navy-100">{text}</p>
            <p className="text-navy-100 mt-1">{dueDate}</p>
          </div>
        </Card>
        <button onClick={() => showToast('Compromisso ativo.')} className={BTN_BASE} style={{ marginTop: 10 }}>Fechar</button>
      </>
    );
  }

  return (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">O meu próximo passo</h2>
      <p className="text-ink-muted text-[.85rem] mt-1 mb-6">
        Escreve um compromisso concreto para depois do evento e define uma data para cumpri-lo.
      </p>

      <Card>
        <label className="block text-[.85rem] font-semibold mb-1.5">O meu compromisso</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows="2" placeholder="Ex.: Marcar uma call com o meu mentor da área de Tecnologia" className={FIELD_BASE} />
      </Card>

      <Card className="mt-5">
        <label className="block text-[.85rem] font-semibold mb-1.5">Data do lembrete</label>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={FIELD_BASE} />
      </Card>

      <button
        onClick={() => { setSaved(true); showToast('Compromisso guardado com lembrete.'); }}
        disabled={!text || !dueDate}
        className={`${BTN_BASE} w-full mt-6 ${(!text || !dueDate) ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        Guardar compromisso
      </button>
    </>
  );
};

// ── DAILY SUMMARY (F-51) ─────────────────────
export const DailySummaryScreen = ({ conversations, connectionsCount, questionsAsked, showToast }) => {
  const badges = [
    { label: 'Primeira ligação', earned: conversations >= 1 },
    { label: 'Meio caminho', earned: conversations >= 4 },
    { label: 'Passaporte completo', earned: conversations >= 8 },
    { label: 'Primeira conexão', earned: connectionsCount > 0 },
    { label: 'Voz ativa', earned: questionsAsked > 0 },
  ];

  return (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Resumo do dia</h2>
      <p className="text-ink-muted text-[.85rem] mt-1 mb-6">Os teus números do Career Connect.</p>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3 mb-6">
        <Card variant="navy">
          <span className="text-primary-300 text-[.8rem] font-semibold block">Conversas</span>
          <b className="block text-[2rem] font-extrabold">{conversations}</b>
          <p className="text-navy-100 text-[.8rem] mt-1">de 8 possíveis</p>
        </Card>
        <Card variant="navy">
          <span className="text-primary-300 text-[.8rem] font-semibold block">Conexões</span>
          <b className="block text-[2rem] font-extrabold">{connectionsCount}</b>
          <p className="text-navy-100 text-[.8rem] mt-1">interesse mútuo</p>
        </Card>
        <Card variant="navy">
          <span className="text-primary-300 text-[.8rem] font-semibold block">Perguntas</span>
          <b className="block text-[2rem] font-extrabold">{questionsAsked}</b>
          <p className="text-navy-100 text-[.8rem] mt-1">aos oradores</p>
        </Card>
      </div>

      <Card className="mb-6">
        <div className="flex items-center justify-between mb-3.5"><b>Conquistas</b></div>
        <div className="flex gap-1.5 flex-wrap">
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

      <button onClick={() => showToast('Resumo partilhado como imagem (simulação).')} className={BTN_BASE} style={{ marginTop: 10 }}>Partilhar resumo</button>
    </>
  );
};

const FIELD_BASE = 'w-full font-normal text-base text-ink bg-surface border-2 border-line rounded-field px-3.5 py-3 focus:border-primary-500 focus:outline-none';
