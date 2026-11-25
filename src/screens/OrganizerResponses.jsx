import React, { useState, useEffect } from 'react';
import { ccGetSurveyResults, ccGetQuestionnaire } from '../api/client';
import { Card } from '../ui';

const labelFor = (content, role, id) => {
  const list = role === 'mentor' ? content?.mentor : content?.participant;
  const found = Array.isArray(list) ? list.find((q) => q.id === id) : null;
  return found ? found.label : id;
};

export const OrganizerResponses = ({ showToast }) => {
  const [surveys, setSurveys] = useState([]);
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [resp, qResp] = await Promise.all([
          ccGetSurveyResults({}),
          ccGetQuestionnaire({}),
        ]);
        if (cancelled) return;
        setSurveys(resp.data?.surveys || []);
        setContent(qResp.data?.content || {});
      } catch (err) {
        showToast(err.response?.data?.message || 'Erro ao carregar respostas.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Respostas do Questionário</h2>
      <p className="text-ink-muted text-[.85rem] mt-1 mb-4">Total de respostas: {surveys.length}</p>

      {loading ? (
        <Card><p className="text-ink-muted text-[.85rem]">A carregar...</p></Card>
      ) : surveys.length === 0 ? (
        <Card><p className="text-ink-muted text-[.85rem]">Ainda sem respostas.</p></Card>
      ) : (
        surveys.map((s) => {
          const a = s.answers || {};
          const role = a.role || s.user?.role || 'mentee';
          const fields = a.fields || {};
          const ratings = a.ratings || {};
          const impact = a.impact || {};
          const impactText = role === 'mentor' ? content?.impact?.mentor : content?.impact?.mentee;
          return (
            <Card key={s.id}>
              <div className="flex items-center justify-between mb-2">
                <b>{s.user?.name || 'Utilizador'}</b>
                <span className="text-[.72rem] font-semibold text-ink-muted">
                  {role === 'mentor' ? 'Mentor' : 'Mentorado'} · {new Date(s.created_at).toLocaleString('pt-PT')}
                </span>
              </div>

              <div className="space-y-1.5">
                {Object.entries(fields).map(([id, val]) => (
                  <div key={id} className="text-[.85rem]">
                    <span className="text-ink-muted">{labelFor(content, role, id)}: </span>
                    <span className="font-semibold">{val}</span>
                  </div>
                ))}

                {Object.entries(ratings).map(([item, val]) => (
                  <div key={item} className="text-[.85rem]">
                    <span className="text-ink-muted">{item}: </span>
                    <span className="font-semibold">{val}/5</span>
                  </div>
                ))}

                {impact.conexao && (
                  <div className="text-[.85rem]"><span className="text-ink-muted">Conexão: </span><span className="font-semibold">{impact.conexao}</span></div>
                )}
                {impact.aplicacao && (
                  <div className="text-[.85rem]"><span className="text-ink-muted">Aplicação Prática: </span><span className="font-semibold">{impact.aplicacao}</span></div>
                )}
                {impact.resultados && impactText?.resultados && (
                  <div className="text-[.85rem]"><span className="text-ink-muted">{impactText.resultados}: </span><span className="font-semibold">{impact.resultados}</span></div>
                )}

                {a.comment && (
                  <div className="text-[.85rem] mt-1"><span className="text-ink-muted">Comentário: </span><span className="font-semibold">{a.comment}</span></div>
                )}
                {a.impactComment && (
                  <div className="text-[.85rem]"><span className="text-ink-muted">Resultados observados: </span><span className="font-semibold">{a.impactComment}</span></div>
                )}
              </div>
            </Card>
          );
        })
      )}
    </>
  );
};