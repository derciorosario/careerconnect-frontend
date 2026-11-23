import React, { useState, useEffect } from 'react';
import { ccGetQuestions, ccCreateQuestion, ccUpdateQuestion, ccDeleteQuestion } from '../api/client';
import { Card } from '../ui';

export const OrganizerQuestions = ({ showToast }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    body: '',
    status: 'visible',
    projected: false,
    anonymous: false,
  });

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const resp = await ccGetQuestions({ status: 'all' });
      setQuestions(resp.data?.questions || []);
    } catch (err) {
      console.error('Failed to load questions:', err);
      showToast('Erro ao carregar perguntas.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingQuestion) {
        await ccUpdateQuestion(editingQuestion.id, formData);
        showToast('Pergunta atualizada.');
      } else {
        await ccCreateQuestion(formData);
        showToast('Pergunta criada.');
      }
      setShowForm(false);
      setEditingQuestion(null);
      setFormData({ body: '', status: 'visible', projected: false, anonymous: false });
      loadQuestions();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erro ao guardar pergunta.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      body: question.body,
      status: question.status,
      projected: question.projected,
      anonymous: question.anonymous,
    });
    setShowForm(true);
  };

  const handleDelete = async (question) => {
    if (!window.confirm(`Remover pergunta "${question.body.slice(0, 50)}..."?`)) return;
    try {
      await ccDeleteQuestion(question.id);
      showToast('Pergunta removida.');
      loadQuestions();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erro ao remover pergunta.');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingQuestion(null);
    setFormData({ body: '', status: 'visible', projected: false, anonymous: false });
  };

  const statusColors = {
    visible: 'bg-primary-500 text-white',
    hidden: 'bg-surface2 text-ink',
    answered: 'bg-green-500 text-white',
  };

  const statusLabels = {
    visible: 'Visível',
    hidden: 'Oculta',
    answered: 'Respondida',
  };

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-3.5">
          <b>Perguntas (CRUD)</b>
          <button onClick={() => { setShowForm(true); setEditingQuestion(null); setFormData({ body: '', status: 'visible', projected: false, anonymous: false }); }} className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white">
            + Nova Pergunta
          </button>
        </div>
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-3 mb-4 p-4 bg-surface rounded-[14px] border border-line">
            <div>
              <label className="block text-[.85rem] font-semibold mb-1.5">Texto da pergunta</label>
              <textarea value={formData.body} onChange={(e) => setFormData({ ...formData, body: e.target.value })} rows="3" className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 focus:border-primary-500 focus:outline-none" required maxLength={500} />
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-[.85rem] font-semibold mb-1.5">Estado</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 focus:border-primary-500 focus:outline-none">
                  <option value="visible">Visível</option>
                  <option value="hidden">Oculta</option>
                  <option value="answered">Respondida</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.projected} onChange={(e) => setFormData({ ...formData, projected: e.target.checked })} className="w-4 h-4 accent-primary-500" />
                  <span className="text-[.85rem]">Projetada</span>
                </label>
              </div>
              <div className="flex items-end gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.anonymous} onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })} className="w-4 h-4 accent-primary-500" />
                  <span className="text-[.85rem]">Anónima</span>
                </label>
              </div>
              <div></div>
            </div>
            <div className="flex gap-2.5 justify-end mt-2">
              <button type="button" onClick={handleCancel} className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-surface2 text-ink">Cancelar</button>
              <button type="submit" disabled={loading} className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white disabled:opacity-50">
                {loading ? 'A guardar...' : editingQuestion ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </form>
        )}
        <div className="space-y-2">
          {questions.length > 0 ? (
            questions.map((question) => (
              <div key={question.id} className="bg-surface border border-line rounded-[14px] p-3">
                <div className="flex gap-2.5 items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`rounded-full px-2 py-0.5 text-[.68rem] font-semibold ${statusColors[question.status] || 'bg-surface2 text-ink'}`}>
                        {statusLabels[question.status] || question.status}
                      </span>
                      {question.projected && <span className="text-[.68rem] font-semibold text-amber-500">📺 Projetada</span>}
                      {question.anonymous && <span className="text-[.68rem] font-semibold text-ink-muted">👤 Anónima</span>}
                      <span className="text-[.68rem] text-ink-muted ml-auto font-mono">{question.id.slice(0, 8)}</span>
                    </div>
                    <p className="text-[.85rem]">{question.body}</p>
                    <div className="text-[.72rem] text-ink-muted mt-1">
                      Por: {question.user?.name || 'Desconhecido'} · {question.votes || 0} votos · {new Date(question.created_at).toLocaleString('pt-PT')}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleEdit(question)} className="rounded-full font-bold text-[.72rem] h-[30px] px-3 bg-primary-500 text-white">Editar</button>
                    <button onClick={() => handleDelete(question)} className="rounded-full font-bold text-[.72rem] h-[30px] px-3 bg-red-500 text-white">Remover</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-ink-muted text-[.85rem] py-4">Sem perguntas.</p>
          )}
        </div>
      </Card>
    </>
  );
};