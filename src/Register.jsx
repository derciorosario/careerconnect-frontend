import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ccVerifyEmail, ccResendEmailOTP, uploadClient, ccGetRegistrationConfig } from './api/client';

import logo from './assets/logo.png';
import mainLogo from './assets/patners/main.png';

const NotifyWithWhastapp = false;

// When true, mentees must wait for organizer approval (same flow as mentors).
// Keep this in sync with MENTEE_REQUIRES_APPROVAL in the backend .env.
const MenteeRequiresApproval = true;

const BTN_BASE   = 'inline-block rounded-full bg-primary-500 text-white font-semibold text-base px-7 py-3.5 cursor-pointer no-underline hover:brightness-110 transition';
const BTN_GHOST  = 'bg-transparent text-ink shadow-[inset_0_0_0_2px_var(--color-line)]';
const FIELD_BASE = 'w-full font-normal text-base text-ink bg-surface border-2 border-line rounded-field px-3.5 py-3 focus:border-primary-500 focus:outline-none';

const AREAS = [
  'Recursos Humanos',
  'Secretariado',
  'Contabilidade',
  'Relações Públicas e Marketing',
  'Tecnologia (Redes e Hardware)',
  'Marketing Digital',
  'Programação Web',
];

const GOALS = [
  'Escolher a minha área',
  'Preparar o primeiro estágio',
  'Construir a minha marca pessoal',
  'Desenvolver competências',
  'Mudar de percurso',
  'Criar o meu negócio',
];

