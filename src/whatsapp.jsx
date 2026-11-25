import { useState, useEffect } from 'react';
import {
  getWhatsAppQr, getWhatsAppStatus, sendWhatsAppTest, logoutWhatsApp,
} from './api/client';
import { Card } from './ui';

const WhatsApp = ({ showToast }) => {
  const [status, setStatus] = useState(null);
  const [qr, setQr] = useState(null);
  const [form, setForm] = useState({ chatId: '', message: '' });
  const [sending, setSending] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let mounted = true;
    let lastUpdated = null;

    const refreshQR = async () => {
      try {
        const { data } = await getWhatsAppQr();
        if (!mounted) return;
        setStatus(data);
        if (data?.dataUrl && data?.updatedAt !== lastUpdated) {
          lastUpdated = data.updatedAt;
          setQr(data.dataUrl);
        }
        if (!data?.dataUrl) setQr(null);
      } catch {
        if (mounted) setQr(null);
      }
    };

    const refreshStatus = async () => {
      try {
        const { data } = await getWhatsAppStatus();
        if (mounted) setStatus(data);
      } catch {
        if (mounted) setStatus({ connected: false, ready: false, state: 'BOT_UNAVAILABLE' });
      }
    };

    refreshQR();
    refreshStatus();

    const qrTimer = setInterval(refreshQR, 2000);
    const statusTimer = setInterval(refreshStatus, 5000);

    return () => {
      mounted = false;
      clearInterval(qrTimer);
      clearInterval(statusTimer);
    };
  }, []);

  const sendTest = async () => {
    if (sending) return;
    const chatId = form.chatId.replace(/\D/g, '');
    const message = form.message.trim();

    if (!chatId) {
      setResult({ type: 'error', text: 'Informe o número do WhatsApp.' });
      return;
    }
    if (!message) {
      setResult({ type: 'error', text: 'Digite uma mensagem.' });
      return;
    }

    setSending(true);
    setResult({ type: 'warning', text: 'A enviar mensagem...' });
    try {
      const { data } = await sendWhatsAppTest(chatId, message);
      if (data?.success) {
        setResult({ type: 'success', text: 'Mensagem enviada com sucesso.' });
        setForm((prev) => ({ ...prev, message: '' }));
        showToast?.('Mensagem enviada com sucesso.');
      } else {
        setResult({ type: 'error', text: data?.error || 'Falha ao enviar mensagem.' });
      }
    } catch (error) {
      setResult({
        type: 'error',
        text: error?.response?.data?.error || 'Não foi possível contactar o servidor.',
      });
    } finally {
      setSending(false);
    }
  };

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    setLoggingOut(true);
    setResult({ type: 'warning', text: 'A terminar sessão do WhatsApp...' });
    try {
      await logoutWhatsApp();
      setResult({ type: 'success', text: 'Sessão terminada. Escaneie o novo QR Code.' });
      showToast?.('Sessão do WhatsApp terminada.');
    } catch (error) {
      setResult({
        type: 'error',
        text: error?.response?.data?.error || 'Não foi possível terminar a sessão.',
      });
    } finally {
      setLoggingOut(false);
    }
  };

  const showQr =
    status &&
    !status.connected &&
    !status.authenticated &&
    status.state !== 'BOT_UNAVAILABLE' &&
    (status.state === 'SCAN_QR_CODE' || status.state === 'STARTING');

  const canSend = status?.ready && status?.connected;

  const resultColor =
    result?.type === 'success'
      ? 'text-success bg-success/10 border-success/30'
      : result?.type === 'error'
        ? 'text-danger bg-danger/10 border-danger/30'
        : 'text-primary-300 bg-primary-500/10 border-primary-500/30';

  return (
    <>
      <Card variant="navy">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary-500 grid place-items-center shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </div>
          <div>
            <h2 className="text-[1.1rem] font-extrabold tracking-tight">WhatsApp Bot</h2>
            <p className="text-[.82rem] text-ink-muted mt-0.5">
              Configure o número escaneando o QR Code e envie mensagens pela plataforma.
            </p>
          </div>
        </div>
      </Card>

      {/* Status */}
      <Card>
        <div className="flex items-center justify-between mb-3.5">
          <b>Estado da Ligação</b>
          <span className="text-[.74rem] text-ink-muted">
            {status?.lastReadyAt
              ? `Pronto: ${new Date(status.lastReadyAt).toLocaleTimeString('pt-MZ')}`
              : 'Aguardando...'}
          </span>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[.74rem] font-semibold mb-4 ${
            status?.ready
              ? 'bg-success/15 text-success'
              : status?.state === 'BOT_UNAVAILABLE'
                ? 'bg-danger/15 text-danger'
                : 'bg-primary-500/15 text-primary-300'
          }`}
        >
          {status?.ready ? (
            'Pronto'
          ) : status?.state === 'BOT_UNAVAILABLE' ? (
            'Indisponível'
          ) : (
            <>
              <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
              {status?.state || 'A ligar...'}
            </>
          )}
        </span>

        {(status?.authenticated || status?.ready || status?.connected) && (
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            disabled={loggingOut}
            className="w-full py-3 rounded-full text-[.85rem] font-bold mb-3 bg-danger text-white hover:brightness-110 disabled:opacity-50 transition"
          >
            {loggingOut ? 'A terminar...' : 'Terminar sessão do WhatsApp'}
          </button>
        )}

        {showQr && (
          <div className="rounded-inner border border-line bg-surface p-4 text-center">
            <p className="text-[.85rem] font-semibold mb-3">Escaneie com o WhatsApp</p>
            {qr ? (
              <img src={qr} alt="QR Code" className="mx-auto w-56 rounded-inner bg-white p-2" />
            ) : (
              <div className="mx-auto w-56 h-56 rounded-inner bg-surface-soft animate-pulse" />
            )}
            <p className="text-[.72rem] text-ink-muted mt-2.5">O código é atualizado automaticamente.</p>
          </div>
        )}

        {status?.state === 'BOT_UNAVAILABLE' && (
          <div className="rounded-inner border border-danger/30 bg-danger/10 p-4 text-[.78rem] text-danger mt-3">
            O bot do WhatsApp não está a responder. Verifique se o servidor está online.
          </div>
        )}

        {canSend && (
          <div className="rounded-inner border border-success/30 bg-success/10 p-4 text-[.78rem] text-success mt-3">
            WhatsApp ligado e pronto para enviar mensagens.
          </div>
        )}
      </Card>

      {/* Send test message */}
      <Card>
        <div className="mb-3.5">
          <b>Enviar mensagem de teste</b>
          <p className="text-[.82rem] text-ink-muted mt-1">
            Envia uma mensagem através da fila do bot.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-[.85rem] font-semibold mb-1.5">Número</label>
            <input
              type="tel"
              value={form.chatId}
              onChange={(e) => setForm((prev) => ({ ...prev, chatId: e.target.value }))}
              placeholder="258858616109"
              className="w-full text-base bg-surface border-2 border-line rounded-field px-3.5 py-3 focus:border-primary-500 focus:outline-none"
            />
            <p className="text-[.72rem] text-ink-muted mt-1.5">ex: 258858616109 ou 858616109</p>
          </div>
          <div>
            <label className="block text-[.85rem] font-semibold mb-1.5">Mensagem</label>
            <textarea
              rows={3}
              value={form.message}
              onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
              placeholder="Olá! Esta é uma mensagem."
              className="w-full text-base bg-surface border-2 border-line rounded-field px-3.5 py-3 focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={sendTest}
          disabled={sending || !canSend}
          className="mt-4 w-full py-3 rounded-full text-white text-[.85rem] font-bold shadow-sm bg-primary-500 hover:brightness-110 disabled:bg-surface2 disabled:text-ink-muted disabled:cursor-not-allowed transition"
        >
          {!canSend ? 'WhatsApp não está pronto' : sending ? 'A enviar...' : 'Enviar'}
        </button>

        {result && (
          <div className={`mt-4 rounded-inner border px-4 py-3 text-[.78rem] font-medium ${resultColor}`}>
            {result.text}
          </div>
        )}
      </Card>

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => !loggingOut && setShowLogoutConfirm(false)}>
          <div className="w-full max-w-sm rounded-card bg-surface-soft shadow-card overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-line flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-danger/15 text-danger grid place-items-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              <h3 className="text-[.92rem] font-bold">Terminar sessão do WhatsApp</h3>
            </div>
            <div className="p-5">
              <p className="text-[.82rem] text-ink-muted leading-relaxed">
                Tem a certeza que deseja terminar a sessão? A autenticação será removida e o QR Code
                terá de ser escaneado novamente para voltar a enviar mensagens.
              </p>
            </div>
            <div className="flex gap-2.5 px-5 pb-5">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                disabled={loggingOut}
                className="flex-1 py-3 rounded-full border border-line bg-surface text-ink text-[.82rem] font-bold hover:bg-surface-muted disabled:opacity-60 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                disabled={loggingOut}
                className="flex-1 py-3 rounded-full text-white text-[.82rem] font-bold bg-danger hover:brightness-110 disabled:opacity-50 transition"
              >
                {loggingOut ? 'A terminar...' : 'Terminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsApp;