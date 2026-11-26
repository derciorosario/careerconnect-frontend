import React, { useState, useEffect } from 'react';
import { ccGetSurveyResults, ccGetQuestionnaire, ccDeleteSurveyResponse, ccDeleteAllSurveyResponses } from '../api/client';
import { Card } from '../ui';

const labelFor = (content, role, id) => {
  const list = role === 'mentor' ? content?.mentor : content?.participant;
  const found = Array.isArray(list) ? list.find((q) => q.id === id) : null;
  return found ? found.label : id;
};

// Shared rendering of a single response's details (used on screen and in print).
const SurveyDetails = ({ s, content }) => {
  const main = s.answers || {};
  const impactA = s.impact_answers || {};
  const role = main.role || impactA.role || s.user?.role || 'mentee';
  const fields = main.fields || {};
  const ratings = main.ratings || {};
  const impact = {
    conexao: impactA.conexao,
    aplicacao: impactA.aplicacao,
    resultados: impactA.resultados,
  };
  const impactText = role === 'mentor' ? content?.impact?.mentor : content?.impact?.mentee;

  return (
    <>
      {(s.main_sent || Object.keys(fields).length > 0 || Object.keys(ratings).length > 0) && (
        <div className="mb-2">
          <h4 className="text-[.78rem] font-bold text-primary-500 mb-1">Avaliação do Evento</h4>
          <div className="space-y-1.5">
            {Object.entries(fields).map(([id, val]) => (
              <div key={id} className="text-[.85rem]">
                <span className="text-ink-muted ">{labelFor(content, role, id)}: </span>
                <span className="font-semibold ">{val}</span>
              </div>
            ))}
            {Object.entries(ratings).map(([item, val]) => (
              <div key={item} className="text-[.85rem]">
                <span className="text-ink-muted">{item}: </span>
                <span className="font-semibold">{val}/5</span>
              </div>
            ))}
            {main.comment && (
              <div className="text-[.85rem]"><span className="text-ink-muted">Comentário: </span><span className="font-semibold">{main.comment}</span></div>
            )}
          </div>
        </div>
      )}

      {(s.impact_sent || impact.conexao || impact.aplicacao || impact.resultados) && (
        <div>
          <h4 className="text-[.78rem] font-bold text-primary-500 mb-1">Avaliação de Impacto</h4>
          <div className="space-y-1.5">
            {impact.conexao && (
              <div className="text-[.85rem]"><span className="text-ink-muted">Conexão: </span><span className="font-semibold">{impact.conexao}</span></div>
            )}
            {impact.aplicacao && (
              <div className="text-[.85rem]"><span className="text-ink-muted">Aplicação Prática: </span><span className="font-semibold">{impact.aplicacao}</span></div>
            )}
            {impact.resultados && (
              <div className="text-[.85rem]"><span className="text-ink-muted">{impactText?.resultados || 'Resultados Observados'}: </span><span className="font-semibold">{impact.resultados}</span></div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export const OrganizerResponses = ({ showToast }) => {
  const [surveys, setSurveys] = useState([]);
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingAll, setDeletingAll] = useState(false);

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

  const handleDelete = async (s) => {
    if (!window.confirm(`Eliminar a resposta de ${s.user?.name || 'Utilizador'}? Esta acção não pode ser desfeita.`)) return;
    setDeletingId(s.id);
    try {
      await ccDeleteSurveyResponse(s.id);
      setSurveys((prev) => prev.filter((x) => x.id !== s.id));
      showToast('Resposta eliminada.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Erro ao eliminar resposta.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Eliminar TODAS as respostas? Esta acção não pode ser desfeita.')) return;
    setDeletingAll(true);
    try {
      await ccDeleteAllSurveyResponses({});
      setSurveys([]);
      showToast('Todas as respostas foram eliminadas.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Erro ao eliminar respostas.');
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Respostas do Questionário</h2>
      <div className="flex items-center justify-between mt-1 mb-4">
        <p className="text-ink-muted text-[.85rem]">Total de respostas: {surveys.length}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDeleteAll}
            disabled={surveys.length === 0 || deletingAll}
            className="rounded-full font-bold text-[.78rem] h-9 px-3.5 bg-red-600 text-white disabled:opacity-50 print:hidden"
          >
            {deletingAll ? 'A eliminar...' : 'Eliminar todas'}
          </button>
          <button
            onClick={() => window.print()}
            disabled={surveys.length === 0}
            className="rounded-full font-bold text-[.78rem] h-9 px-3.5 bg-primary-500 text-white disabled:opacity-50 print:hidden"
          >
            Imprimir
          </button>
        </div>
      </div>

      {loading ? (
        <Card><p className="text-ink-muted text-[.85rem]">A carregar...</p></Card>
      ) : surveys.length === 0 ? (
        <Card><p className="text-ink-muted text-[.85rem]">Ainda sem respostas.</p></Card>
      ) : (
        surveys.map((s) => {
          const role = (s.answers?.role) || (s.impact_answers?.role) || s.user?.role || 'mentee';
          return (
            <Card key={s.id}>
              <div className="flex items-center justify-between mb-2">
                <b>{s.user?.name || 'Utilizador'}</b>
                <div className="flex items-center gap-2">
                  <span className="text-[.72rem] font-semibold text-ink-muted">
                    {role === 'mentor' ? 'Mentor' : 'Mentorado'} · {new Date(s.created_at).toLocaleString('pt-PT')}
                  </span>
                  <button
                    onClick={() => handleDelete(s)}
                    disabled={deletingId === s.id}
                    className="rounded-full font-bold text-[.72rem] h-[30px] px-3 bg-red-600 text-white disabled:opacity-50 print:hidden"
                  >
                    {deletingId === s.id ? '...' : 'Eliminar'}
                  </button>
                </div>
              </div>

              <SurveyDetails s={s} content={content} />
            </Card>
          );
        })
      )}

      {/* Print-only report: hidden on screen, revealed by the print stylesheet. */}
      <div className="print-section">
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 4 }}>Respostas do Questionário</h1>
        <p style={{ marginBottom: 12 }}>Total de respostas: {surveys.length}</p>
        {surveys.map((s) => {
          const role = (s.answers?.role) || (s.impact_answers?.role) || s.user?.role || 'mentee';
          return (
            <div key={s.id} style={{ pageBreakInside: 'avoid', marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid #ccc', color:'#000' }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                {s.user?.name || 'Utilizador'} · {role === 'mentor' ? 'Mentor' : 'Mentorado'} · {new Date(s.created_at).toLocaleString('pt-PT')}
              </div>
              <SurveyDetails s={s} content={content} />
            </div>
          );
        })}
      </div>
    </>
  );
};