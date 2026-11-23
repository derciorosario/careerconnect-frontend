import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { getInitials } from './data';

export const Avatar = ({ name, size = 'md', variant = 'navy' }) => {
  const sizeClass = size === 'lg' ? 'w-16 h-16 text-xl' : 'w-[46px] h-[46px] text-sm';
  const variantClass = variant === 'orange' ? 'bg-primary-500' : 'bg-navy-800';
  return (
    <div className={`${sizeClass} ${variantClass} text-white rounded-full grid place-items-center font-extrabold shrink-0 tracking-wide`}>
      {getInitials(name)}
    </div>
  );
};

export const PersonRow = ({ name, subtitle, extra = null }) => (
  <div className="flex gap-3 items-center">
    <Avatar name={name} />
    <div className="flex-1 min-w-0">
      <b>{name}</b>
      <div className="text-ink-muted text-[.85rem] mt-px">{subtitle}</div>
    </div>
    {extra}
  </div>
);

export const ProgressBar = ({ value }) => (
  <div className="h-2 rounded-full bg-line overflow-hidden">
    <i className="block h-full bg-primary-500 rounded-full transition-[width] duration-400" style={{ width: `${value}%` }} />
  </div>
);

export const ChecklistItem = ({ label, done }) => (
  <div className="flex gap-2.5 items-center py-2 text-[.9rem] font-medium">
    <span className={`w-[22px] h-[22px] rounded-full border-2 grid place-items-center text-[.7rem] text-white shrink-0 transition ${
      done ? 'bg-success border-success' : 'border-line'
    }`}>
      {done ? '✓' : ''}
    </span>
    {label}
  </div>
);

export const Card = ({ children, variant = 'soft', className = '' }) => {
  const variantClass =
    variant === 'navy' ? 'bg-navy-800 text-white shadow-card'
    : variant === 'orange' ? 'bg-primary-50 border border-primary-500/25'
    : 'bg-surface-soft shadow-sm';
  return <div className={`rounded-card p-5 mb-3 ${variantClass} ${className}`}>{children}</div>;
};

export const Toast = ({ message }) => (
  <div className={`fixed left-1/2 bottom-[calc(88px+env(safe-area-inset-bottom,0px))] -translate-x-1/2 bg-ink text-surface px-[22px] py-[13px] rounded-full font-semibold text-[.88rem] max-w-[90vw] text-center z-[60] shadow-lg transition-all duration-200 ${
    message ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-3 pointer-events-none'
  }`} role="status">
    {message}
  </div>
);

export const QuestionInput = ({ onSubmit }) => {
  const [value, setValue] = useState('');
  return (
    <div className="flex gap-2 mt-3.5">
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        maxLength={200}
        placeholder="A tua pergunta (máx. 200)"
        className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 focus:border-primary-500 focus:outline-none"
      />
      <button
        onClick={() => {
          const trimmed = value.trim();
          if (!trimmed) return;
          onSubmit(trimmed);
          setValue('');
        }}
        className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white shrink-0"
      >
        Enviar
      </button>
    </div>
  );
};

export const AnnouncementInput = ({ onSubmit }) => {
  const [value, setValue] = useState('');
  return (
    <>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Ex.: Masterclass 2 começa na sala B"
        className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-3 focus:border-primary-500 focus:outline-none mt-3 mb-3"
      />
      <button
        onClick={() => {
          const trimmed = value.trim();
          if (!trimmed) return;
          onSubmit(trimmed);
          setValue('');
        }}
        className="rounded-full font-bold text-[.82rem] h-10 px-4 bg-primary-500 text-white"
      >
        Enviar anúncio
      </button>
    </>
  );
};

// Real, scannable QR code. Falls back to the ticket text if generation fails.
export const QrCode = ({ value, size = 120, className = '', downloadable = false }) => {
  const [dataUrl, setDataUrl] = useState('');
  const [displayUrl, setDisplayUrl] = useState('');

  useEffect(() => {
    let active = true;
    if (!value) { setDataUrl(''); setDisplayUrl(''); return; }
    // Generate checkin URL with relative path
    const url = `/checkin?ticket_code=${encodeURIComponent(value)}`;
    setDisplayUrl(url);
    QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: size * 2,
      color: { dark: '#1b2a57', light: '#ffffff' },
    })
      .then((url) => { if (active) setDataUrl(url); })
      .catch(() => { if (active) setDataUrl(''); });
    return () => { active = false; };
  }, [value, size]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `qr-${value}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!value) return null;

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <div
        className="bg-white rounded-[14px] p-1.5 shrink-0 grid place-items-center"
        style={{ width: size, height: size }}
      >
        {dataUrl ? (
          <img src={dataUrl} alt="QR Code" width={size} height={size} className="w-full h-full" />
        ) : (
          <span className="text-[.6rem] text-ink-muted text-center break-all px-1">{value}</span>
        )}
      </div>
      {displayUrl && (
        <a href={displayUrl} target="_blank" rel="noopener noreferrer" className="text-[.7rem] font-semibold text-primary-500 underline break-all text-center max-w-[200px]">
          {displayUrl}
        </a>
      )}
      {downloadable && dataUrl && (
        <button
          onClick={handleDownload}
          className="text-[.7rem] font-semibold text-primary-500 underline"
        >
          Descarregar QR
        </button>
      )}
    </div>
  );
};