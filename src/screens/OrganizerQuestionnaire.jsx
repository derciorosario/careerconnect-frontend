import React, { useState, useEffect } from 'react';
import { ccGetQuestionnaire, ccUpdateQuestionnaire, ccNotifySurvey } from '../api/client';
import { Card } from '../ui';

const uid = () => `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const emptyQuestion = () => ({ id: uid(), label: '', type: 'radio', options: ['Sim', 'Não'], items: [] });

const FIELD_INPUT = 'w-full bg-surface border-2 border-line rounded-[10px] px-3 py-2 text-[.88rem] focus:border-primary-500 focus:outline-none';
const BTN = 'rounded-full font-bold text-[.78rem] h-9 px-3.5';

const QuestionEditor = ({ question, index, onChange, onRemove }) => {
  const set = (patch) => onChange({ ...question, ...patch });

  const updateOption = (i, val) => {
    const options = question.options.map((o, idx) => (idx === i ? val : o));
    set({ options });
  };
  const addOption = () => set({ options: [...(question.options || []), ''] });
  const removeOption = (i) => set({ options: question.options.filter((_, idx) => idx !== i) });

  const updateItem = (i, val) => {
    const items = (question.items || []).map((o, idx) => (idx === i ? val : o));
    set({ items });
  };
  const addItem = () => set({ items: [...(question.items || []), ''] });
  const removeItem = (i) => set({ items: (question.items || []).filter((_, idx) => idx !== i) });

  return (
    <div className="border-2 border-line rounded-[14px] p-3.5 mb-3.5 bg-surface">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[.78rem] font-bold text-ink-muted">Pergunta {index + 1}</span>
        <button onClick={onRemove} className={`${BTN} bg-red-500 text-white`}>Remover</button>
      </div>

      <label className="block text-[.78rem] font-semibold mb-1">Texto da pergunta</label>
      <textarea
        value={question.label}
        onChange={(e) => set({ label: e.target.value })}
        rows="2"
        placeholder="Escreve a pergunta..."
        className={`${FIELD_INPUT} mb-3`}
      />

      <label className="block text-[.78rem] font-semibold mb-1">Tipo de pergunta</label>
      <select
        value={question.type}
        onChange={(e) => set({ type: e.target.value })}
        className={`${FIELD_INPUT} mb-3`}
      >
        <option value="radio">Escolha única (opções)</option>
        <option value="ratings">Avaliação 1 a 5 (itens)</option>
      </select>

      {question.type === 'radio' && (
        <div>
          <label className="block text-[.78rem] font-semibold mb-1.5">Opções</label>
          <div className="space-y-2">
            {(question.options || []).map((opt, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input value={opt} onChange={(e) => updateOption(i, e.target.value)} placeholder={`Opção ${i + 1}`} className={FIELD_INPUT} />
                <button onClick={() => removeOption(i)} className={`${BTN} bg-surface2 text-ink shrink-0`}>✕</button>
              </div>
            ))}
          </div>
          <button onClick={addOption} className={`${BTN} bg-primary-500 text-white mt-2`}>+ Opção</button>
        </div>
      )}

      {question.type === 'ratings' && (
        <div>
          <label className="block text-[.78rem] font-semibold mb-1.5">Itens a avaliar (1 a 5)</label>
          <div className="space-y-2">
            {(question.items || []).map((item, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input value={item} onChange={(e) => updateItem(i, e.target.value)} placeholder={`Item ${i + 1}`} className={FIELD_INPUT} />
                <button onClick={() => removeItem(i)} className={`${BTN} bg-surface2 text-ink shrink-0`}>✕</button>
              </div>
            ))}
          </div>
          <button onClick={addItem} className={`${BTN} bg-primary-500 text-white mt-2`}>+ Item</button>
        </div>
      )}
    </div>
  );
};

const SectionEditor = ({ title, questions, onChange }) => {
  const update = (i, q) => onChange(questions.map((item, idx) => (idx === i ? q : item)));
  const remove = (i) => onChange(questions.filter((_, idx) => idx !== i));
  const add = () => onChange([...questions, emptyQuestion()]);

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <b>{title} ({questions.length})</b>
        <button onClick={add} className={`${BTN} bg-primary-500 text-white`}>+ Adicionar pergunta</button>
      </div>
      {questions.length === 0 && <p className="text-ink-muted text-[.85rem]">Sem perguntas. Adiciona a primeira.</p>}
      {questions.map((q, i) => (
        <QuestionEditor key={q.id || i} question={q} index={i} onChange={(nq) => update(i, nq)} onRemove={() => remove(i)} />
      ))}
    </Card>
  );
};

const ImpactEditor = ({ impact, onChange }) => {
  const roles = [
    { key: 'mentee', label: 'Mentorado (Estudante)' },
    { key: 'mentor', label: 'Mentor Executivo' },
  ];
  const fields = [
    { key: 'conexao', label: 'Conexão' },
    { key: 'aplicacao', label: 'Aplicação Prática' },
    { key: 'resultados', label: 'Resultados Observados' },
  ];
  const set = (role, field, val) =>
    onChange({ ...impact, [role]: { ...impact[role], [field]: val } });

  return (
    <Card>
      <b className="block mb-3">Avaliação de Impacto (7 dias após)</b>
      {roles.map((role) => (
        <div key={role.key} className="mb-4">
          <h4 className="text-[.85rem] font-bold text-primary-500 mb-2">{role.label}</h4>
          {fields.map((f) => (
            <div key={f.key} className="mb-2.5">
              <label className="block text-[.75rem] font-semibold text-ink-muted mb-1">{f.label}</label>
              <textarea
                value={impact?.[role.key]?.[f.key] || ''}
                onChange={(e) => set(role.key, f.key, e.target.value)}
                rows="2"
                className={FIELD_INPUT}
              />
            </div>
          ))}
        </div>
      ))}
    </Card>
  );
};

export const OrganizerQuestionnaire = ({ showToast }) => {
  const [content, setContent] = useState(null);
  const [enabled, setEnabled] = useState({ main: true, impact: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifying, setNotifying] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const resp = await ccGetQuestionnaire({});
        const data = resp.data?.content || {};
        if (cancelled) return;
        setContent({
          participant: Array.isArray(data.participant) ? data.participant : [],
          mentor: Array.isArray(data.mentor) ? data.mentor : [],
          impact: data.impact || { mentee: {}, mentor: {} },
        });
        setEnabled({
          main: resp.data?.main_enabled !== false,
          impact: resp.data?.impact_enabled !== false,
        });
      } catch (err) {
        showToast(err.response?.data?.message || 'Erro ao carregar questionário.');
        if (!cancelled) setContent({ participant: [], mentor: [], impact: { mentee: {}, mentor: {} } });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await ccUpdateQuestionnaire({ content, main_enabled: enabled.main, impact_enabled: enabled.impact });
      showToast('Questionário atualizado.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Erro ao guardar questionário.');
    } finally {
      setSaving(false);
    }
  };

  const handleNotify = async (form) => {
    setNotifying(form);
    try {
      const resp = await ccNotifySurvey({ form });
      showToast(resp.data?.message || 'Notificação enviada.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Erro ao enviar notificação.');
    } finally {
      setNotifying(null);
    }
  };

  return (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Questionário de Avaliação</h2>
      <p className="text-ink-muted text-[.85rem] mt-1 mb-4">
        Edita as perguntas do formulário de avaliação. Adiciona, edita ou remove perguntas e opções.
      </p>

      <Card>
        <b className="block mb-3">Disponibilidade e notificações</b>
        <div className="flex items-center justify-between py-2.5 border-t border-line">
          <div>
            <p className="text-[.9rem] font-semibold">Formulário de Avaliação do Evento</p>
            <p className="text-[.78rem] text-ink-muted">Disponível para os utilizadores responderem.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              role="switch"
              aria-checked={enabled.main}
              onClick={() => setEnabled((p) => ({ ...p, main: !p.main }))}
              className={`relative w-12 h-7 rounded-full transition shrink-0 ${enabled.main ? 'bg-primary-500' : 'bg-line'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition ${enabled.main ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <button
              onClick={() => handleNotify('main')}
              disabled={notifying === 'main'}
              className="rounded-full font-bold text-[.76rem] h-9 px-3.5 bg-primary-500 text-white disabled:opacity-50"
            >
              {notifying === 'main' ? 'A enviar...' : 'Notificar'}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between py-2.5 border-t border-line">
          <div>
            <p className="text-[.9rem] font-semibold">Avaliação de Impacto da Mentoria</p>
            <p className="text-[.78rem] text-ink-muted">Disponível para os utilizadores responderem.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              role="switch"
              aria-checked={enabled.impact}
              onClick={() => setEnabled((p) => ({ ...p, impact: !p.impact }))}
              className={`relative w-12 h-7 rounded-full transition shrink-0 ${enabled.impact ? 'bg-primary-500' : 'bg-line'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition ${enabled.impact ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <button
              onClick={() => handleNotify('impact')}
              disabled={notifying === 'impact'}
              className="rounded-full font-bold text-[.76rem] h-9 px-3.5 bg-primary-500 text-white disabled:opacity-50"
            >
              {notifying === 'impact' ? 'A enviar...' : 'Notificar'}
            </button>
          </div>
        </div>
        <p className="text-[.75rem] text-ink-muted mt-2">As alterações de disponibilidade são guardadas ao clicar em “Guardar questionário”.</p>
      </Card>

      {loading || !content ? (
        <Card><p className="text-ink-muted text-[.85rem]">A carregar...</p></Card>
      ) : (
        <>
          <SectionEditor
            title="Perguntas do Participante"
            questions={content.participant}
            onChange={(participant) => setContent((c) => ({ ...c, participant }))}
          />
          <SectionEditor
            title="Perguntas do Mentor"
            questions={content.mentor}
            onChange={(mentor) => setContent((c) => ({ ...c, mentor }))}
          />
          <ImpactEditor impact={content.impact} onChange={(impact) => setContent((c) => ({ ...c, impact }))} />

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-full font-bold text-[.9rem] h-12 px-6 bg-primary-500 text-white w-full mt-2 disabled:opacity-50"
          >
            {saving ? 'A guardar...' : 'Guardar questionário'}
          </button>
        </>
      )}
    </>
  );
};