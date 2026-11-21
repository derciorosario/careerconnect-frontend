import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { load, save } from './seed';

const BTN_BASE   = 'inline-block rounded-full bg-primary-500 text-white font-semibold text-base px-7 py-3.5 cursor-pointer no-underline hover:brightness-110 transition';
const BTN_GHOST  = 'bg-transparent text-ink shadow-[inset_0_0_0_2px_var(--color-line)]';
const BTN_SM     = 'px-[18px] py-[9px] text-sm';
const FIELD_BASE = 'w-full font-normal text-base text-ink bg-surface border-2 border-line rounded-field px-3.5 py-3 focus:border-primary-500 focus:outline-none';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [mode, setMode] = useState('password');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const state = load();
    const user = Object.values(state.users).find((u) => u.email === email.toLowerCase());
    if (!user) return setError('Não encontrámos esta conta. Cria uma conta primeiro.');
    if (mode === 'password') {
      if (user.password !== password) return setError('Palavra-passe incorreta.');
    } else {
      if (otp !== '123456') return setError('Código OTP inválido.');
    }
    const next = { ...state, session: email.toLowerCase() };
    save(next);
    const role = user.role;
    if (role === 'organizer') navigate('/org');
    else if (role === 'mentor' && state.mentorProfiles[email] && state.mentorProfiles[email].approval !== 'approved') {
      navigate('/app/mentor');
    } else {
      navigate(`/app/${role}`);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-ink font-sans bg-navy-950">
      <div className="max-w-[480px] mx-auto pt-[18px] px-4 pb-10">
        <div className="font-extrabold text-[1.35rem] italic tracking-tight leading-none mb-6">
          Career<i className="text-primary-500 not-italic">Connect</i>
        </div>
        <h1 className="text-[1.5rem] font-extrabold tracking-tight mb-2">Entrar na conta</h1>
        <p className="text-ink-muted mb-6">Acede à tua área pessoal para ver o teu passe, rondas e conexões.</p>

        <div className="flex gap-1.5 bg-surface-soft p-1.5 rounded-full mb-6">
          <button onClick={() => setMode('password')} className={`flex-1 rounded-full py-2.5 font-semibold text-sm transition ${mode === 'password' ? 'bg-navy-800 text-white' : 'bg-transparent text-ink-muted'}`}>Palavra-passe</button>
          <button onClick={() => setMode('otp')} className={`flex-1 rounded-full py-2.5 font-semibold text-sm transition ${mode === 'otp' ? 'bg-navy-800 text-white' : 'bg-transparent text-ink-muted'}`}>Código OTP</button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[.85rem] font-semibold">Email</label>
            <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={FIELD_BASE} />
          </div>
          {mode === 'password' ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-[.85rem] font-semibold">Palavra-passe</label>
              <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={FIELD_BASE} />
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[.85rem] font-semibold">Código de 6 dígitos</label>
                <input id="otp" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value)} className={FIELD_BASE} />
              </div>
              <p className="text-[.8rem] text-ink-muted">Na simulação use o código 123456.</p>
            </>
          )}
          <div className="text-danger text-sm font-semibold mt-2">{error}</div>
          <button className={`${BTN_BASE} w-full mt-4`} type="submit">Entrar</button>
        </form>

        <p className="text-center text-[.85rem] text-ink-muted mt-6">Não tem conta? <Link to="/registo" className="text-primary-500 font-semibold">Criar conta</Link></p>
        <p className="text-center text-[.85rem] text-ink-muted">É mentor? <Link to="/registo/mentor" className="text-primary-500 font-semibold">Registe-se como mentor</Link></p>
      </div>
    </div>
  );
}
