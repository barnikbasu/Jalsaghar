import React, { useEffect, useState } from 'react';
import { X, Copy, Check, Mail, Coffee } from 'lucide-react';
import QRCode from 'qrcode';

interface ContextualModalsProps {
  creatorsOpen: boolean;
  supportOpen: boolean;
  onCloseCreators: () => void;
  onCloseSupport: () => void;
}

export const ContextualModals: React.FC<ContextualModalsProps> = ({
  creatorsOpen,
  supportOpen,
  onCloseCreators,
  onCloseSupport,
}) => {
  const [emailCopied, setEmailCopied] = useState(false);
  const [upiCopied, setUpiCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const upiId = 'barnikbasu@oksbi';
  const upiUri = `upi://pay?pa=${upiId}`;
  const contactEmail = 'barnikbasu@gmail.com';

  // Generate real QR code for the UPI payment URL
  useEffect(() => {
    QRCode.toDataURL(upiUri, {
      width: 320,
      margin: 1,
      color: {
        dark: '#160b0e',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, [upiUri]);

  // Handle Escape key to close any active modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (creatorsOpen) onCloseCreators();
        if (supportOpen) onCloseSupport();
      }
    };

    if (creatorsOpen || supportOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [creatorsOpen, supportOpen, onCloseCreators, onCloseSupport]);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contactEmail);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setUpiCopied(true);
      setTimeout(() => setUpiCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  if (!creatorsOpen && !supportOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity duration-200">
      {/* Subtle warm radial glow in backdrop */}
      <div
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
        aria-hidden="true"
      >
        <div className="w-[500px] h-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(216,190,135,0.08)_0%,rgba(160,50,70,0.04)_40%,transparent_70%)] blur-2xl" />
      </div>

      {/* Click outside backdrop to close */}
      <div
        className="absolute inset-0 cursor-default"
        onClick={() => {
          if (creatorsOpen) onCloseCreators();
          if (supportOpen) onCloseSupport();
        }}
        aria-hidden="true"
      />

      {/* ========================================================= */}
      {/* CREATORS MODAL: "MADE WITH BHALOBASHA BY" */}
      {/* ========================================================= */}
      {creatorsOpen && (
        <div
          role="dialog"
          aria-labelledby="creator-heading"
          className="relative z-10 w-full max-w-[440px] bg-[rgba(14,8,10,0.96)] text-[#f7f3e9] rounded-2xl p-7 sm:p-8 border border-[rgba(212,175,55,0.18)] shadow-[0_25px_65px_rgba(0,0,0,0.95)] backdrop-blur-md transition-all duration-200 select-none animate-in fade-in zoom-in-95 font-poppins text-center"
        >
          {/* Close button */}
          <button
            onClick={onCloseCreators}
            id="close-creators-modal-btn"
            className="absolute top-4 right-4 p-2 rounded-full text-[#d6be96]/60 hover:text-[#f7f3e9] hover:bg-[rgba(212,175,55,0.10)] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Text */}
          <div className="mb-6 sm:mb-7">
            <h2
              id="creator-heading"
              className="font-rozha text-xs tracking-[0.25em] text-[#d6be96] uppercase font-normal"
            >
              MADE WITH BHALOBASHA BY
            </h2>
          </div>

          {/* Centered Single Profile Card */}
          <div className="flex flex-col items-center p-6 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(212,175,55,0.10)] mb-6">
            {/* Avatar Container with Subtle Gold Ring */}
            <div className="relative w-24 h-24 sm:w-26 sm:h-26 rounded-full p-1 bg-gradient-to-br from-[#d6be96] via-[#d6be96]/30 to-transparent shadow-md mb-3.5">
              <img
                src="/barnikbasu.png"
                alt="Barnik Basu"
                referrerPolicy="no-referrer"
                className="w-full h-full rounded-full object-cover object-top border border-[#160b0e]"
              />
            </div>

            <h3 className="font-rozha text-lg text-[#f7f3e9] tracking-wide mb-3.5">
              Barnik Basu
            </h3>

            {/* Social Media Badges */}
            <div className="flex items-center gap-2.5">
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/barnik-basu/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[rgba(11,6,7,0.72)] hover:bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.15)] text-[#d6be96]/80 hover:text-[#f7f3e9] transition-all text-xs font-poppins tracking-wider cursor-pointer group"
                aria-label="Barnik Basu on LinkedIn (opens in new tab)"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
                <span>LinkedIn</span>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/barnikbasu/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[rgba(11,6,7,0.72)] hover:bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.15)] text-[#d6be96]/80 hover:text-[#f7f3e9] transition-all text-xs font-poppins tracking-wider cursor-pointer group"
                aria-label="Barnik Basu on Instagram (opens in new tab)"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6m12.4 2.25a.75.75 0 1 1 0 1.5a.75.75 0 0 1 0-1.5M12 7a5 5 0 1 1 0 10a5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6a3 3 0 0 0 0-6z" />
                </svg>
                <span>Instagram</span>
              </a>
            </div>
          </div>

          {/* Footer Section: Contact Information with single-click copy capsule */}
          <div className="pt-5 border-t border-[rgba(212,175,55,0.12)] text-center">
            <p className="font-rozha text-[10px] tracking-[0.2em] text-[#d6be96]/60 uppercase mb-2.5">
              HAVE QUESTIONS OR THOUGHTS?
            </p>

            <div className="inline-flex items-center gap-2 max-w-full pl-3.5 pr-1.5 py-1.5 rounded-full bg-[rgba(11,6,7,0.72)] border border-[rgba(212,175,55,0.15)] hover:border-[rgba(212,175,55,0.30)] transition-all">
              <Mail className="w-3.5 h-3.5 text-[#d6be96]/70 shrink-0" />
              <span className="font-mono text-xs sm:text-sm text-[#f7f3e9] select-all truncate font-normal">
                {contactEmail}
              </span>
              <button
                onClick={handleCopyEmail}
                id="copy-creator-email-btn"
                className="ml-1 px-3 py-1 rounded-full bg-[rgba(212,175,55,0.12)] hover:bg-[rgba(212,175,55,0.22)] border border-[rgba(212,175,55,0.25)] text-[#f7f3e9] transition-all text-xs font-poppins font-medium flex items-center gap-1 cursor-pointer shrink-0"
                aria-label="Copy email address"
              >
                {emailCopied ? (
                  <>
                    <Check className="w-3 h-3 text-[#70c18c]" />
                    <span className="text-[#70c18c]">Copied</span>
                  </>
                ) : (
                  <>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CHAI / SUPPORT CARD: "Buy me a chai" */}
      {/* ========================================================= */}
      {supportOpen && (
        <div
          role="dialog"
          aria-labelledby="support-heading"
          aria-describedby="support-subheading"
          className="relative z-10 w-full max-w-sm bg-[rgba(14,8,10,0.96)] text-[#f7f3e9] rounded-2xl p-6 sm:p-7 border border-[rgba(212,175,55,0.18)] shadow-[0_25px_65px_rgba(0,0,0,0.95)] backdrop-blur-md transition-all duration-200 select-none animate-in fade-in zoom-in-95 font-poppins"
        >
          {/* Close button */}
          <button
            onClick={onCloseSupport}
            id="close-support-modal-btn"
            className="absolute top-4 right-4 p-2 rounded-full text-[#d6be96]/60 hover:text-[#f7f3e9] hover:bg-[rgba(212,175,55,0.10)] transition-colors cursor-pointer"
            aria-label="Close chai support card"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Heading */}
          <div className="text-center mb-1">
            <h2
              id="support-heading"
              className="font-rozha text-xl sm:text-2xl font-normal text-[#f7f3e9] tracking-wide"
            >
              Buy me a chai
            </h2>
            <p
              id="support-subheading"
              className="font-serif text-xs sm:text-sm text-[#d6be96]/80 mt-1"
            >
              Keep the mehfil playing.
            </p>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center my-4 sm:my-5">
            <div className="p-3 bg-white rounded-xl shadow-lg border border-[rgba(212,175,55,0.25)] flex items-center justify-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="UPI QR Code to pay barnikbasu@oksbi"
                  className="w-40 h-40 sm:w-44 sm:h-44 block rounded-lg"
                />
              ) : (
                <div className="w-40 h-40 sm:w-44 sm:h-44 flex items-center justify-center bg-neutral-100 rounded-lg text-neutral-400">
                  <Coffee className="w-8 h-8 animate-pulse text-[#d8be87]" />
                </div>
              )}
            </div>

            {/* Restrained instruction below QR code */}
            <p className="font-rozha text-[11px] tracking-[0.2em] text-[#d6be96]/60 mt-3 uppercase">
              Scan with any UPI app
            </p>
          </div>

          {/* UPI ID Section with Copy Button */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-[rgba(11,6,7,0.72)] border border-[rgba(212,175,55,0.15)] flex items-center justify-between gap-2">
            <div className="flex flex-col text-left pl-1 min-w-0">
              <span className="font-rozha text-[9.5px] uppercase tracking-widest text-[#d6be96]/70">
                UPI ID
              </span>
              <span className="font-mono text-xs sm:text-sm text-[#f7f3e9] tracking-wide truncate">
                {upiId}
              </span>
            </div>

            <button
              onClick={handleCopyUpi}
              id="copy-upi-id-btn"
              className="px-3.5 py-1.5 rounded-full bg-[rgba(212,175,55,0.12)] hover:bg-[rgba(212,175,55,0.22)] border border-[rgba(212,175,55,0.25)] text-[#f7f3e9] transition-all text-xs font-poppins font-medium flex items-center gap-1.5 cursor-pointer shrink-0"
              aria-label="Copy UPI ID to clipboard"
            >
              {upiCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#70c18c]" />
                  <span className="text-[#70c18c]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


