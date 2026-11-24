import React from 'react';
import { Heart, MessageCircle, Calendar, ShieldCheck, Sparkles, MapPin, Phone } from 'lucide-react';
import { REUNION_CONFIG } from '../config/reunionConfig';

interface FooterProps {
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  return (
    <footer className="border-t border-[#F0E1CE] bg-[#FFF5E8] py-16 px-4 sm:px-6 lg:px-8 text-center text-[#927B6C] text-xs w-full overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-2xl">🎓</span>
          <span className="font-black text-base text-[#594337] tracking-tight">
            {REUNION_CONFIG.schoolName}
          </span>
          <span className="text-[#E9B95B]">★</span>
          <span className="font-bold text-xs text-[#927B6C]">Reunion 2026</span>
        </div>

        <p className="max-w-lg mx-auto text-[#927B6C] text-sm leading-relaxed font-semibold">
          "{REUNION_CONFIG.headline}"<br />
          Bringing together our classmates, childhood laughter, and timeless school memories.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-bold text-[#594337]">
          <div className="flex items-center space-x-1 text-[#594337]">
            <MapPin className="w-3.5 h-3.5 text-rose-600" />
            <span>Venue: <strong>{REUNION_CONFIG.confirmedVenueName}</strong></span>
          </div>

          <span className="text-[#F0E1CE]">•</span>

          <a
            href={REUNION_CONFIG.contactPhoneTel}
            className="flex items-center space-x-1 text-[#594337] hover:text-[#E9B95B] transition"
          >
            <Phone className="w-3.5 h-3.5 text-[#E9B95B]" />
            <span>Any doubts call: <strong className="text-[#594337]">{REUNION_CONFIG.contactPhone}</strong></span>
          </a>

          <span className="text-[#F0E1CE]">•</span>

          <a
            href={REUNION_CONFIG.whatsappGroupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 hover:text-[#E9B95B] transition"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-[#594337]">Official WhatsApp</span>
          </a>

          <span className="text-[#F0E1CE]">•</span>

          <button
            onClick={onOpenAdmin}
            className="flex items-center space-x-1 text-[#927B6C] hover:text-[#594337] transition font-bold"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Organizer Portal</span>
          </button>
        </div>

        <div className="pt-6 border-t border-[#F0E1CE] text-[#927B6C] flex items-center justify-center space-x-1">
          <span>Preserving memories for the {REUNION_CONFIG.batchName} Alumni</span>
          <span className="text-[#E9B95B]">★</span>
        </div>
      </div>
    </footer>
  );
};