const LEVELS = ['Estudante', 'Recém-graduado', 'Profissional Júnior'];
const ACADEMIC_EDUCATION = ['12.ª Classe (Ensino Secundário)', 'Ensino Técnico Médio', 'Ensino Superior (Licenciatura)', 'Pós-graduação'];
const TECHNICAL_COURSES = ['Recursos Humanos', 'Secretariado', 'Contabilidade', 'Relações Públicas e Marketing', 'Tecnologia (Redes e Hardware)', 'Marketing Digital', 'Programação Web'];
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

  useEffect(()=>{

    window.scrollTo(0, 0)
     
  },[])

  const [step, setStep] = useState(1);
  const [dialog, setDialog] = useState(null); // null | 'mentee-success' | 'mentor-pending'
  const [config, setConfig] = useState({
    areas: AREAS, goals: GOALS, obstacles: ['Falta de experiência', 'Falta de contactos', 'Falta de formação', 'Outro'],
    support_types: SUPPORT_TYPES, levels: LEVELS,
    academic_education: ACADEMIC_EDUCATION, technical_courses: TECHNICAL_COURSES,
  });
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', role: isMentor ? 'mentor' : 'mentee',
    level: '', course: '', institution: '', academicEducation: '', technicalCourse: '', interests: [], goal: '', pitch: '', jobObstacle: '',
    jobTitle: '', company: '', sector: '', years: '', mentorInterests: [], canHelpGoals: [], supportType: '',
    photo: '', photoFile: null, shareProfile: false, linkedin: '',
  });
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    ccGetRegistrationConfig({})
      .then((resp) => {
        if (cancelled) return;
        const c = resp.data || {};
        setConfig({
          areas: Array.isArray(c.areas) ? c.areas : AREAS,
          goals: Array.isArray(c.goals) ? c.goals : GOALS,
          obstacles: Array.isArray(c.obstacles) ? c.obstacles : ['Falta de experiência', 'Falta de contactos', 'Falta de formação', 'Outro'],
          support_types: Array.isArray(c.support_types) ? c.support_types : SUPPORT_TYPES,
          levels: Array.isArray(c.levels) ? c.levels : LEVELS,
          academic_education: Array.isArray(c.academic_education) ? c.academic_education : ACADEMIC_EDUCATION,
          technical_courses: Array.isArray(c.technical_courses) ? c.technical_courses : TECHNICAL_COURSES,
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggleInterest = (arr, val) => setForm((p) => {
    const cur = p[arr] || [];
    const next = cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val];
    return { ...p, [arr]: next };
  });

  const handleScreen1 = (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.phone || !form.password || !form.role) {
      return setError('Preencha todos os campos obrigatórios.');
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Email inválido.');
    if (form.password.length < 6) return setError('A palavra-passe precisa de pelo menos 6 caracteres.');
    if (!form.photoFile) return setError('A foto de perfil é obrigatória.');

    window.scrollTo(0, 0)
    
    setStep(2);
  };

  const handleScreen2 = async (e) => {
    e.preventDefault();
    setError('');

    if (form.role === 'mentee') {
      if (!form.level || !form.course || !form.institution || !form.academicEducation || !form.technicalCourse || form.interests.length === 0 || !form.goal || !form.pitch) {
        return setError('Preencha todos os campos obrigatórios.');
      }
      if (form.pitch.length > 120) return setError('O pitch deve ter no máximo 120 caracteres.');
    } else {
      if (!form.jobTitle || !form.company || !form.sector || form.mentorInterests.length === 0 || form.canHelpGoals.length === 0 || !form.supportType) {
        return setError('Preencha todos os campos obrigatórios.');
      }
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      formData.append('password', form.password);
      formData.append('role', form.role);
      if (form.level) formData.append('level', form.level);
      if (form.course) formData.append('course', form.course);
      if (form.institution) formData.append('institution', form.institution);
      if (form.academicEducation) formData.append('academicEducation', form.academicEducation);
      if (form.technicalCourse) formData.append('technicalCourse', form.technicalCourse);
      formData.append('interests', JSON.stringify(form.interests));
      if (form.goal) formData.append('goal', form.goal);
      if (form.pitch) formData.append('pitch', form.pitch);
      if (form.jobObstacle) formData.append('jobObstacle', form.jobObstacle);
      if (form.jobTitle) formData.append('jobTitle', form.jobTitle);
      if (form.company) formData.append('company', form.company);
      if (form.sector) formData.append('sector', form.sector);
      if (form.years) formData.append('years', form.years);
      formData.append('mentorInterests', JSON.stringify(form.mentorInterests));
      formData.append('canHelpGoals', JSON.stringify(form.canHelpGoals));
      if (form.supportType) formData.append('supportType', form.supportType);
      if (form.photoFile) formData.append('photo', form.photoFile);
      if (form.linkedin) formData.append('linkedin', form.linkedin);

      const response = await uploadClient.post('/auth/register', formData);

      if (response.data.requiresEmailVerification) {
        setStep(3);
        setError(NotifyWithWhastapp ? 'Foi enviado um código de verificação para o seu email e WhatsApp.' : 'Foi enviado um código de verificação para o seu email.');
      } else {
        setError(response.data.message || 'Registo concluído.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro no registo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp) return setError('Insira o código de verificação.');

    setLoading(true);
    try {
      const response = await ccVerifyEmail({ email: form.email, otp });
      if (response.data.accessToken && !MenteeRequiresApproval) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('refresh_token', response.data.refreshToken);
        localStorage.setItem('userRole', response.data.user.role);
      }

      if (form.role === 'mentor' || (form.role === 'mentee' && MenteeRequiresApproval)) {
        setDialog(form.role === 'mentor' ? 'mentor-pending' : 'mentee-pending');
      } else {
        setDialog('mentee-success');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Código de verificação inválido.');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setLoading(true);
    try {
      await ccResendEmailOTP({ email: form.email });
      setError(NotifyWithWhastapp ? 'Código reenviado por email e WhatsApp.' : 'Código reenviado por email.');
    } catch {
      setError('Erro ao reenviar código.');
    } finally {
      setLoading(false);
    }
  };

  const renderScreen1 = () => (
    <>
      <Progress step={1} total={3} />
      <h2 className="text-[1.5rem] font-extrabold tracking-tight mb-2">Cria a tua conta</h2>
      <p className="text-ink-muted mb-6">Ecrã 1 de 3 — dados de acesso</p>
      <form onSubmit={handleScreen1} noValidate className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[.85rem] font-semibold">Nome completo *</label>
            <input id="name" autoComplete="name" value={form.name} onChange={(e) => setField('name', e.target.value)} className={FIELD_BASE} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[.85rem] font-semibold">Email *</label>
            <input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => setField('email', e.target.value)} className={FIELD_BASE} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[.85rem] font-semibold">{NotifyWithWhastapp ? 'Telemóvel (WhatsApp) *' : 'Telemóvel *'}</label>
          <input id="phone" type="tel" autoComplete="tel" placeholder="+258" value={form.phone} onChange={(e) => setField('phone', e.target.value)} className={FIELD_BASE} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[.85rem] font-semibold">Palavra-passe *</label>
          <input id="password" type="password" autoComplete="new-password" value={form.password} onChange={(e) => setField('password', e.target.value)} placeholder="Mínimo 6 caracteres" className={FIELD_BASE} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[.85rem] font-semibold">Entra como</label>
<select value={form.role} onChange={(e) => setField('role', e.target.value)} className={FIELD_BASE}>
              <option value="" disabled>Selecciona o perfil</option>
              <option value="mentee">Mentorado</option>
              <option value="mentor">Mentor (profissional)</option>
            </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[.85rem] font-semibold">Foto *</label>
          <input type="file" accept="image/*" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              if (file.size > 10 * 1024 * 1024) {
                setError('A imagem não pode ultrapassar 10MB.');
                e.target.value = '';
                return;
              }
              setError('');
              setField('photoFile', file);
              const reader = new FileReader();
              reader.onload = (ev) => setField('photo', ev.target.result);
              reader.readAsDataURL(file);
            }
          }} className="block w-full text-sm text-ink-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-500 file:text-white hover:file:bg-primary-600" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[.85rem] font-semibold">LinkedIn (opcional)</label>
          <input value={form.linkedin} onChange={(e) => setField('linkedin', e.target.value)} placeholder="https://linkedin.com/in/..." className={FIELD_BASE} />
        </div>
        <div className="text-danger text-sm font-semibold mt-2">{error}</div>
        <div className="flex gap-3 mt-4">
          <Link to="/" className={`flex-1 ${BTN_GHOST} text-center py-3.5 rounded-full border-line text-ink hover:bg-surface2`}>
            Cancelar
          </Link>
          <button className={`flex-1 ${BTN_BASE}`} type="submit" disabled={loading}>
            {loading ? 'A carregar...' : 'Seguinte'}
          </button>
        </div>
        <p className="text-center text-[.85rem] text-ink-muted mt-4">Já tem conta? <Link to="/entrar" className="text-primary-500 font-semibold">Entrar</Link></p>
      </form>
    </>
  );

  const renderScreen2 = () => {
    const isMentorRole = form.role === 'mentor';
    return (
      <>
        <Progress step={2} total={3} />
        <h2 className="text-[1.5rem] font-extrabold tracking-tight mb-2">{isMentorRole ? 'Perfil de mentor' : 'Perfil de mentorado'}</h2>
        <p className="text-ink-muted mb-6">Ecrã 2 de 3 — informações para o matching</p>
        <form onSubmit={handleScreen2} noValidate className="space-y-4">
          {isMentorRole ? (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[.85rem] font-semibold">Cargo *</label>
                <input value={form.jobTitle} onChange={(e) => setField('jobTitle', e.target.value)} className={FIELD_BASE} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[.85rem] font-semibold">Empresa *</label>
                <input value={form.company} onChange={(e) => setField('company', e.target.value)} className={FIELD_BASE} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[.85rem] font-semibold">Setor *</label>
                <input value={form.sector} onChange={(e) => setField('sector', e.target.value)} className={FIELD_BASE} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[.85rem] font-semibold">Anos de experiência *</label>
                <input type="number" value={form.years} onChange={(e) => setField('years', e.target.value)} className={FIELD_BASE} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[.85rem] font-semibold">Áreas em que ajuda (até 3) *</label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {config.areas.map((a) => (
                    <button key={a} type="button" onClick={() => toggleInterest('mentorInterests', a)} className={`rounded-full border px-3 py-1.5 text-[.85rem] font-medium transition ${form.mentorInterests.includes(a) ? 'bg-primary-500 border-primary-500 text-white' : 'border-line text-ink bg-surface'}`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[.85rem] font-semibold">Objetivos em que pode ajudar *</label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {config.goals.map((g) => (
                    <button key={g} type="button" onClick={() => toggleInterest('canHelpGoals', g)} className={`rounded-full border px-3 py-1.5 text-[.85rem] font-medium transition ${form.canHelpGoals.includes(g) ? 'bg-primary-500 border-primary-500 text-white' : 'border-line text-ink bg-surface'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[.85rem] font-semibold">Tipo de apoio *</label>
                <select value={form.supportType} onChange={(e) => setField('supportType', e.target.value)} className={FIELD_BASE}>
                  <option value="" disabled>Selecciona...</option>
                  {config.support_types.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[.85rem] font-semibold">Situação *</label>
                <select value={form.level} onChange={(e) => setField('level', e.target.value)} className={FIELD_BASE}>
                  <option value="" disabled>Selecciona...</option>
                  {config.levels.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[.85rem] font-semibold">Curso *</label>
                <input value={form.course} onChange={(e) => setField('course', e.target.value)} className={FIELD_BASE} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[.85rem] font-semibold">Instituição *</label>
                <input value={form.institution} onChange={(e) => setField('institution', e.target.value)} className={FIELD_BASE} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[.85rem] font-semibold">Formação académica *</label>
                <select value={form.academicEducation} onChange={(e) => setField('academicEducation', e.target.value)} className={FIELD_BASE}>
                  <option value="" disabled>Selecciona...</option>
                  {config.academic_education.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[.85rem] font-semibold">Curso técnico-profissional *</label>
                <select value={form.technicalCourse} onChange={(e) => setField('technicalCourse', e.target.value)} className={FIELD_BASE}>
                  <option value="" disabled>Selecciona...</option>
                  {config.technical_courses.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[.85rem] font-semibold">Áreas de interesse (até 3) *</label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {config.areas.map((a) => (
                    <button key={a} type="button" onClick={() => toggleInterest('interests', a)} className={`rounded-full border px-3 py-1.5 text-[.85rem] font-medium transition ${form.interests.includes(a) ? 'bg-primary-500 border-primary-500 text-white' : 'border-line text-ink bg-surface'}`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[.85rem] font-semibold">Objetivo *</label>
                <select value={form.goal} onChange={(e) => setField('goal', e.target.value)} className={FIELD_BASE}>
                  <option value="" disabled>Selecciona...</option>
                  {GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[.85rem] font-semibold">Maior obstáculo na busca de emprego? *</label>
                <select value={form.jobObstacle} onChange={(e) => setField('jobObstacle', e.target.value)} className={FIELD_BASE}>
                  <option value="" disabled>Selecciona...</option>
                  {config.obstacles.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[.85rem] font-semibold">Pitch (1 frase, máx. 120 caracteres) *</label>
                <textarea value={form.pitch} onChange={(e) => setField('pitch', e.target.value)} maxLength={120} rows="2" className={FIELD_BASE} placeholder="Ex.: Sou finalista de Contabilidade e procuro um mentor para entrar no mercado de trabalho." />
              </div>
            </>
          )}
          <div className="flex items-start gap-3 mb-4">
            <input type="checkbox" checked={form.shareProfile} onChange={(e) => setField('shareProfile', e.target.checked)} className="w-auto mt-0.5" />
            <label className="text-[.85rem] font-semibold leading-snug">Concordo em partilhar o meu perfil com os pares sugeridos. </label>
          </div>
          <div className="text-danger text-sm font-semibold mt-2">{error}</div>
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={() => setStep(1)} className={`flex-1 ${BTN_GHOST} text-center py-3.5 rounded-full border-line text-ink hover:bg-surface2`}>
              Voltar
            </button>
            <button className={`flex-1 ${BTN_BASE}`} type="submit" disabled={loading}>
              {loading ? 'A criar conta...' : 'Criar conta'}
            </button>
          </div>
          <p className="text-center text-[.85rem] text-ink-muted mt-4">Voltar atrás? <Link to="/" className="text-primary-500 font-semibold">Página inicial</Link></p>
        </form>
      </>
    );
  };

  const renderScreen3 = () => (
    <>
      <Progress step={3} total={3} />
      <h2 className="text-[1.5rem] font-extrabold tracking-tight mb-2">{NotifyWithWhastapp ? 'Verifique o seu email e WhatsApp' : 'Verifique o seu email'}</h2>
      <p className="text-ink-muted mb-6">
        {NotifyWithWhastapp ? (
          <>Enviamos um código de 6 dígitos para <strong>{form.email}</strong> e para o seu WhatsApp <strong>{form.phone}</strong>. Insira-o aqui para concluir o registo.</>
        ) : (
          <>Enviamos um código de 6 dígitos para <strong>{form.email}</strong>. Insira-o aqui para concluir o registo.</>
        )}
      </p>
      <form onSubmit={handleVerifyEmail} noValidate className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[.85rem] font-semibold">Código de verificação</label>
          <input id="otp" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value)} className={FIELD_BASE} />
        </div>
        <div className="text-danger text-sm font-semibold mt-2">{error}</div>
        <div className="flex gap-3 mt-4">
          <button type="button" onClick={() => setStep(2)} className={`flex-1 ${BTN_GHOST} text-center py-3.5 rounded-full border-line text-ink hover:bg-surface2`}>
            Voltar
          </button>
          <button className={`flex-1 ${BTN_BASE}`} type="submit" disabled={loading || !otp}>
            {loading ? 'A verificar...' : 'Verificar email'}
          </button>
        </div>
        <p className="text-center text-[.85rem] text-ink-muted mt-3">
          Não recebeu o código?{' '}
          <button type="button" onClick={resendOTP} className="text-primary-500 font-semibold underline">Reenviar código</button>
        </p>
        <p className="text-center text-[.8rem] text-ink-muted mt-2">
          Se não encontrar o email, verifique a pasta de <strong>spam</strong> (ou lixo electrónico).
        </p>
        <p className="text-center text-[.85rem] text-ink-muted mt-4">Voltar atrás? <Link to="/" className="text-primary-500 font-semibold">Página inicial</Link></p>
      </form>
    </>
  );

  const closeDialog = () => {
    if (dialog === 'mentee-success') {
      window.location.href='/app/mentee';
    } else {
      window.location.href='/';
    }
    setDialog(null);
  };

  const renderDialog = () => {
    if (!dialog) return null;
    const isSuccess = dialog === 'mentee-success';
    const isPending = dialog === 'mentor-pending' || dialog === 'mentee-pending';
    const pendingRole = dialog === 'mentee-pending' ? 'mentorado' : 'mentor';
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-surface p-8 rounded-xl max-w-sm w-full mx-4 shadow-2xl border border-line">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
              {isSuccess ? '✓' : '⏳'}
            </div>
            <h2 className="text-xl font-extrabold text-ink">
              {isSuccess ? 'Registo concluído!' : 'Candidatura enviada'}
            </h2>
          </div>
          <p className="text-ink-muted mb-6 leading-relaxed">
            {isSuccess
              ? 'A sua conta foi verificada com sucesso.'
              : `A sua candidatura de ${pendingRole} foi enviada e está pendente de aprovação da equipa. Só poderá entrar após a aprovação.`}
          </p>
          {isSuccess && (
            <div className="bg-surface2 rounded-lg p-4 mb-6 border border-line">
              <p className="text-[.85rem] font-semibold text-ink mb-2">Bilhete digital</p>
              <p className="text-[.85rem] text-ink-muted">{NotifyWithWhastapp ? 'O seu bilhete com código foi enviado por e-mail e WhatsApp.' : 'O seu bilhete com código foi enviado por e-mail.'}</p>
            </div>
          )}
          {isPending && (
            <div className="bg-surface2 rounded-lg p-4 mb-6 border border-line">
              <p className="text-[.85rem] text-ink-muted">A equipa irá analisar o seu perfil e notificá-lo assim que a candidatura for {pendingRole === 'mentor' ? 'aprovada' : 'aprovada'}.</p>
            </div>
          )}
          <div className="text-danger text-sm font-semibold">{error}</div>
          <button
            onClick={closeDialog}
            className={`${BTN_BASE} w-full py-3`}
            disabled={loading}
          >
            {loading ? 'A processar...' : isSuccess ? 'Aceder à plataforma' : 'Entender'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-surface text-ink font-sans bg-navy-950">
      <div className="max-w-[480px] mx-auto pt-[18px] px-4 pb-10">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" aria-label="Página inicial"><img src={logo} alt="Career Connect" className="h-7 md:h-8 w-auto" /></Link>
          <div className="h-[18px] w-[1px] bg-gray-500 rounded-4xl"></div>
          <a href="https://tecnicol.co.mz" target="_blank" rel="noreferrer"><img src={mainLogo} alt="Tecnicol" className="h-9 md:h-10 w-auto" /></a>
        </div>
        {step === 1 ? renderScreen1() : step === 2 ? renderScreen2() : renderScreen3()}
      </div>
      {renderDialog()}
    </div>
  );
}
