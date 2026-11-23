import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ccLogin, ccRequestOTP, ccVerifyOTP, ccGetTestUsers } from './api/client';

const BTN_BASE   = 'inline-block rounded-full bg-primary-500 text-white font-semibold text-base px-7 py-3.5 cursor-pointer no-underline hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed';
const BTN_GHOST  = 'bg-transparent text-ink shadow-[inset_0_0_0_2px_var(--color-line)]';
const BTN_SM     = 'px-[18px] py-[9px] text-sm';
const FIELD_BASE = 'w-full font-normal text-base text-ink bg-surface border-2 border-line rounded-field px-3.5 py-3 focus:border-primary-500 focus:outline-none';

import logo from './assets/logo.png';


export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [mode, setMode] = useState('password');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [testUsers, setTestUsers] = useState([]);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    const loadTestUsers = async () => {
      setTestLoading(true);
      try {
        const resp = await ccGetTestUsers();
        setTestUsers(resp.data?.users || []);
      } catch {
        setTestUsers([]);
      } finally {
        setTestLoading(false);
      }
    };
    loadTestUsers();
  }, []);

  // Limpa mensagens e estado de OTP ao trocar de tab
  useEffect(() => {
    setError('');
    setSuccess('');
    setOtp('');
    setOtpSent(false);
  }, [mode]);

  const persistSession = (data) => {
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);
      localStorage.setItem('userRole', data.user.role);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'otp' && !otpSent) {
      setError('Envie o código OTP primeiro.');
      return;
    }

    setLoading(true);
    try {
      let response;
      if (mode === 'password') {
        response = await ccLogin({ email, password });
      } else {
        response = await ccVerifyOTP({ email, otp });
      }

      persistSession(response.data);
      const role = response.data.user.role;
      window.location.href=role === 'organizer' ? '/app/org' : `/app/${role}`;
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciais inválidas.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email) {
      setError('Insira o email primeiro.');
      return;
    }
    setSendingOtp(true);
    try {
      await ccRequestOTP({ email });
      setOtpSent(true);
      setSuccess('Código OTP enviado por email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao enviar OTP.');
    } finally {
      setSendingOtp(false);
    }
  };

  const switchMode = (nextMode) => {
    if (nextMode !== mode) setMode(nextMode);
  };

  const fillTestUser = (emailVal, passwordVal) => {
    setEmail(emailVal);
    setPassword(passwordVal);
    setMode('password');
  };

  const showOtpSubmit = mode === 'password' || (mode === 'otp' && otpSent);

  return (
    <div className="min-h-screen bg-navy-950 text-ink font-sans">
      <div className="max-w-[480px] mx-auto pt-[18px] px-4 pb-10">
        <div className="font-extrabold text-[1.35rem] italic tracking-tight leading-none mb-6 text-white">
           <img src={logo} alt="Career Connect" className="h-7 md:h-8 w-auto" />
        </div>

        <h1 className="text-[1.5rem] font-extrabold tracking-tight mb-2 text-white">
          Entrar na conta
        </h1>
        <p className="text-ink-muted mb-6">
          Acede à tua área pessoal para ver o teu passe, rondas e conexões.
        </p>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Método de autenticação"
          className="flex gap-1.5 bg-surface-soft p-1.5 rounded-full mb-6"
        >
          <button
            role="tab"
            aria-selected={mode === 'password'}
            onClick={() => switchMode('password')}
            className={`flex-1 rounded-full py-2.5 font-semibold text-sm transition ${
              mode === 'password'
                ? 'bg-navy-800 text-white'
                : 'bg-transparent text-ink-muted hover:text-ink'
            }`}
          >
            Palavra-passe
          </button>
          <button
            role="tab"
            aria-selected={mode === 'otp'}
            onClick={() => switchMode('otp')}
            className={`flex-1 rounded-full py-2.5 font-semibold text-sm transition ${
              mode === 'otp'
                ? 'bg-navy-800 text-white'
                : 'bg-transparent text-ink-muted hover:text-ink'
            }`}
          >
            Código de confirmação
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[.85rem] font-semibold">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={FIELD_BASE}
              disabled={mode === 'otp' && otpSent}
            />
          </div>

          {/* Password tab */}
          {mode === 'password' && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[.85rem] font-semibold">
                Palavra-passe
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={FIELD_BASE}
              />
            </div>
          )}

          {/* OTP tab */}
          {mode === 'otp' && !otpSent && (
            <button
              type="button"
              onClick={handleRequestOtp}
              disabled={sendingOtp || !email}
              className={`${BTN_BASE} w-full mt-2`}
            >
              {sendingOtp ? 'A enviar...' : 'Enviar código OTP'}
            </button>
          )}

          {mode === 'otp' && otpSent && (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="otp" className="text-[.85rem] font-semibold">
                  Código de 6 dígitos
                </label>
                <input
                  id="otp"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className={FIELD_BASE}
                />
                <p className="text-[.8rem] text-ink-muted">
                  Insira o código recebido por email.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={sendingOtp}
                className="text-sm text-primary-500 font-semibold text-center w-full mt-1"
              >
                {sendingOtp ? 'A reenviar...' : 'Reenviar código'}
              </button>
            </>
          )}

          {/* Feedback */}
          <div aria-live="polite" className="min-h-[1.25rem]">
            {error && (
              <div role="alert" className="text-danger text-sm font-semibold">
                {error}
              </div>
            )}
            {success && !error && (
              <div className="text-success text-sm font-semibold">{success}</div>
            )}
          </div>

          {/* Submit — só aparece se fizer sentido */}
          {showOtpSubmit && (
            <button className={`${BTN_BASE} w-full mt-2`} type="submit" disabled={loading}>
              {loading ? 'A entrar...' : 'Entrar'}
            </button>
          )}
        </form>

        {/* Test mode quick login */}
        {testUsers.length > 0 && (
          <div className="mt-8 pt-6 border-t border-line">
            <p className="text-[.8rem] text-ink-muted font-semibold mb-3 uppercase tracking-wide">Modo teste — login rápido</p>
            <div className="flex flex-wrap gap-2">
              {testUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => fillTestUser(u.email, u.testPassword)}
                  className="rounded-full bg-surface-soft text-[.78rem] font-semibold text-ink px-3 py-2 border border-line hover:bg-primary-500 hover:text-white transition"
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{u.name}</span>
                    <span className="text-[.7rem] text-primary-500 font-bold uppercase">{u.role}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-[.85rem] text-ink-muted mt-6">
          Não tem conta?{' '}
          <Link to="/registo" className="text-primary-500 font-semibold">
            Criar conta
          </Link>
        </p>
        <p className="text-center text-[.85rem] text-ink-muted">
          É mentor?{' '}
          <Link to="/registo/mentor" className="text-primary-500 font-semibold">
            Registe-se como mentor
          </Link>
        </p>
      </div>
    </div>
  );
}


///54links.com | 54limks.com | 54links.com
///54links.com 
