import React, { useState } from 'react';
import { Card } from './ui';

const BTN_BASE = 'inline-block rounded-full bg-primary-500 text-white font-semibold text-base px-7 py-3.5 cursor-pointer no-underline hover:brightness-110 transition';
const FIELD_BASE = 'w-full font-normal text-base text-ink bg-surface border-2 border-line rounded-field px-3.5 py-3 focus:border-primary-500 focus:outline-none';

// ── SURVEY (F-53) ────────────────────────────
// NOTE: This survey is frontend-only (no backend connection).

const PARTICIPANT_SURVEY = [
  {
    id: 'geral',
    label: '1. Como avalias a tua experiência geral no Career Connect 2026?',
    type: 'radio',
    options: ['Muito satisfeito(a)', 'Satisfeito(a)', 'Pouco satisfeito(a)', 'Insatisfeito(a)'],
  },
  {
    id: 'masterclasses',
    label: '2. Como avalias a qualidade e impacto das masterclasses? (1 a 5)',
    type: 'ratings',
    items: [
      'Vicente Sitoe – Estratégias para o Primeiro Emprego',
      'Arafat Cossa – A Arte do Networking',
      'Marlene Chambule – Crescimento Pós-Contratação',
    ],
  },
  {
    id: 'conexao',
    label: '3. Como avalias o Momento Conexão para conhecer profissionais e mentores?',
    type: 'radio',
    options: ['Muito produtivo', 'Satisfatório', 'Pouco produtivo', 'Não consegui interagir suficientemente'],
  },
  {
    id: 'continuidade',
    label: '4. Estás preparado(a) para dar continuidade ao plano de mentoria e desafios práticos definidos com o teu mentor?',
    type: 'radio',
    options: ['Sim, totalmente motivado(a)', 'Sim, mas preciso de mais orientação', 'Não pretendo continuar o acompanhamento'],
  },
  {
    id: 'resultado',
    label: '5. Qual foi o resultado prático do evento para além do conhecimento?',
    type: 'radio',
    options: ['Encontrei um mentor', 'Conectei-me com excelentes profissionais', 'Tenho uma entrevista de estágio/emprego marcada', 'Nada de concreto'],
  },
  {
    id: 'plataforma',
    label: '6. Como avalias a plataforma digital do evento?',
    type: 'radio',
    options: ['Muito eficaz e fácil de usar', 'Eficaz mas não muito fácil de usar', 'Nada eficaz e nada prática'],
  },
];

const MENTOR_SURVEY = [
  {
    id: 'organizacao',
    label: '1. Como avalia a organização e a estrutura do evento?',
    type: 'radio',
    options: ['Muito satisfeito(a)', 'Satisfeito(a)', 'Pouco satisfeito(a)', 'Insatisfeito(a)'],
  },
  {
    id: 'potencial',
    label: '2. Considera que os participantes demonstraram o potencial e a postura necessários para o mercado de trabalho?',
    type: 'radio',
    options: ['Superaram as expectativas', 'Corresponderam às expectativas', 'Demonstraram necessidade de maior preparação'],
  },
  {
    id: 'matching',
    label: '3. A metodologia de matching facilitou a identificação de talentos alinhados ao seu perfil e experiência?',
    type: 'radio',
    options: ['Sim, de forma eficaz', 'Parcialmente', 'Prefiro o modelo tradicional baseado em CV'],
  },
  {
    id: 'disponibilidade',
    label: '4. Tem disponibilidade para assumir o acompanhamento contínuo do(s) mentorado(s)?',
    type: 'radio',
    options: ['Sim, compromisso confirmado', 'Sim, dependendo da agenda', 'Não tenho disponibilidade neste momento'],
  },
  {
    id: 'plataforma',
    label: '5. Como avalia a plataforma digital do evento?',
    type: 'radio',
    options: ['Muito eficaz e fácil de usar', 'Eficaz mas não muito fácil de usar', 'Nada eficaz e nada prática'],
  },
];

const SurveyField = ({ label, children }) => (
  <div className="mb-5">
    <label className="block text-[.9rem] font-semibold mb-2.5 leading-snug">{label}</label>
    {children}
  </div>
);

const RadioOptions = ({ options, value, onChange }) => (
  <div className="space-y-2">
    {options.map((opt) => (
      <label
        key={opt}
        className={`flex items-center gap-2.5 rounded-[14px] border-2 px-3.5 py-2.5 cursor-pointer transition ${
          value === opt ? 'border-primary-500 bg-primary-50' : 'border-line bg-surface hover:border-primary-500/50'
        }`}
      >
        <input
          type="radio"
          checked={value === opt}
          onChange={() => onChange(opt)}
          className="w-4 h-4 accent-primary-500"
        />
        <span className="text-[.88rem]">{opt}</span>
      </label>
    ))}
  </div>
);

const RatingOptions = ({ value, onChange }) => (
  <div className="flex gap-2">
    {[1, 2, 3, 4, 5].map((r) => (
      <button
        key={r}
        type="button"
        onClick={() => onChange(r)}
        className={`w-11 h-11 rounded-full font-bold flex items-center justify-center transition ${
          value === r ? 'bg-primary-500 text-white' : 'bg-surface-soft text-ink border border-line'
        }`}
      >
        {r}
      </button>
    ))}
  </div>
);

export const SurveyScreen = ({ showToast }) => {
  const role = localStorage.getItem('userRole') || '';
  const isMentor = role === 'mentor';
  const survey = isMentor ? MENTOR_SURVEY : PARTICIPANT_SURVEY;

  const [answers, setAnswers] = useState({});
  const [ratings, setRatings] = useState({});
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const setAnswer = (id, val) => setAnswers((p) => ({ ...p, [id]: val }));
  const setRating = (id, val) => setRatings((p) => ({ ...p, [id]: val }));

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
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Formulário de Avaliação do Evento</h2>
      <p className="text-ink-muted text-[.85rem] mt-1 mb-6">
        {isMentor ? 'Avaliação do Mentor' : 'Avaliação da Experiência do Participante'} · Career Connect 2026
      </p>

      <Card>
        {survey.map((field) => (
          <SurveyField key={field.id} label={field.label}>
            {field.type === 'radio' && (
              <RadioOptions
                options={field.options}
                value={answers[field.id]}
                onChange={(v) => setAnswer(field.id, v)}
              />
            )}
            {field.type === 'ratings' && (
              <div className="space-y-3.5">
                {field.items.map((item) => (
                  <div key={item}>
                    <p className="text-[.82rem] text-ink-muted mb-1.5">{item}</p>
                    <RatingOptions value={ratings[item]} onChange={(v) => setRating(item, v)} />
                  </div>
                ))}
              </div>
            )}
          </SurveyField>
        ))}

        <SurveyField label={isMentor ? 'Que sugestões deixa para a organização?' : 'Tens algum comentário/sugestão final para a organização? (resposta aberta)'}>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows="3" placeholder="Escreve o teu comentário..." className={FIELD_BASE} />
        </SurveyField>

        <button
          onClick={async () => {
            setLoading(true);
            try {
              // Frontend-only: no backend call. Persist nothing.
              setSubmitted(true);
              showToast('Inquérito submetido.');
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className={`${BTN_BASE} w-full mt-2`}
        >
          {loading ? 'A submeter...' : 'Submeter inquérito'}
        </button>
      </Card>
    </>
  );
};