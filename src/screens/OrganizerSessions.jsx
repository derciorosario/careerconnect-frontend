import React, { useState, useEffect } from 'react';
import { ccGetSessions, ccCreateSession, ccUpdateSession, ccDeleteSession, ccGetAllUsers } from '../api/client';
import { Card } from '../ui';

export const OrganizerSessions = ({ showToast }) => {
  const [sessions, setSessions] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'masterclass',
    order: 0,
    challenge: '',
    starts_at: '',
    speaker_id: '',
  });

  useEffect(() => {
    loadSessions();
    loadSpeakers();
  }, []);

  const loadSessions = async () => {
    try {
      const resp = await ccGetSessions({});
      setSessions(resp.data?.sessions || []);
    } catch (err) {
      console.error('Failed to load sessions:', err);
      showToast('Erro ao carregar sessões.');
    }
  };

  const loadSpeakers = async () => {
    try {
      const resp = await ccGetAllUsers({});
      const allUsers = resp.data?.users || [];
      const speakerUsers = allUsers.filter(u => u.role === 'mentor' || u.role === 'organizer');
      setSpeakers(speakerUsers);
    } catch (err) {
      console.error('Failed to load speakers:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        order: Number(formData.order),
        speaker_id: formData.speaker_id || null,
        starts_at: formData.starts_at || null,
      };
      if (editingSession) {
        await ccUpdateSession(editingSession.id, payload);
        showToast('Sessão atualizada.');
      } else {
        await ccCreateSession(payload);
        showToast('Sessão criada.');
      }
      setShowForm(false);
      setEditingSession(null);
      setFormData({ title: '', type: 'masterclass', order: 0, challenge: '', starts_at: '', speaker_id: '' });
      loadSessions();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erro ao guardar sessão.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    setFormData({
      title: session.title,
      type: session.type,
      order: session.order,
      challenge: session.challenge || '',
      starts_at: session.starts_at ? new Date(session.starts_at).toISOString().slice(0, 16) : '',
      speaker_id: session.speaker_id || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (session) => {
    if (!window.confirm(`Remover sessão "${session.title}"?`)) return;
    try {
      await ccDeleteSession(session.id);
      showToast('Sessão removida.');
      loadSessions();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erro ao remover sessão.');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSession(null);
    setFormData({ title: '', type: 'masterclass', order: 0, challenge: '', starts_at: '', speaker_id: '' });
  };

  const typeLabels = {
    masterclass: 'Masterclass',
    break: 'Intervalo',
    coffee: 'Coffee Break',
  };

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-3.5">
          <b>Sessões</b>
          <button onClick={() => { setShowForm(true); setEditingSession(null); setFormData({ title: '', type: 'masterclass', order: 0, challenge: '', starts_at: '', speaker_id: '' }); }} className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white">
            + Nova Sessão
          </button>
        </div>
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-3 mb-4 p-4 bg-surface rounded-[14px] border border-line">
            <div>
              <label className="block text-[.85rem] font-semibold mb-1.5">Título</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 focus:border-primary-500 focus:outline-none" required maxLength={200} />
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-[.85rem] font-semibold mb-1.5">Tipo</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 focus:border-primary-500 focus:outline-none">
                  <option value="masterclass">Masterclass</option>
                  <option value="break">Intervalo</option>
                  <option value="coffee">Coffee Break</option>
                </select>
              </div>
              <div>
                <label className="block text-[.85rem] font-semibold mb-1.5">Ordem</label>
                <input type="number" min="0" value={formData.order} onChange={(e) => setFormData({ ...formData, order: e.target.value })} className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 focus:border-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[.85rem] font-semibold mb-1.5">Início</label>
                <input type="datetime-local" value={formData.starts_at} onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })} className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 focus:border-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[.85rem] font-semibold mb-1.5">Orador</label>
                <select value={formData.speaker_id} onChange={(e) => setFormData({ ...formData, speaker_id: e.target.value })} className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 focus:border-primary-500 focus:outline-none">
                  <option value="">-- Selecionar --</option>
                  {speakers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[.85rem] font-semibold mb-1.5">Desafio / Descrição</label>
              <textarea value={formData.challenge} onChange={(e) => setFormData({ ...formData, challenge: e.target.value })} rows="3" className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 focus:border-primary-500 focus:outline-none" maxLength={1000} />
            </div>
            <div className="flex gap-2.5 justify-end mt-2">
              <button type="button" onClick={handleCancel} className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-surface2 text-ink">Cancelar</button>
              <button type="submit" disabled={loading} className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white disabled:opacity-50">
                {loading ? 'A guardar...' : editingSession ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </form>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-[.88rem] border-collapse">
            <thead>
              <tr>
                <th className="text-left text-[.76rem] uppercase tracking-wide text-ink-muted font-semibold py-[11px] px-2 border-b border-line">ID</th>
                <th className="text-left text-[.76rem] uppercase tracking-wide text-ink-muted font-semibold py-[11px] px-2 border-b border-line">Título</th>
                <th className="text-left text-[.76rem] uppercase tracking-wide text-ink-muted font-semibold py-[11px] px-2 border-b border-line">Tipo</th>
                <th className="text-left text-[.76rem] uppercase tracking-wide text-ink-muted font-semibold py-[11px] px-2 border-b border-line">Ordem</th>
                <th className="text-left text-[.76rem] uppercase tracking-wide text-ink-muted font-semibold py-[11px] px-2 border-b border-line">Início</th>
                <th className="text-left text-[.76rem] uppercase tracking-wide text-ink-muted font-semibold py-[11px] px-2 border-b border-line">Orador</th>
                <th className="text-right text-[.76rem] uppercase tracking-wide text-ink-muted font-semibold py-[11px] px-2 border-b border-line">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length > 0 ? (
                sessions.map((session) => (
                  <tr key={session.id} className="border-b border-line last:border-0">
                    <td className="py-[11px] px-2 font-mono text-[.76rem] text-ink-muted">{session.id.slice(0, 8)}</td>
                    <td className="py-[11px] px-2"><b>{session.title}</b></td>
                    <td className="py-[11px] px-2">
                      <span className="rounded-full px-2 py-0.5 text-[.68rem] font-semibold bg-primary-100 text-primary-700">
                        {typeLabels[session.type] || session.type}
                      </span>
                    </td>
                    <td className="py-[11px] px-2">{session.order}</td>
                    <td className="py-[11px] px-2 text-[.82rem] text-ink-muted">{session.starts_at ? new Date(session.starts_at).toLocaleString('pt-PT') : '–'}</td>
                    <td className="py-[11px] px-2 text-[.82rem]">{session.speaker?.name || '–'}</td>
                    <td className="py-[11px] px-2 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleEdit(session)} className="rounded-full font-bold text-[.72rem] h-[30px] px-3 bg-primary-500 text-white">Editar</button>
                        <button onClick={() => handleDelete(session)} className="rounded-full font-bold text-[.72rem] h-[30px] px-3 bg-red-500 text-white">Remover</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="py-3 text-center text-ink-muted text-[.85rem]">Sem sessões criadas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
};