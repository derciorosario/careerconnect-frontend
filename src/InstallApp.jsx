
import React, { useState, useEffect, useRef, useCallback } from 'react';

const BTN_BASE =
  'inline-block rounded-full bg-primary-500 text-white font-semibold text-base px-7 py-3.5 cursor-pointer no-underline hover:brightness-110 transition disabled:cursor-not-allowed disabled:opacity-60';

const Container = ({ children }) => (
  <div className="max-w-[1180px] mx-auto px-[22px]">
    {children}
  </div>
);

// --------------------------------------------------
// PWA HELPERS
// --------------------------------------------------

const isInstalled = () => {
  if (typeof window === 'undefined') return false;

  return Boolean(
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
};

const getMobileOS = () => {
  if (typeof navigator === 'undefined') return null;

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

// --------------------------------------------------
// INSTALL COMPONENT
// --------------------------------------------------

export default function InstallApp() {
  const [installed, setInstalled] = useState(isInstalled);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showIOSInstallInstructions, setShowIOSInstallInstructions] =
    useState(false);

  const installPromptRef = useRef(null);
  const installingRef = useRef(false);
  const mountedRef = useRef(false);

  const os = getMobileOS();
  const isIOS = os === 'ios';

  // --------------------------------------------------
  // UPDATE INSTALL AVAILABILITY
  // --------------------------------------------------

  const updateInstallAvailability = useCallback(() => {
    if (isInstalled()) {
      setInstalled(true);
      setCanInstall(false);
      installPromptRef.current = null;
      return;
    }

    if (isIOS) {
      setCanInstall(true);
      return;
    }

    setCanInstall(Boolean(installPromptRef.current));
  }, [isIOS]);

  // --------------------------------------------------
  // LISTEN FOR PWA EVENTS
  // --------------------------------------------------

  useEffect(() => {
    mountedRef.current = true;

    const checkInstalled = () => {
      if (isInstalled()) {
        setInstalled(true);
        setCanInstall(false);
        installPromptRef.current = null;
      } else {
        updateInstallAvailability();
      }
    };

    // Browser makes the application installable.
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();

      // Keep the latest available prompt.
      installPromptRef.current = event;

      if (mountedRef.current) {
        setCanInstall(true);
      }
    };

    // Application was successfully installed.
    const handleAppInstalled = () => {
      installPromptRef.current = null;

      if (mountedRef.current) {
        setInstalled(true);
        setCanInstall(false);
        setIsInstalling(false);
        installingRef.current = false;
      }
    };

    // Browser visibility/focus events.
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkInstalled();
      }
    };

    const handleFocus = () => {
      checkInstalled();
    };

    const standaloneMedia = window.matchMedia(
      '(display-mode: standalone)'
    );

    const handleDisplayModeChange = () => {
      checkInstalled();
    };

    // Register listeners.
    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt
    );

    window.addEventListener('appinstalled', handleAppInstalled);

    window.addEventListener('focus', handleFocus);

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    standaloneMedia.addEventListener?.(
      'change',
      handleDisplayModeChange
    );

    // Initial checks.
    checkInstalled();

    return () => {
      mountedRef.current = false;

      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );

      window.removeEventListener(
        'appinstalled',
        handleAppInstalled
      );

      window.removeEventListener('focus', handleFocus);

      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );

      standaloneMedia.removeEventListener?.(
        'change',
        handleDisplayModeChange
      );
    };
  }, [updateInstallAvailability]);

  // --------------------------------------------------
  // INSTALL APPLICATION
  // --------------------------------------------------

  const handleInstall = async () => {
    if (installed || installingRef.current) return;

    // iOS does not support beforeinstallprompt.
    if (isIOS) {
      setShowIOSInstallInstructions(true);
      return;
    }

    const promptEvent = installPromptRef.current;

    if (!promptEvent) {
      // The browser has not provided an install prompt yet.
      setCanInstall(false);
      return;
    }

    installingRef.current = true;
    setIsInstalling(true);

    // A beforeinstallprompt event can only be used once.
    installPromptRef.current = null;
    setCanInstall(false);

    try {
      await promptEvent.prompt();

      const choice = await promptEvent.userChoice;

      if (choice.outcome === 'accepted') {
        console.log('User accepted the installation prompt.');
      } else {
        console.log('User dismissed the installation prompt.');
      }
    } catch (error) {
      console.error('PWA installation error:', error);
    } finally {
      installingRef.current = false;

      if (mountedRef.current) {
        setIsInstalling(false);

        // Recheck installation state.
        if (isInstalled()) {
          setInstalled(true);
          setCanInstall(false);
        } else {
          // Do not reuse the old prompt event.
          // Wait for the browser to dispatch a new one.
          setCanInstall(Boolean(installPromptRef.current));
        }
      }
    }
  };

  // --------------------------------------------------
  // HIDE IF ALREADY INSTALLED
  // --------------------------------------------------

  if (installed) return null;

  const buttonDisabled =
    isInstalling || (!canInstall && !isIOS);

  // Hide the whole section when the install button is disabled.
  if (buttonDisabled) return null;

  const label = isInstalling
    ? 'A instalar…'
    : isIOS
      ? 'Como instalar'
      : canInstall
        ? 'Instalar aplicação'
        : 'Instalação indisponível';

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <Container>
      <div className="mb-16 md:mb-20 bg-surface-soft border border-line rounded-card p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">

        <div className="max-w-[52ch]">
          <h2 className="text-[clamp(1.4rem,3.5vw,2rem)] font-extrabold tracking-tight mb-2">
            Leva o Career Connect contigo
          </h2>

          <p className="text-ink-muted">
            Instala a aplicação no teu dispositivo para um acesso
            mais rápido e uma experiência em ecrã inteiro —
            sem precisares de abrir o navegador.
          </p>
        </div>

        <button
          type="button"
          onClick={handleInstall}
          disabled={buttonDisabled}
          aria-busy={isInstalling}
          className={`${BTN_BASE} shrink-0`}
        >
          {label}
        </button>
      </div>

      {/* iOS INSTALL INSTRUCTIONS */}

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
            <h3
              id="ios-install-title"
              className="text-xl font-extrabold mb-3"
            >
              Instalar no iPhone ou iPad
            </h3>

            <p className="text-ink-muted mb-6">
              Abra este site no Safari. Toque no botão
              "Partilhar", seleccione "Adicionar ao ecrã principal"
              e confirme em "Adicionar".
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
