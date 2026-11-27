import React, { useState, useEffect } from 'react';
import { ccGetAllUsers, ccGetRegistrationConfig, ccSetUserStatus, ccDeleteUser, uploadClient } from '../api/client';
import { Card, PersonRow, imgSrc, levelLabel } from '../ui';

// Normalise text for accent-insensitive search: lowercase and strip diacritics
// so "Dercio" matches "Dércio" and vice-versa.
const normalizeSearch = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const FIELD = 'w-full bg-surface border-2 border-line rounded-[10px] px-3 py-2 text-[.88rem] focus:border-primary-500 focus:outline-none';
const BTN = 'rounded-full font-bold text-[.82rem] h-10 px-4';

const DEFAULT_OPTS = {
  areas: [], goals: [], obstacles: [], support_types: [], levels: [],
};

const BASE_LEVELS = ['Estudante', 'Recém-graduado', 'Profissional Júnior'];

const Chip = ({ active, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full border px-3 py-1.5 text-[.82rem] font-medium transition ${active ? 'bg-primary-500 border-primary-500 text-white' : 'border-line text-ink bg-surface'}`}
  >
    {label}
  </button>
);

export const OrganizerUsers = ({ showToast }) => {
  const [users, setUsers] = useState([]);
  const [opts, setOpts] = useState(DEFAULT_OPTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null); // user being edited
  const [form, setForm] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [landingOnly, setLandingOnly] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [uResp, cResp] = await Promise.all([ccGetAllUsers(), ccGetRegistrationConfig({})]);
      setUsers(uResp.data?.users || []);
      const c = cResp.data || {};
      setOpts({
        areas: Array.isArray(c.areas) ? c.areas : [],
        goals: Array.isArray(c.goals) ? c.goals : [],
        obstacles: Array.isArray(c.obstacles) ? c.obstacles : [],
        support_types: Array.isArray(c.support_types) ? c.support_types : [],
        levels: Array.from(new Set([...BASE_LEVELS, ...(Array.isArray(c.levels) ? c.levels : [])])),
      });
    } catch (err) {
      showToast(err.response?.data?.message || 'Erro ao carregar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const openUser = (u) => {
    const mp = u.mentorProfile || {};
    const mep = u.menteeProfile || {};
    setEditing(u);
    setForm({
      name: u.name || '',
      phone: u.phone || '',
      linkedin_url: u.linkedin_url || '',
      photo_url: u.photo_url || '',
      photoFile: null,
      job_title: mp.job_title || '',
      company: mp.company || '',
      sector: mp.sector || '',
      years: mp.years || '',
      support_type: mp.support_type || '',
      show_on_landing: !!mp.show_on_landing,
      initials: mp.initials || '',
      biography: mp.biography || '',
      works: mp.works || '',
      interests: Array.isArray(mp.interests) ? mp.interests : [],
      can_help_goals: Array.isArray(mp.can_help_goals) ? mp.can_help_goals : [],
      level: mep.level ? levelLabel(mep.level) : '',
      course: mep.course || '',
      institution: mep.institution || '',
      goal: mep.goal || '',
      pitch: mep.pitch || '',
      job_obstacle: mep.job_obstacle || '',
      mentee_interests: Array.isArray(mep.interests) ? mep.interests : [],
    });
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggle = (k, val) => setForm((p) => {
    const cur = p[k] || [];
    return { ...p, [k]: cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val] };
  });

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('phone', form.phone);
      fd.append('linkedin_url', form.linkedin_url || '');
      if (form.photoFile) fd.append('photo', form.photoFile);
      else if (form.photo_url) fd.append('photo_url', form.photo_url);

      if (editing.role === 'mentor') {
        fd.append('mentorProfile', JSON.stringify({
          job_title: form.job_title, company: form.company, sector: form.sector,
          years: form.years ? Number(form.years) : null, support_type: form.support_type,
          show_on_landing: form.show_on_landing, initials: form.initials,
          biography: form.biography, works: form.works,
          interests: form.interests, can_help_goals: form.can_help_goals,
        }));
      } else {
        fd.append('menteeProfile', JSON.stringify({
          level: form.level || null, course: form.course, institution: form.institution,
          goal: form.goal, pitch: form.pitch, job_obstacle: form.job_obstacle || null,
          interests: form.mentee_interests,
        }));
      }

      const resp = await uploadClient.put(`/users/${editing.id}`, fd);
      const updated = resp.data?.user;
      if (updated) {
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      }
      showToast('Utilizador atualizado.');
      setEditing(null);
      setForm(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Erro ao guardar.');
    } finally {
      setSaving(false);
    }
  };

  const term = normalizeSearch(search.trim());

  const handleToggleActive = async (u) => {
    setActionId(u.id);
    try {
      const next = u.is_active === false;
      await ccSetUserStatus(u.id, next);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_active: next } : x)));
      showToast(next ? 'Utilizador activado.' : 'Utilizador desactivado.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Erro ao alterar estado.');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Eliminar ${u.name}? Todo o conteúdo criado com ou para este utilizador será removido. Esta acção não pode ser desfeita.`)) return;
    setActionId(u.id);
    try {
      await ccDeleteUser(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      showToast('Utilizador eliminado.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Erro ao eliminar.');
    } finally {
      setActionId(null);
    }
  };

  const filtered = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (landingOnly && !(u.role === 'mentor' && u.mentorProfile?.show_on_landing)) return false;
    if (!term) return true;
    return normalizeSearch(u.name).includes(term) || normalizeSearch(u.email).includes(term);
  });

  return (
    <>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-[1.45rem] font-extrabold tracking-tight">Utilizadores</h2>
          <p className="text-ink-muted text-[.85rem] mt-1">Edita mentores e mentorados.</p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className={`${BTN} bg-surface2 text-ink shrink-0 disabled:opacity-50`}
        >
          {refreshing ? 'A actualizar...' : 'Actualizar'}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por nome ou email..."
          className={FIELD}
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={`${FIELD} sm:max-w-[160px]`}>
          <option value="all">Todos</option>
          <option value="mentor">Mentores</option>
          <option value="mentee">Mentorados</option>
        </select>
      </div>
      <label className="flex items-center gap-2 text-[.82rem] font-semibold mb-4">
        <input type="checkbox" checked={landingOnly} onChange={(e) => setLandingOnly(e.target.checked)} className="w-auto" />
        Apenas os que aparecem na landing page
      </label>

      {loading ? (
        <Card><p className="text-ink-muted text-[.85rem]">A carregar...</p></Card>
      ) : filtered.length === 0 ? (
        <Card><p className="text-ink-muted text-[.85rem]">Nenhum utilizador encontrado.</p></Card>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((u) => (
            <Card key={u.id} className={u.is_active === false ? 'opacity-60' : ''}>
              <PersonRow
                name={u.name}
                subtitle={u.role === 'mentor' ? 'Mentor' : 'Mentorado'}
                photoUrl={u.photo_url}
                onClick={() => openUser(u)}
              />
              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                {u.is_active === false && (
                  <span className="rounded-full px-2.5 py-[3px] text-[.68rem] font-bold bg-red-500 text-white">Desactivado</span>
                )}
                {u.role === 'mentor' && u.mentorProfile?.show_on_landing && (
                  <span className="rounded-full px-2.5 py-[3px] text-[.68rem] font-bold bg-primary-500 text-white">Landing</span>
                )}
                <button onClick={() => openUser(u)} className={`${BTN} bg-surface2 text-ink`}>Editar</button>
                {u.role !== 'organizer' && (
                  <>
                    <button
                      onClick={() => handleToggleActive(u)}
                      disabled={actionId === u.id}
                      className={`${BTN} ${u.is_active === false ? 'bg-success text-white' : 'bg-surface2 text-ink'} disabled:opacity-50`}
                    >
                      {u.is_active === false ? 'Activar' : 'Desactivar'}
                    </button>
                    <button
                      onClick={() => handleDelete(u)}
                      disabled={actionId === u.id}
                      className={`${BTN} bg-red-600 text-white disabled:opacity-50`}
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && form && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => { setEditing(null); setForm(null); }}>
          <div className="bg-surface rounded-[24px] p-4 sm:p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center gap-3 mb-4">
              <h3 className="text-[1.1rem] font-extrabold min-w-0 break-words">Editar {editing.name}</h3>
              <button onClick={() => { setEditing(null); setForm(null); }} className="shrink-0 w-8 h-8 rounded-full bg-surface2 text-ink flex items-center justify-center">✕</button>
            </div>

            <div className="mb-3">
              <label className="block text-[.78rem] font-semibold mb-1">Nome</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} className={FIELD} />
            </div>
            <div className="mb-3">
              <label className="block text-[.78rem] font-semibold mb-1">Telemóvel (WhatsApp)</label>
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className={FIELD} />
            </div>
            <div className="mb-3">
              <label className="block text-[.78rem] font-semibold mb-1">LinkedIn</label>
              <input value={form.linkedin_url} onChange={(e) => set('linkedin_url', e.target.value)} className={FIELD} />
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-3">
              <img
                src={form.photoFile ? URL.createObjectURL(form.photoFile) : (imgSrc(form.photo_url) || '')}
                alt=""
                className="w-14 h-14 rounded-full object-cover bg-surface2 border border-line"
                onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
              />
              <div>
                <label className="block text-[.78rem] font-semibold mb-1">Foto</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) set('photoFile', file);
                  }}
                  className="block w-full text-[.8rem] text-ink-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[.78rem] file:font-semibold file:bg-primary-500 file:text-white"
                />
              </div>
            </div>

            {editing.role === 'mentor' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div><label className="block text-[.76rem] font-semibold mb-1">Cargo</label><input value={form.job_title} onChange={(e) => set('job_title', e.target.value)} className={FIELD} /></div>
                  <div><label className="block text-[.76rem] font-semibold mb-1">Empresa</label><input value={form.company} onChange={(e) => set('company', e.target.value)} className={FIELD} /></div>
                </div>
                <div className="mb-3"><label className="block text-[.78rem] font-semibold mb-1">Setor</label><input value={form.sector} onChange={(e) => set('sector', e.target.value)} className={FIELD} /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div><label className="block text-[.76rem] font-semibold mb-1">Anos de experiência</label><input type="number" value={form.years} onChange={(e) => set('years', e.target.value)} className={FIELD} /></div>
                  <div>
                    <label className="block text-[.76rem] font-semibold mb-1">Tipo de apoio</label>
                    <select value={form.support_type} onChange={(e) => set('support_type', e.target.value)} className={FIELD}>
                      <option value="">Selecciona...</option>
                      {opts.support_types.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-[.78rem] font-semibold mb-1.5">Áreas em que ajuda</label>
                  <div className="flex flex-wrap gap-2">
                    {opts.areas.map((a) => <Chip key={a} label={a} active={form.interests.includes(a)} onClick={() => toggle('interests', a)} />)}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-[.78rem] font-semibold mb-1.5">Objetivos em que pode ajudar</label>
                  <div className="flex flex-wrap gap-2">
                    {opts.goals.map((g) => <Chip key={g} label={g} active={form.can_help_goals.includes(g)} onClick={() => toggle('can_help_goals', g)} />)}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div><label className="block text-[.76rem] font-semibold mb-1">Iniciais</label><input value={form.initials} onChange={(e) => set('initials', e.target.value)} className={FIELD} /></div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 text-[.82rem] font-semibold">
                      <input type="checkbox" checked={form.show_on_landing} onChange={(e) => set('show_on_landing', e.target.checked)} className="w-auto" />
                      Mostrar na landing page
                    </label>
                  </div>
                </div>
                <div className="mb-3"><label className="block text-[.78rem] font-semibold mb-1">Biografia</label><textarea rows="3" value={form.biography} onChange={(e) => set('biography', e.target.value)} className={FIELD} /></div>
                <div className="mb-3"><label className="block text-[.78rem] font-semibold mb-1">Obras (opcional)</label><textarea rows="2" value={form.works} onChange={(e) => set('works', e.target.value)} className={FIELD} /></div>
              </>
            ) : (
              <>
                <div className="mb-3">
                  <label className="block text-[.78rem] font-semibold mb-1">Situação</label>
                  <select value={form.level} onChange={(e) => set('level', e.target.value)} className={FIELD}>
                    <option value="">Selecciona...</option>
                    {opts.levels.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="mb-3"><label className="block text-[.78rem] font-semibold mb-1">Curso</label><input value={form.course} onChange={(e) => set('course', e.target.value)} className={FIELD} /></div>
                <div className="mb-3"><label className="block text-[.78rem] font-semibold mb-1">Instituição</label><input value={form.institution} onChange={(e) => set('institution', e.target.value)} className={FIELD} /></div>
                <div className="mb-3">
                  <label className="block text-[.78rem] font-semibold mb-1.5">Áreas de interesse</label>
                  <div className="flex flex-wrap gap-2">
                    {opts.areas.map((a) => <Chip key={a} label={a} active={form.mentee_interests.includes(a)} onClick={() => toggle('mentee_interests', a)} />)}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-[.78rem] font-semibold mb-1">Objetivo</label>
                  <select value={form.goal} onChange={(e) => set('goal', e.target.value)} className={FIELD}>
                    <option value="">Selecciona...</option>
                    {opts.goals.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="block text-[.78rem] font-semibold mb-1">Maior obstáculo na busca de emprego</label>
                  <select value={form.job_obstacle} onChange={(e) => set('job_obstacle', e.target.value)} className={FIELD}>
                    <option value="">Selecciona...</option>
                    {opts.obstacles.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="mb-3"><label className="block text-[.78rem] font-semibold mb-1">Pitch</label><textarea rows="2" maxLength={120} value={form.pitch} onChange={(e) => set('pitch', e.target.value)} className={FIELD} /></div>
              </>
            )}

            <button onClick={handleSave} disabled={saving} className={`${BTN} bg-primary-500 text-white w-full mt-2 disabled:opacity-50`}>
              {saving ? 'A guardar...' : 'Guardar alterações'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};