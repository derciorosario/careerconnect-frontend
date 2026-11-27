import React, { useState, useEffect } from 'react';
import { ccGetRegistrationConfig, ccUpdateRegistrationConfig } from '../api/client';
import { Card } from '../ui';

const FIELD = 'w-full bg-surface border-2 border-line rounded-[10px] px-3 py-2 text-[.88rem] focus:border-primary-500 focus:outline-none';
const BTN = 'rounded-full font-bold text-[.82rem] h-10 px-4';

const toText = (arr) => (Array.isArray(arr) ? arr.join('\n') : '');
const toList = (text) => text.split('\n').map((s) => s.trim()).filter(Boolean);

export const OrganizerConfig = ({ showToast }) => {
  const [form, setForm] = useState({ areas: '', goals: '', obstacles: '', support_types: '', levels: '', academic_education: '', technical_courses: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const resp = await ccGetRegistrationConfig({});
        const c = resp.data || {};
        if (cancelled) return;
        setForm({
          areas: toText(c.areas),
          goals: toText(c.goals),
          obstacles: toText(c.obstacles),
          support_types: toText(c.support_types),
          levels: toText(c.levels),
          academic_education: toText(c.academic_education),
          technical_courses: toText(c.technical_courses),
        });
      } catch (err) {
        showToast(err.response?.data?.message || 'Erro ao carregar configuração.');
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
      await ccUpdateRegistrationConfig({
        areas: toList(form.areas),
        goals: toList(form.goals),
        obstacles: toList(form.obstacles),
        support_types: toList(form.support_types),
        levels: toList(form.levels),
        academic_education: toList(form.academic_education),
        technical_courses: toList(form.technical_courses),
      });
      showToast('Configuração guardada.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Erro ao guardar.');
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: 'areas', label: 'Áreas de interesse (mentorInterests / interesses)' },
    { key: 'goals', label: 'Objetivos (canHelpGoals / objetivo)' },
    { key: 'obstacles', label: 'Maior obstáculo na busca de emprego' },
    { key: 'support_types', label: 'Tipos de apoio' },
    { key: 'levels', label: 'Níveis (situação)' },
    { key: 'academic_education', label: 'Formação académica' },
    { key: 'technical_courses', label: 'Curso técnico-profissional' },
  ];

  return (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Configuração do Registo</h2>
      <p className="text-ink-muted text-[.85rem] mt-1 mb-4">
        Edita as opções disponíveis no formulário de registo. Escreve uma opção por linha.
      </p>

      <Card>
        {loading ? (
          <p className="text-ink-muted text-[.85rem]">A carregar...</p>
        ) : (
          <>
            {fields.map((f) => (
              <div key={f.key} className="mb-4">
                <label className="block text-[.85rem] font-semibold mb-1.5">{f.label}</label>
                <textarea
                  value={form[f.key]}
                  onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  rows="4"
                  className={FIELD}
                />
              </div>
            ))}
            <button onClick={handleSave} disabled={saving} className={`${BTN} bg-primary-500 text-white w-full mt-2 disabled:opacity-50`}>
              {saving ? 'A guardar...' : 'Guardar configuração'}
            </button>
          </>
        )}
      </Card>
    </>
  );
};