import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { load, save, generateTicketCode, AREAS, GOALS, MENTEES, MENTORS } from './seed';
import { hashString } from './data';

const BTN_BASE   = 'inline-block rounded-full bg-primary-500 text-white font-semibold text-base px-7 py-3.5 cursor-pointer no-underline hover:brightness-110 transition';
const BTN_GHOST  = 'bg-transparent text-ink shadow-[inset_0_0_0_2px_var(--color-line)]';
const BTN_SM     = 'px-[18px] py-[9px] text-sm';
const FIELD_BASE = 'w-full font-normal text-base text-ink bg-surface border-2 border-line rounded-field px-3.5 py-3 focus:border-primary-500 focus:outline-none';

const LEVELS = ['Estudante', 'Recém-graduado'];
const SUPPORT_TYPES = ['Mentor', 'Coach', 'Orientação pontual'];

function Progress({ step, total }) {
  const pct = (step / total) * 100;
  return (
    <div className="w-full h-1.5 bg-line rounded-full overflow-hidden mb-6">
      <div className="h-full bg-primary-500 rounded-full transition-[width] duration-400" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMentor = location.pathname.includes('mentor');

  const [state, setState] = useState(() => load());
  const [step, setStep] = useState(1);
  const [screen2, setScreen2] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', role: isMentor ? 'mentor' : 'mentee',
    level: '', course: '', institution: '', interests: [], goal: '', pitch: '',
    jobTitle: '', company: '', sector: '', years: '', mentorInterests: [], canHelpGoals: [], supportType: '', maxMentees: '1',
    photo: '', linkedin: '',
  });
  const [error, setError] = useState('');
  const [otpMode, setOtpMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  useEffect(() => {
    setScreen2(isMentor ? 'mentor' : 'mentee');
  }, [isMentor]);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggleInterest = (arr, val) => setForm((p) => {
    const cur = p[arr] || [];
    const next = cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val];
    return { ...p, [arr]: next };
  });

  const handleScreen1 = (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.phone || !form.password) return setError('Preencha todos os campos.');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Email inválido.');
    if (form.password.length < 6) return setError('A palavra-passe precisa de pelo menos 6 caracteres.');
    const existing = Object.values(state.users).find((u) => u.email === form.email);
    if (existing) return setError('Já existe uma conta com este e-mail. Vá para Entrar.');

    const ticket = generateTicketCode();
    const newUsers = { ...state.users, [form.email]: { email: form.email, name: form.name, phone: form.phone, role: form.role, password: form.password, ticket, createdAt: new Date().toISOString() } };
    const newReg = { ...state.registrations, [ticket]: { event_id: 'cc26', user_id: form.email, ticket_code: ticket, status: form.role === 'mentor' ? 'pending' : 'registered', checked_in_at: null, walk_in: false } };
    setState((s) => ({ ...s, users: newUsers, registrations: newReg }));
    save({ ...state, users: newUsers, registrations: newReg });
    setStep(2);
  };

  const handleScreen2 = (e) => {
    e.preventDefault();
    setError('');
    if (form.role === 'mentee') {
      if (!form.level || !form.course || !form.institution || form.interests.length === 0 || !form.goal || !form.pitch) return setError('Preencha todos os campos obrigatórios.');
      if (form.pitch.length > 120) return setError('O pitch deve ter no máximo 120 caracteres.');
    } else {
      if (!form.jobTitle || !form.company || !form.sector || form.mentorInterests.length === 0 || form.canHelpGoals.length === 0 || !form.supportType || !form.maxMentees) return setError('Preencha todos os campos obrigatórios.');
    }
    const email = form.email;
    const user = state.users[email];
    const profile = form.role === 'mentee'
      ? { user_id: email, level: form.level, course: form.course, institution: form.institution, interests: form.interests, goal: form.goal, pitch: form.pitch }
      : { user_id: email, job_title: form.jobTitle, company: form.company, sector: form.sector, years: form.years, interests: form.mentorInterests, can_help_goals: form.canHelpGoals, support_type: form.supportType, max_mentees: Number(form.maxMentees), approval: 'pending', approved_by: null, approved_at: null };
    setState((s) => {
      const next = { ...s };
      if (form.role === 'mentee') next.menteeProfiles[email] = profile;
      else next.mentorProfiles[email] = { ...profile };
      return next;
    });
    save(state);
    const reg = state.registrations[Object.keys(state.registrations).find((k) => state.registrations[k].user_id === email)];
    const msg = form.role === 'mentor' ? 'Candidatura enviada. Fica pendente até à aprovação do organizador.' : `Registo concluído. Código do bilhete: ${reg.ticket_code}`;
    setError(msg);
    setTimeout(() => navigate(`/entrar?email=${encodeURIComponent(email)}`), 1500);
  };

  const handleOtp = (e) => {
    e.preventDefault();
    setError('');
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setOtpSent(true);
    setTimeout(() => setError(`Código OTP (simulação): ${code}`), 300);
  };

  const verifyOtp = (e) => {
    e.preventDefault();
    setError('');
    if (otp === '123456') {
      navigate(`/entrar?email=${encodeURIComponent(form.email)}`);
    } else {
      setError('Código inválido. Use 123456 para entrar na simulação.');
    }
  };

  const renderScreen1 = () => (
    <>
      <Progress step={1} total={2} />
      <h2 className="text-[1.5rem] font-extrabold tracking-tight mb-2">Cria a tua conta</h2>
      <p className="text-ink-muted mb-6">Ecrã 1 de 2 — dados de acesso</p>
      <form onSubmit={handleScreen1} noValidate className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[.85rem] font-semibold">Nome completo</label>
            <input id="name" autoComplete="name" value={form.name} onChange={(e) => setField('name', e.target.value)} className={FIELD_BASE} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[.85rem] font-semibold">Email</label>
            <input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => setField('email', e.target.value)} className={FIELD_BASE} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[.85rem] font-semibold">Telemóvel (WhatsApp)</label>
          <input id="phone" type="tel" autoComplete="tel" placeholder="+258" value={form.phone} onChange={(e) => setField('phone', e.target.value)} className={FIELD_BASE} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[.85rem] font-semibold">Palavra-passe</label>
          <input id="password" type="password" autoComplete="new-password" value={form.password} onChange={(e) => setField('password', e.target.value)} placeholder="Mínimo 6 caracteres" className={FIELD_BASE} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[.85rem] font-semibold">Entra como</label>
          <select value={form.role} onChange={(e) => setField('role', e.target.value)} className={FIELD_BASE}>
            <option value="mentee">Mentorado</option>
            <option value="mentor">Mentor (profissional)</option>
          </select>
        </div>
        <div className="pt-4 border-t border-line">
          <p className="text-[.8rem] text-ink-muted mb-3">Ou entrar sem palavra-passe por código OTP</p>
          <button type="button" onClick={handleOtp} className="w-full rounded-full font-bold text-[.82rem] h-10 bg-surface2 text-ink">Enviar código OTP por SMS/email</button>
          {otpSent && (
            <div className="mt-3">
              <label className="text-[.85rem] font-semibold block mb-1.5">Código de 6 dígitos</label>
              <input id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} className={FIELD_BASE} />
              <button onClick={verifyOtp} className="w-full mt-2 rounded-full font-bold text-[.82rem] h-10 bg-primary-500 text-white">Verificar código</button>
            </div>
          )}
        </div>
        <div className="text-danger text-sm font-semibold mt-2">{error}</div>
        <button className={`${BTN_BASE} w-full mt-4`} type="submit">Continuar para o perfil</button>
        <p className="text-center text-[.85rem] text-ink-muted mt-4">Já tem conta? <Link to="/entrar" className="text-primary-500 font-semibold">Entrar</Link></p>
      </form>
    </>
  );

  const renderScreen2 = () => {
    const isMentorRole = form.role === 'mentor';
    return (
      <>
        <Progress step={2} total={2} />
        <h2 className="text-[1.5rem] font-extrabold tracking-tight mb-2">{isMentorRole ? 'Perfil de mentor' : 'Perfil de mentorado'}</h2>
        <p className="text-ink-muted mb-6">Ecrã 2 de 2 — informações para o matching</p>
        <form onSubmit={handleScreen2} noValidate className="space-y-4">
          {isMentorRole ? (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[.85rem] font-semibold">Cargo</label>
                <input value={form.jobTitle} onChange={(e) => setField('jobTitle', e.target.value)} className={FIELD_BASE} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[.85rem] font-semibold">Empresa</label>
                <input value={form.company} onChange={(e) => setField('company', e.target.value)} className={FIELD_BASE} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[.85rem] font-semibold">Setor</label>
                <input value={form.sector} onChange={(e) => setField('sector', e.target.value)} className={FIELD_BASE} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[.85rem] font-semibold">Anos de experiência</label>
                <input type="number" value={form.years} onChange={(e) => setField('years', e.target.value)} className={FIELD_BASE} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[.85rem] font-semibold">Áreas em que ajuda (até 3)</label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {AREAS.map((a) => (
                    <button key={a} type="button" onClick={() => toggleInterest('mentorInterests', a)} className={`rounded-full border px-3 py-1.5 text-[.85rem] font-medium transition ${form.mentorInterests.includes(a) ? 'bg-primary-500 border-primary-500 text-white' : 'border-line text-ink bg-surface'}`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[.85rem] font-semibold">Objetivos em que pode ajudar</label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {GOALS.map((g) => (
                    <button key={g} type="button" onClick={() => toggleInterest('canHelpGoals', g)} className={`rounded-full border px-3 py-1.5 text-[.85rem] font-medium transition ${form.canHelpGoals.includes(g) ? 'bg-primary-500 border-primary-500 text-white' : 'border-line text-ink bg-surface'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[.85rem] font-semibold">Tipo de apoio</label>
                <select value={form.supportType} onChange={(e) => setField('supportType', e.target.value)} className={FIELD_BASE}>
                  {SUPPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[.85rem] font-semibold">Máximo de mentorados (1 a 3)</label>
                <select value={form.maxMentees} onChange={(e) => setField('maxMentees', e.target.value)} className={FIELD_BASE}>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[.85rem] font-semibold">Situação</label>
                <select value={form.level} onChange={(e) => setField('level', e.target.value)} className={FIELD_BASE}>
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[.85rem] font-semibold">Curso</label>
                <input value={form.course} onChange={(e) => setField('course', e.target.value)} className={FIELD_BASE} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[.85rem] font-semibold">Instituição</label>
                <input value={form.institution} onChange={(e) => setField('institution', e.target.value)} className={FIELD_BASE} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[.85rem] font-semibold">Áreas de interesse (até 3)</label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {AREAS.map((a) => (
                    <button key={a} type="button" onClick={() => toggleInterest('interests', a)} className={`rounded-full border px-3 py-1.5 text-[.85rem] font-medium transition ${form.interests.includes(a) ? 'bg-primary-500 border-primary-500 text-white' : 'border-line text-ink bg-surface'}`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[.85rem] font-semibold">Objetivo</label>
                <select value={form.goal} onChange={(e) => setField('goal', e.target.value)} className={FIELD_BASE}>
                  {GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[.85rem] font-semibold">Pitch (1 frase, máx. 120 caracteres)</label>
                <textarea value={form.pitch} onChange={(e) => setField('pitch', e.target.value)} maxLength={120} rows="2" className={FIELD_BASE} />
              </div>
            </>
          )}
          <div className="flex items-start gap-3 mb-4">
            <input type="checkbox" checked={form.photo} onChange={(e) => setField('photo', e.target.checked)} className="w-auto mt-0.5" />
            <label className="text-[.85rem] font-semibold leading-snug">Concordo em partilhar o meu perfil com os pares sugeridos.</label>
          </div>
          <div className="text-danger text-sm font-semibold mt-2">{error}</div>
          <button className={`${BTN_BASE} w-full mt-4`} type="submit">Concluir registo</button>
          <p className="text-center text-[.85rem] text-ink-muted mt-4">Voltar atrás? <Link to="/" className="text-primary-500 font-semibold">Página inicial</Link></p>
        </form>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-surface text-ink font-sans bg-navy-950">
      <div className="max-w-[480px] mx-auto pt-[18px] px-4 pb-10">
        <div className="font-extrabold text-[1.35rem] italic tracking-tight leading-none mb-6">
          Career<i className="text-primary-500 not-italic">Connect</i>
        </div>
        {step === 1 ? renderScreen1() : renderScreen2()}
      </div>
    </div>
  );
}
