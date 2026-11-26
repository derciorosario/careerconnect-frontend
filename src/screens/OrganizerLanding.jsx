import React, { useState, useEffect } from 'react';
import { ccGetLanding, ccUpdateLanding } from '../api/client';
import { Card } from '../ui';

const FIELD = 'w-full bg-surface border-2 border-line rounded-[10px] px-3 py-2 text-[.88rem] focus:border-primary-500 focus:outline-none';
const BTN = 'rounded-full font-bold text-[.78rem] h-9 px-3.5';
const toList = (t) => (t || '').split('\n').map((s) => s.trim()).filter(Boolean);
const toText = (a) => (Array.isArray(a) ? a.join('\n') : '');

const EMPTY = {
  email: '',
  phone: '',
  tutorialVideoUrl: '',
  axes: [],
  benefits: [],
  faqs: [],
  masterclasses: [],
};

export const OrganizerLanding = ({ showToast }) => {
  const [config, setConfig] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const resp = await ccGetLanding({});
        const c = resp.data || {};
        if (cancelled) return;
        setConfig({
          ...EMPTY,
          ...c,
          axes: Array.isArray(c.axes) ? c.axes : [],
          benefits: Array.isArray(c.benefits) ? c.benefits : [],
          faqs: Array.isArray(c.faqs) ? c.faqs : [],
          masterclasses: Array.isArray(c.masterclasses) ? c.masterclasses : [],
        });
      } catch (err) {
        showToast(err.response?.data?.message || 'Erro ao carregar.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const setList = (k, arr) => setConfig((c) => ({ ...c, [k]: arr }));
  const updateItem = (k, i, patch) => setList(k, config[k].map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const removeItem = (k, i) => setList(k, config[k].filter((_, idx) => idx !== i));
  const addItem = (k, item) => setList(k, [...config[k], item]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await ccUpdateLanding({ content: config });
      showToast('Página inicial atualizada.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Erro ao guardar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Landing Page</h2>
      <p className="text-ink-muted text-[.85rem] mt-1 mb-4">Manage o conteúdo da página inicial pública.</p>

      {loading ? (
        <Card><p className="text-ink-muted text-[.85rem]">A carregar...</p></Card>
      ) : (
        <>
          <Card>
            <label className="block text-[.78rem] font-semibold mb-1">Email de contacto</label>
            <input value={config.email || ''} onChange={(e) => setConfig((c) => ({ ...c, email: e.target.value }))} placeholder="email@exemplo.com" className={FIELD} />
            <label className="block text-[.78rem] font-semibold mb-1 mt-3">Telefone de contacto</label>
            <input value={config.phone || ''} onChange={(e) => setConfig((c) => ({ ...c, phone: e.target.value }))} placeholder="+258 ..." className={FIELD} />
            <label className="block text-[.78rem] font-semibold mb-1 mt-3">Link do vídeo tutorial</label>
            <input value={config.tutorialVideoUrl || ''} onChange={(e) => setConfig((c) => ({ ...c, tutorialVideoUrl: e.target.value }))} placeholder="https://..." className={FIELD} />
          </Card>

          {/* Axes */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <b>Eixos de Actuação</b>
              <button onClick={() => addItem('axes', { title: '', items: [] })} className={`${BTN} bg-primary-500 text-white`}>+ Eixo</button>
            </div>
            {config.axes.map((ax, i) => (
              <div key={i} className="border-2 border-line rounded-[12px] p-3 mb-3">
                <div className="flex gap-2 items-center mb-2">
                  <input value={ax.title} onChange={(e) => updateItem('axes', i, { title: e.target.value })} placeholder="Título do eixo" className={FIELD} />
                  <button onClick={() => removeItem('axes', i)} className={`${BTN} bg-red-500 text-white shrink-0`}>✕</button>
                </div>
                <textarea value={toText(ax.items)} onChange={(e) => updateItem('axes', i, { items: toList(e.target.value) })} rows="3" placeholder="Um item por linha" className={FIELD} />
              </div>
            ))}
          </Card>

          {/* Benefits */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <b>Benefícios</b>
              <button onClick={() => addItem('benefits', { title: '', text: '' })} className={`${BTN} bg-primary-500 text-white`}>+ Benefício</button>
            </div>
            {config.benefits.map((b, i) => (
              <div key={i} className="border-2 border-line rounded-[12px] p-3 mb-3">
                <div className="flex gap-2 items-center mb-2">
                  <input value={b.title} onChange={(e) => updateItem('benefits', i, { title: e.target.value })} placeholder="Título" className={FIELD} />
                  <button onClick={() => removeItem('benefits', i)} className={`${BTN} bg-red-500 text-white shrink-0`}>✕</button>
                </div>
                <textarea value={b.text} onChange={(e) => updateItem('benefits', i, { text: e.target.value })} rows="2" placeholder="Descrição" className={FIELD} />
              </div>
            ))}
          </Card>

          {/* FAQs */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <b>FAQs</b>
              <button onClick={() => addItem('faqs', { q: '', a: '' })} className={`${BTN} bg-primary-500 text-white`}>+ Pergunta</button>
            </div>
            {config.faqs.map((f, i) => (
              <div key={i} className="border-2 border-line rounded-[12px] p-3 mb-3">
                <div className="flex gap-2 items-center mb-2">
                  <input value={f.q} onChange={(e) => updateItem('faqs', i, { q: e.target.value })} placeholder="Pergunta" className={FIELD} />
                  <button onClick={() => removeItem('faqs', i)} className={`${BTN} bg-red-500 text-white shrink-0`}>✕</button>
                </div>
                <textarea value={f.a} onChange={(e) => updateItem('faqs', i, { a: e.target.value })} rows="2" placeholder="Resposta" className={FIELD} />
              </div>
            ))}
          </Card>

          <button onClick={handleSave} disabled={saving} className="rounded-full font-bold text-[.9rem] h-12 px-6 bg-primary-500 text-white w-full mt-2 disabled:opacity-50">
            {saving ? 'A guardar...' : 'Guardar landing page'}
          </button>
        </>
      )}
    </>
  );
};