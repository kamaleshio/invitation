import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { MessageCircle, Copy, Check, ExternalLink, Share2, Sparkles, Phone, MapPin, Eye, X } from 'lucide-react';
import { REUNION_CONFIG } from '../config/reunionConfig';
import { sound } from '../utils/soundEffects';

export const WhatsAppSection: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [showQrCardModal, setShowQrCardModal] = useState(false);

  const handleCopyLink = () => {
    sound.playPop();
    navigator.clipboard.writeText(REUNION_CONFIG.whatsappGroupUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    sound.playPop();
    const siteUrl = window.location.origin;
    const shareText = `School Friends Reunion 2026 • ${REUNION_CONFIG.schoolName}!\nJoin our official WhatsApp group: ${REUNION_CONFIG.whatsappGroupUrl}\n\nRegister & generate your personalized memory card here: ${siteUrl}`;

    if (navigator.share) {
      navigator.share({
        title: `${REUNION_CONFIG.schoolName} Reunion`,
        text: shareText,
        url: siteUrl
      }).catch(() => {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
      });
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  return (
    <section id="whatsapp" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center relative w-full overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#E9B95B]/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="clay-card p-8 sm:p-12 bg-[#FFFFFF] border-2 border-[#F0E1CE] relative overflow-hidden space-y-6">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full clay-pill bg-[#FFF5E8] text-[#594337] text-xs font-bold uppercase tracking-wider border border-[#F0E1CE]">
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>{REUNION_CONFIG.whatsappGroupName}</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-[#594337] tracking-tight">
          Join "{REUNION_CONFIG.whatsappGroupName}" on WhatsApp
        </h2>

        <p className="text-xs sm:text-sm text-[#927B6C] max-w-xl mx-auto leading-relaxed font-semibold">
          Stay connected with our school batchmates, throwback photos, feast updates, and reunion announcements.
        </p>

        {/* QR Code in Clay Pedestal */}
        <div className="py-4 flex flex-col items-center justify-center">
          <div className="p-5 rounded-[28px] bg-[#FFF5E8] border-2 border-[#E9B95B]/60 inline-block shadow-md relative group">
            <QRCodeSVG
              value={REUNION_CONFIG.whatsappGroupUrl}
              size={180}
              bgColor="#FFF5E8"
              fgColor="#594337"
              level="H"
              includeMargin={false}
            />
          </div>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-[11px] font-bold text-[#927B6C]">
              Scan with phone camera or WhatsApp QR scanner
            </span>
            <span className="text-[#927B6C]">•</span>
            <button
              onClick={() => { sound.playPop(); setShowQrCardModal(true); }}
              className="text-[11px] font-bold text-[#E9B95B] hover:text-[#D99F37] underline flex items-center space-x-1"
            >
              <Eye className="w-3 h-3" />
              <span>View Official Card</span>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href={REUNION_CONFIG.whatsappGroupUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playPop()}
            className="px-7 py-3.5 rounded-[20px] clay-button-gold text-xs sm:text-sm font-black flex items-center space-x-2 text-[#413027]"
          >
            <MessageCircle className="w-4 h-4 text-[#413027]" />
            <span>Open WhatsApp Group</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </a>

          <button
            onClick={handleShareWhatsApp}
            className="px-6 py-3.5 rounded-[20px] clay-button text-xs sm:text-sm font-bold text-[#594337] flex items-center space-x-2 border border-[#F0E1CE]"
          >
            <Share2 className="w-4 h-4 text-[#E9B95B]" />
            <span>Share Group with Friends</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="px-5 py-3.5 rounded-[20px] clay-button text-xs sm:text-sm font-bold text-[#927B6C] flex items-center space-x-1.5 border border-[#F0E1CE]"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#927B6C]" />}
            <span>{copied ? "Link Copied!" : "Copy Link"}</span>
          </button>
        </div>

        {/* Doubts and Venue Details */}
        <div className="pt-4 border-t border-[#F0E1CE] flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-bold text-[#594337]">
          <div className="flex items-center space-x-1.5 text-[#594337]">
            <span className="text-base">📍</span>
            <span>Venue: <strong className="text-[#594337]">{REUNION_CONFIG.confirmedVenueName}</strong></span>
          </div>

          <span className="hidden sm:inline text-[#F0E1CE]">•</span>

          <a
            href={REUNION_CONFIG.contactPhoneTel}
            onClick={() => sound.playPop()}
            className="px-4 py-2 rounded-full clay-button text-xs font-bold text-[#594337] flex items-center space-x-2 border border-[#E9B95B] hover:scale-105 transition"
          >
            <Phone className="w-3.5 h-3.5 text-[#E9B95B]" />
            <span>Any Doubts? Call: <strong className="text-[#594337]">{REUNION_CONFIG.contactPhoneDisplay}</strong></span>
          </a>
        </div>
      </div>

      {/* Official WhatsApp QR Modal */}
      {showQrCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative border-2 border-[#E9B95B]">
            <button
              onClick={() => setShowQrCardModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-[#594337]">Unscripted batch</h3>
              <p className="text-xs text-[#927B6C] font-semibold">Official WhatsApp Group QR Code</p>
            </div>
            <div className="rounded-2xl overflow-hidden border border-[#F0E1CE] shadow-sm">
              <img
                src="/images/whatsapp-qr.png"
                alt="Unscripted batch WhatsApp QR code"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="pt-2">
              <a
                href={REUNION_CONFIG.whatsappGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-2xl clay-button-gold text-xs font-black flex items-center justify-center space-x-2 text-[#413027]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Open in WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
