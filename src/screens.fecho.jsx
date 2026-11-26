import React, { useState, useEffect } from 'react';
import { Card } from './ui';
import { ccGetQuestionnaire, ccSubmitSurvey, ccGetSurveyStatus } from './api/client';

const BTN_BASE = 'inline-block rounded-full bg-primary-500 text-white font-semibold text-base px-7 py-3.5 cursor-pointer no-underline hover:brightness-110 transition';
const FIELD_BASE = 'w-full font-normal text-base text-ink bg-surface border-2 border-line rounded-field px-3.5 py-3 focus:border-primary-500 focus:outline-none';

// ── SKELETON ─────────────────────────────────
const SkeletonBar = ({ w = '100%', h = 14, r = 7, className = '', style }) => (
  <div className={`animate-pulse bg-surface2 ${className}`} style={{ width: w, height: h, borderRadius: r, ...style }} />
);

const SkeletonCard = () => (
  <div className="bg-surface border border-line rounded-[18px] p-4 mb-3.5 space-y-4">
    {[0, 1, 2].map((i) => (
      <div key={i} className="space-y-2">
        <SkeletonBar w="80%" h={13} />
        <SkeletonBar w="100%" h={38} r={14} />
      </div>
    ))}
    <SkeletonBar w={140} h={40} r={20} />
  </div>
);

