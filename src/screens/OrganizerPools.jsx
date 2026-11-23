import React, { useState, useEffect } from 'react';
import { ccGetOrganizerRounds, ccCreateRound, ccUpdateRound, ccDeleteRound } from '../api/client';
import { Card } from '../ui';

export const OrganizerPools = ({ showToast }) => {
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRound, setEditingRound] = useState(null);
  const [formData, setFormData] = useState({
    break_no: 1,
    round_no: 1,
    status: 'planned',
  });

  useEffect(() => {
    loadRounds();
  }, []);

  const loadRounds = async () => {
    try {
      const resp = await ccGetOrganizerRounds();
      setRounds(resp.data?.rounds || []);
    } catch (err) {
      console.error('Failed to load rounds:', err);
      showToast('Erro ao carregar pools.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingRound) {
        await ccUpdateRound(editingRound.id, formData);
        showToast('Pool atualizado.');
      } else {
        await ccCreateRound(formData);
        showToast('Pool criado.');
      }
      setShowForm(false);
      setEditingRound(null);
      setFormData({ break_no: 1, round_no: 1, status: 'planned' });
      loadRounds();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erro ao guardar pool.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (round) => {
    setEditingRound(round);
    setFormData({
      break_no: round.break_no,
      round_no: round.round_no,
      status: round.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (round) => {
    if (!window.confirm(`Remover pool ${round.break_no}.${round.round_no}?`)) return;
    try {
      await ccDeleteRound(round.id);
      showToast('Pool removido.');
      loadRounds();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erro ao remover pool.');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRound(null);
    setFormData({ break_no: 1, round_no: 1, status: 'planned' });
  };

  const statusColors = {
    planned: 'bg-surface2 text-ink',
    running: 'bg-primary-500 text-white',
    paused: 'bg-amber-500 text-white',
    done: 'bg-green-500 text-white',
  };

  const statusLabels = {
    planned: 'Planeado',
    running: 'A decorrer',
    paused: 'Pausado',
    done: 'Concluído',
  };

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-3.5">
          <b>Pools (Rondas)</b>
          <button onClick={() => { setShowForm(true); setEditingRound(null); setFormData({ break_no: 1, round_no: 1, status: 'planned' }); }} className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white">
            + Novo Pool
          </button>
        </div>
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-3 mb-4 p-4 bg-surface rounded-[14px] border border-line">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[.85rem] font-semibold mb-1.5">Intervalo (break_no)</label>
                <input type="number" min="1" value={formData.break_no} onChange={(e) => setFormData({ ...formData, break_no: Number(e.target.value) })} className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 focus:border-primary-500 focus:outline-none" required />
              </div>
              <div>
                <label className="block text-[.85rem] font-semibold mb-1.5">Ronda (round_no)</label>
                <input type="number" min="1" value={formData.round_no} onChange={(e) => setFormData({ ...formData, round_no: Number(e.target.value) })} className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 focus:border-primary-500 focus:outline-none" required />
              </div>
              <div>
                <label className="block text-[.85rem] font-semibold mb-1.5">Estado</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 focus:border-primary-500 focus:outline-none">
                  <option value="planned">Planeado</option>
                  <option value="running">A decorrer</option>
                  <option value="paused">Pausado</option>
                  <option value="done">Concluído</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2.5 justify-end mt-2">
              <button type="button" onClick={handleCancel} className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-surface2 text-ink">Cancelar</button>
              <button type="submit" disabled={loading} className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white disabled:opacity-50">
                {loading ? 'A guardar...' : editingRound ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </form>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-[.88rem] border-collapse">
            <thead>
              <tr>
                <th className="text-left text-[.76rem] uppercase tracking-wide text-ink-muted font-semibold py-[11px] px-2 border-b border-line">ID</th>
                <th className="text-left text-[.76rem] uppercase tracking-wide text-ink-muted font-semibold py-[11px] px-2 border-b border-line">Intervalo</th>
                <th className="text-left text-[.76rem] uppercase tracking-wide text-ink-muted font-semibold py-[11px] px-2 border-b border-line">Ronda</th>
                <th className="text-left text-[.76rem] uppercase tracking-wide text-ink-muted font-semibold py-[11px] px-2 border-b border-line">Estado</th>
                <th className="text-left text-[.76rem] uppercase tracking-wide text-ink-muted font-semibold py-[11px] px-2 border-b border-line">Início</th>
                <th className="text-left text-[.76rem] uppercase tracking-wide text-ink-muted font-semibold py-[11px] px-2 border-b border-line">Fim</th>
                <th className="text-right text-[.76rem] uppercase tracking-wide text-ink-muted font-semibold py-[11px] px-2 border-b border-line">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rounds.length > 0 ? (
                rounds.map((round) => (
                  <tr key={round.id} className="border-b border-line last:border-0">
                    <td className="py-[11px] px-2 font-mono text-[.76rem] text-ink-muted">{round.id.slice(0, 8)}</td>
                    <td className="py-[11px] px-2"><b>{round.break_no}</b></td>
                    <td className="py-[11px] px-2"><b>{round.round_no}</b></td>
                    <td className="py-[11px] px-2">
                      <span className={`rounded-full px-3 py-1 text-[.72rem] font-semibold ${statusColors[round.status] || 'bg-surface2 text-ink'}`}>
                        {statusLabels[round.status] || round.status}
                      </span>
                    </td>
                    <td className="py-[11px] px-2 text-[.82rem] text-ink-muted">{round.started_at ? new Date(round.started_at).toLocaleString('pt-PT') : '–'}</td>
                    <td className="py-[11px] px-2 text-[.82rem] text-ink-muted">{round.ends_at ? new Date(round.ends_at).toLocaleString('pt-PT') : '–'}</td>
                    <td className="py-[11px] px-2 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleEdit(round)} className="rounded-full font-bold text-[.72rem] h-[30px] px-3 bg-primary-500 text-white">Editar</button>
                        <button onClick={() => handleDelete(round)} className="rounded-full font-bold text-[.72rem] h-[30px] px-3 bg-red-500 text-white">Remover</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="py-3 text-center text-ink-muted text-[.85rem]">Sem pools criados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
};