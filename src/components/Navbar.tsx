import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, 
  Menu, 
  X, 
  ShieldCheck, 
  Ticket, 
  Sparkles,
  Camera, 
  Image as ImageIcon
} from 'lucide-react';
import { REUNION_CONFIG } from '../config/reunionConfig';
import { useLanguage } from '../context/LanguageContext';
import { sound } from '../utils/soundEffects';

interface NavbarProps {
  onOpenAdmin: () => void;
  onNavigateTo: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAdmin, onNavigateTo }) => {
  const { lang, toggleLang } = useLanguage();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      if (totalScroll > 0) {
        setScrollProgress((currentScroll / totalScroll) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShareSite = () => {
    sound.playPop();
    const siteUrl = window.location.origin;
    const shareText = `School Friends Reunion 2026 • ${REUNION_CONFIG.schoolName}!\n"One Last Time, Back to Where It All Began." Register, vote, and generate your personal keepsake memory card: ${siteUrl}`;

    if (navigator.share) {
      navigator.share({
        title: `${REUNION_CONFIG.schoolName} Reunion 2026`,
        text: shareText,
        url: siteUrl
      }).catch(() => {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
      });
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  const navLinks = [
    { id: 'countdown-hero', label: 'Home' },
    { id: 'about', label: 'Story' },
    { id: 'gallery', label: 'Memories' },
    { id: 'registration', label: 'RSVP' },
    { id: 'message-wall', label: 'Wall' },
    { id: 'whatsapp', label: 'WhatsApp' },
  ];

  return (
    <>
      {/* Scroll Progress Bar at very top */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-[#F0E1CE] z-50 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#E9B95B] via-[#F2CE85] to-[#E9B95B] shadow-[0_0_8px_#E9B95B]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Floating Warm Pill Navbar */}
      <header className="sticky top-4 z-40 px-3 sm:px-6 py-1 pointer-events-auto">
        <nav className="max-w-6xl mx-auto clay-pill bg-[#FFFFFF]/95 backdrop-blur-md px-4 sm:px-6 py-2.5 flex items-center justify-between border border-[#F0E1CE] shadow-md">
          
          {/* Brand Logo & Batch Tag */}
          <button
            onClick={() => {
              sound.playPop();
              const el = document.getElementById('invitation-hero');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center space-x-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F2CE85] via-[#E9B95B] to-[#D99F37] flex items-center justify-center shadow-md shadow-[#E9B95B]/30 group-hover:scale-105 transition">
              <span className="text-sm">🎓</span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs sm:text-sm font-black text-[#594337] tracking-tight">
                  Star Matric
                </span>
                <span className="text-xs text-[#E9B95B]">★</span>
                <span className="text-[10px] font-black text-[#594337] bg-[#E9B95B]/20 px-2 py-0.5 rounded-full border border-[#E9B95B]/40">
                  2026
                </span>
              </div>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1.5">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  sound.playPop();
                  onNavigateTo(link.id);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  link.id === 'registration'
                    ? 'bg-[#E9B95B]/20 text-[#594337] border border-[#E9B95B] hover:bg-[#E9B95B]/30 font-black'
                    : 'text-[#594337] hover:text-[#E9B95B] hover:bg-[#FFF5E8]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Action Buttons on Right */}
          <div className="flex items-center space-x-2">
            {/* Golden RSVP CTA Button */}
            <button
              onClick={() => {
                sound.playPop();
                onNavigateTo('registration');
              }}
              className="clay-button-gold px-4 py-1.5 rounded-full text-xs font-black text-[#413027] shadow-sm flex items-center space-x-1.5"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>RSVP</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShareSite}
              aria-label="Share reunion website"
              className="clay-button w-8 h-8 rounded-full flex items-center justify-center text-[#594337] hover:text-[#E9B95B]"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {/* Admin Shield Lock */}
            <button
              onClick={() => {
                sound.playPop();
                onOpenAdmin();
              }}
              aria-label="Admin Dashboard"
              title="Organizer Admin Portal"
              className="clay-button w-8 h-8 rounded-full flex items-center justify-center text-[#927B6C] hover:text-[#594337]"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden clay-button w-8 h-8 rounded-full flex items-center justify-center text-[#594337]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed inset-x-3 top-16 z-50 clay-card bg-[#FFFFFF] p-5 border-2 border-[#F0E1CE] shadow-2xl lg:hidden max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#F0E1CE] mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-[#594337]">
                Reunion Navigation
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-full text-[#927B6C] hover:text-[#594337]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    onNavigateTo(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-3 rounded-2xl text-left text-xs font-bold transition flex items-center space-x-2 ${
                    link.id === 'registration'
                      ? 'bg-[#E9B95B]/20 text-[#594337] border border-[#E9B95B] col-span-2 font-black'
                      : 'clay-surface-cream text-[#594337] hover:border-[#E9B95B]'
                  }`}
                >
                  <span>{link.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[#F0E1CE] flex items-center justify-between">
              <button
                onClick={() => {
                  onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="text-xs font-bold text-[#927B6C] hover:text-[#594337] flex items-center space-x-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Portal</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};