const SurveySkeleton = () => (
  <>
    <SkeletonBar w="55%" h={26} className="mb-2" />
    <SkeletonBar w="45%" h={12} className="mb-6" />
    <SkeletonCard />
    <SkeletonBar w="40%" h={22} className="mt-2 mb-4" />
    <SkeletonCard />
  </>
);

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
          value === opt ? 'border-primary-500 bg-primary-100' : 'border-line bg-surface hover:border-primary-500/50'
        }`}
      >
        <input
          type="radio"
          checked={value === opt}
          onChange={() => onChange(opt)}
          className={`w-4 h-4 accent-primary-400`}
        />
        <span className={`text-[.88rem] ${value === opt ? 'text-black':''}`}>{opt}</span>
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

// ── IMPACT (7 days after) ──────────────────────
const IMPACT = {
  mentee: {
    conexao: 'Já realizaste a primeira sessão de mentoria com o teu mentor?',
    aplicacao: 'Estás a aplicar as orientações e tarefas definidas durante a mentoria?',
    resultados: 'Que avanços concretos alcançaste desde o evento? (ex.: entrevistas, melhoria do CV, fortalecimento do LinkedIn, networking, candidaturas submetidas).',
  },
  mentor: {
    conexao: 'Já iniciou formalmente o acompanhamento do seu mentorado?',
    aplicacao: 'O mentorado demonstra compromisso com as atividades e metas acordadas?',
    resultados: 'Que evolução observou no comportamento, clareza de objetivos ou preparação profissional do mentorado?',
  },
};

const IMPACT_SIM_NAO = ['Sim', 'Não'];
const IMPACT_APLICACAO = ['Sim', 'Parcialmente', 'Não'];

const DEFAULT_CONTENT = {
  participant: PARTICIPANT_SURVEY,
  mentor: MENTOR_SURVEY,
  impact: IMPACT,
};

export const SurveyScreen = ({ showToast }) => {
  const role = localStorage.getItem('userRole') || '';
  const isMentor = role === 'mentor';

  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [enabled, setEnabled] = useState({ main: false, impact: false });
  const [sent, setSent] = useState({ main: false, impact: false });
  const [answers, setAnswers] = useState({});
  const [ratings, setRatings] = useState({});
  const [comment, setComment] = useState('');
  const [impact, setImpact] = useState({});
  const [impactComment, setImpactComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [qResp, sResp] = await Promise.all([
          ccGetQuestionnaire({}),
          ccGetSurveyStatus({}),
        ]);
        if (cancelled) return;
        const data = qResp.data?.content;
        if (data && Array.isArray(data.participant) && Array.isArray(data.mentor)) {
          setContent({ ...DEFAULT_CONTENT, ...data, impact: { ...DEFAULT_CONTENT.impact, ...(data.impact || {}) } });
        }
        setEnabled({
          main: qResp.data?.main_enabled !== false,
          impact: qResp.data?.impact_enabled !== false,
        });
        setSent({
          main: !!sResp.data?.main_sent,
          impact: !!sResp.data?.impact_sent,
        });
      } catch (err) {
        // Fallback to defaults silently
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const survey = isMentor ? content.mentor : content.participant;
  const impactText = isMentor ? content.impact.mentor : content.impact.mentee;

  const setAnswer = (id, val) => setAnswers((p) => ({ ...p, [id]: val }));
  const setRating = (id, val) => setRatings((p) => ({ ...p, [id]: val }));
  const setImpactAnswer = (id, val) => setImpact((p) => ({ ...p, [id]: val }));

  const handleSubmit = async (form, toastMsg) => {
    setLoading(true);
    try {
      if (form === 'impact') {
        await ccSubmitSurvey({
          event_id: 'current',
          form: 'impact',
          impact_answers: {
            role: isMentor ? 'mentor' : 'mentee',
            ...impact,
            resultados: impactComment,
          },
        });
        setSent((p) => ({ ...p, impact: true }));
      } else {
        await ccSubmitSurvey({
          event_id: 'current',
          form: 'main',
          comment,
          answers: {
            role: isMentor ? 'mentor' : 'mentee',
            fields: answers,
            ratings,
            comment,
          },
        });
        setSent((p) => ({ ...p, main: true }));
      }
      showToast(toastMsg || 'Submetido.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Erro ao submeter.');
    } finally {
      setLoading(false);
    }
  };

  const Unavailable = ({ message }) => (
    <Card>
      <p className="text-ink-muted text-[.9rem]">{message}</p>
    </Card>
  );

  return (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Formulário de Avaliação do Evento</h2>
      <p className="text-ink-muted text-[.85rem] mt-1 mb-6">
        {isMentor ? 'Avaliação do Mentor' : 'Avaliação da Experiência do Participante'} · Career Connect 2026
      </p>

      {initialLoading ? (
        <SurveySkeleton />
      ) : (
        <>
      {!enabled.main ? (
        <Unavailable message="O formulário de avaliação do evento ainda não está disponível." />
      ) : sent.main ? (
        <Unavailable message="Já submeteste o formulário de avaliação do evento. Obrigado!" />
      ) : (
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
            onClick={() => handleSubmit('main', 'Inquérito submetido.')}
            disabled={loading}
            className={`${BTN_BASE} w-full mt-2`}
          >
            {loading ? 'A submeter...' : 'Submeter inquérito'}
          </button>
        </Card>
      )}

      <hr className="my-8 border-line" />

      <h2 className="text-[1.3rem] font-extrabold tracking-tight">Avaliação de Impacto da Mentoria</h2>
      <p className="text-ink-muted text-[.85rem] mt-1 mb-6">7 dias após o evento</p>

      {!enabled.impact ? (
        <Unavailable message="A avaliação de impacto ainda não está disponível." />
      ) : sent.impact ? (
        <Unavailable message="Já submeteste a avaliação de impacto. Obrigado!" />
      ) : (
        <Card>
          <SurveyField label={`Conexão — ${impactText.conexao}`}>
            <RadioOptions options={IMPACT_SIM_NAO} value={impact.conexao} onChange={(v) => setImpactAnswer('conexao', v)} />
          </SurveyField>

          <SurveyField label={`Aplicação Prática — ${impactText.aplicacao}`}>
            <RadioOptions options={IMPACT_APLICACAO} value={impact.aplicacao} onChange={(v) => setImpactAnswer('aplicacao', v)} />
          </SurveyField>

          <SurveyField label={`Resultados Observados — ${impactText.resultados} (resposta aberta)`}>
            <textarea value={impactComment} onChange={(e) => setImpactComment(e.target.value)} rows="3" placeholder="Descreve os resultados observados..." className={FIELD_BASE} />
          </SurveyField>

          <button
            onClick={() => handleSubmit('impact', 'Avaliação de impacto submetida.')}
            disabled={loading}
            className={`${BTN_BASE} w-full mt-2`}
          >
            {loading ? 'A submeter...' : 'Submeter avaliação de impacto'}
          </button>
        </Card>
      )}
        </>
      )}
    </>
  );
};