import React, { useState, useEffect } from 'react';
import { Card } from './ui';
import { ccGetProfile, ccCheckIn, ccGetRegistrationByTicket } from './api/client';

export const CheckInScreen = () => {
  const [ticketCode, setTicketCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [checked, setChecked] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [regLoading, setRegLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('ticket_code') || params.get('ticketCode') || '';
    setTicketCode(code);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const resp = await ccGetProfile();
        const user = resp.data?.user || null;
        setIsOrganizer(user?.role === 'organizer');
      } catch {
        setIsOrganizer(false);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!ticketCode) {
      setRegLoading(false);
      return;
    }
    const loadRegistration = async () => {
      setRegLoading(true);
      setNotFound(false);
      try {
        const resp = await ccGetRegistrationByTicket(ticketCode);
        const reg = resp.data?.registration || null;
        setRegistration(reg);
        if (reg?.status === 'present') {
          setChecked(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setRegLoading(false);
      }
    };
    loadRegistration();
  }, [ticketCode]);

  const handleCheckIn = async () => {
    if (!ticketCode) return;
    setLoading(true);
    try {
      await ccCheckIn({ ticket_code: ticketCode });
      setChecked(true);
      if (registration) {
        setRegistration({ ...registration, status: 'present' });
      }
    } catch {
      // Check-in API errors are handled by backend response
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-ink font-sans flex flex-col items-center justify-center pt-[52px] px-6 pb-10">
      <div className="max-w-[480px] mx-auto text-center">
        <Card className="p-8">
          <div className="w-16 h-16 rounded-full bg-primary-500 text-white grid place-items-center font-extrabold text-[2rem] mx-auto mb-4">
            ✓
          </div>
          <h2 className="text-[1.5rem] font-extrabold tracking-tight mb-2">Check-in</h2>
          {regLoading ? (
            <p className="text-ink-muted text-[.85rem] mb-6">A validar bilhete...</p>
          ) : notFound ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-red-500 text-white grid place-items-center font-extrabold text-[1.5rem] mx-auto mb-3">
                ✕
              </div>
              <p className="text-red-500 font-semibold text-[1.1rem]">Bilhete inválido</p>
              <p className="text-ink-muted text-[.85rem] mt-1">O código <b className="text-primary-500 font-mono">{ticketCode}</b> não foi encontrado.</p>
            </div>
          ) : ticketCode ? (
            <>
              <p className="text-ink-muted text-[.85rem] mb-2">Código do bilhete: <b className="text-primary-500 font-mono">{ticketCode}</b></p>
              {registration && (
                <p className="text-[1rem] font-semibold mb-4 text-white">{registration.user?.name || 'Utilizador'}</p>
              )}
              {registration?.status === 'present' ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-green-500 text-white grid place-items-center font-extrabold text-[1.5rem] mx-auto mb-3">
                    ✓
                  </div>
                  <p className="text-success font-semibold text-[1.1rem]">Já fez check-in</p>
                  <p className="text-ink-muted text-[.85rem] mt-1">Check-in efetuado em {registration.checked_in_at ? new Date(registration.checked_in_at).toLocaleString('pt-PT') : 'momentos atrás'}</p>
                </div>
              ) : isOrganizer ? (
                <button
                  onClick={handleCheckIn}
                  disabled={loading}
                  className="w-full rounded-full font-bold text-[.82rem] h-12 bg-primary-500 text-white disabled:opacity-50"
                >
                  {loading ? 'A fazer check-in…' : 'Confirmar check-in'}
                </button>
              ) : (
                <div className="mt-6">
                  <span className="text-[.72rem] font-bold px-3 py-1 rounded-full bg-surface2 text-ink-muted">Apenas organizador</span>
                  <p className="text-ink-muted text-[.82rem] mt-2">Inicie sessão como organizador para confirmar o check-in.</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-ink-muted text-[.85rem] mb-6">Código de bilhete não fornecido.</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CheckInScreen;
