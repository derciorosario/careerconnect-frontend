import React, { useState, useEffect, useRef } from 'react';

const BTN_BASE = 'inline-block rounded-full bg-primary-500 text-white font-semibold text-base px-7 py-3.5 cursor-pointer no-underline hover:brightness-110 transition';

const Container = ({ children }) => (
  <div className="max-w-[1180px] mx-auto px-[22px]">{children}</div>
);

// ── Helpers (same logic as InstallBanner) ──────────────────────────────────
const isInstalled = () =>
  Boolean(
    window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
  );

const getMobileOS = () => {
  const ua = navigator.userAgent || navigator.vendor || '';
  if (/android/i.test(ua)) return 'android';
  if (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  ) {
    return 'ios';
  }
  return null;
};

// Install section: captures the browser install prompt and lets the user add the
// app to their device. Renders nothing once the app is installed.
export default function InstallApp() {
  const [installed, setInstalled] = useState(isInstalled());
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showIOSInstallInstructions, setShowIOSInstallInstructions] =
    useState(false);

  const installPromptRef = useRef(null);

  useEffect(() => {
    // Already installed — nothing to capture.
    if (isInstalled()) {
      setInstalled(true);
      setCanInstall(false);
      return undefined;
    }

    const os = getMobileOS();
    // iOS never fires beforeinstallprompt, but install IS possible via Share menu.
    if (os === 'ios') setCanInstall(true);

    const onPrompt = (e) => {
      e.preventDefault();
      installPromptRef.current = e;
      setCanInstall(true);
    };

    const onInstalled = () => {
      installPromptRef.current = null;
      setInstalled(true);
      setCanInstall(false);
    };

    const checkInstalled = () => {
      if (isInstalled()) onInstalled();
    };

    const standaloneMedia = window.matchMedia('(display-mode: standalone)');
    const onVisibility = () => {
      if (document.visibilityState === 'visible') checkInstalled();
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    window.addEventListener('focus', checkInstalled);
    document.addEventListener('visibilitychange', onVisibility);
    standaloneMedia.addEventListener?.('change', checkInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      window.removeEventListener('focus', checkInstalled);
      document.removeEventListener('visibilitychange', onVisibility);
      standaloneMedia.removeEventListener?.('change', checkInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (installed) return;

    // iOS: no native prompt — show Add-to-Home-Screen instructions.
    if (getMobileOS() === 'ios') {
      setShowIOSInstallInstructions(true);
      return;
    }

    const promptEvent = installPromptRef.current;
    if (!promptEvent || isInstalling) return;

    setIsInstalling(true);
    installPromptRef.current = null;

    try {
      await promptEvent.prompt();
      await promptEvent.userChoice;
    } catch (err) {
      console.error('Install prompt failed:', err);
    } finally {
      // appinstalled may fire slightly later; re-check and re-evaluate
      // whether a fresh prompt is available.
      setInstalled(isInstalled());
      setIsInstalling(false);
      setCanInstall(Boolean(installPromptRef.current));
    }
  };

  // Hide the whole section once the app is installed.
  if (installed) return null;

  const isIOS = getMobileOS() === 'ios';
  const buttonDisabled = !canInstall && !isIOS;
  const label = isInstalling
    ? 'A instalar…'
    : isIOS
      ? 'Como instalar'
      : 'Instalar aplicação';

  return (
    <Container>
      <div className="mb-16 md:mb-20 bg-surface-soft border border-line rounded-card p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-[52ch]">
          <h2 className="text-[clamp(1.4rem,3.5vw,2rem)] font-extrabold tracking-tight mb-2">
            Leva o Career Connect contigo
          </h2>
          <p className="text-ink-muted">
            Instala a aplicação no teu dispositivo para um acesso mais rápido e uma experiência em ecrã inteiro —
            sem precisares de abrir o navegador.
          </p>
        </div>
        <button
          onClick={handleInstall}
          disabled={buttonDisabled}
          className={`${BTN_BASE} shrink-0 disabled:opacity-60`}
        >
          {label}
        </button>
      </div>

      {/* Inline iOS instructions modal (no external dependency) */}
      {showIOSInstallInstructions && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-install-title"
          onClick={() => setShowIOSInstallInstructions(false)}
        >
          <div
            className="w-full max-w-md bg-surface rounded-card shadow-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="ios-install-title" className="text-xl font-extrabold mb-3">
              Instalar no iPhone ou iPad
            </h3>
            <p className="text-ink-muted mb-6">
              Abra este site no Safari. Abra o menu do navegador, toque em
              "Partilhar" e seleccione "Adicionar ao ecrã principal". Depois,
              confirme em "Adicionar".
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowIOSInstallInstructions(false)}
                className="px-4 py-2 rounded-full border border-line text-ink font-semibold hover:bg-surface-soft transition"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => setShowIOSInstallInstructions(false)}
                className="px-4 py-2 rounded-full bg-primary-500 text-white font-semibold hover:brightness-110 transition"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}