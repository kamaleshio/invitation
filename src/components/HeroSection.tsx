import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Clock, MapPin, Sparkles, Star, ArrowRight, Heart, Camera, Ticket } from 'lucide-react';
import confetti from 'canvas-confetti';
import { REUNION_CONFIG } from '../config/reunionConfig';
import { useReunionData } from '../context/ReunionDataContext';
import { useLanguage } from '../context/LanguageContext';
import { sound } from '../utils/soundEffects';

interface HeroSectionProps {
  onRegisterClick: () => void;
  onExploreClick: () => void;
  onMemoryCardClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  onRegisterClick, 
  onExploreClick,
  onMemoryCardClick 
}) => {
  const { stats, settings } = useReunionData();
  const { t } = useLanguage();
  const [stars, setStars] = useState<Array<{ id: number; left: number; top: number; size: number; delay: number }>>([]);

  useEffect(() => {
    const starList = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: Math.random() * 92 + 4,
      top: Math.random() * 85 + 5,
      size: Math.random() * 12 + 12,
      delay: Math.random() * 3
    }));
    setStars(starList);
  }, []);

  // Milestone Celebration triggers
  useEffect(() => {
    const count = stats.totalRegistrations;
    if (count === 15 || count === 30 || count === 50 || count === 60) {
      sound.playCelebration();
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#E9B95B', '#E9B8B0', '#F6C9A8', '#594337', '#FFFFFF']
      });
    }
  }, [stats.totalRegistrations]);

  return (
    <section className="relative min-h-[90vh] py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center overflow-hidden">
      {/* Floating Golden Stars (★) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {stars.map((s) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0.3, scale: 0.8 }}
            animate={{
              opacity: [0.25, 0.8, 0.25],
              scale: [0.9, 1.15, 0.9],
              y: [0, -10, 0]
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              delay: s.delay,
              ease: "easeInOut"
            }}
            style={{
              position: 'absolute',
              left: `${s.left}%`,
              top: `${s.top}%`,
              color: '#E9B95B',
              fontSize: `${s.size}px`
            }}
          >
            ★
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto w-full text-center space-y-8">
        
        {/* Top Floating Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center space-x-2 px-5 py-2 rounded-full clay-card bg-[#FFFFFF] border border-[#F0E1CE] text-[#594337] text-xs sm:text-sm font-extrabold tracking-wide"
        >
          <span className="text-base">🎓</span>
          <span>{REUNION_CONFIG.schoolName}</span>
          <span className="text-[#E9B95B]">★</span>
          <span className="text-[#927B6C]">{REUNION_CONFIG.batchYear} Batch</span>
        </motion.div>

        {/* Elevated Clay Title Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="clay-card p-8 sm:p-12 bg-[#FFFFFF] border-2 border-[#FFFFFF] relative overflow-hidden"
        >
          {/* Decorative Corner Golden Stars */}
          <div className="absolute top-4 left-5 text-[#E9B95B] text-xl pointer-events-none select-none">★</div>
          <div className="absolute top-4 right-5 text-[#E9B95B] text-xl pointer-events-none select-none">★</div>
          <div className="absolute bottom-4 left-5 text-[#E9B95B] text-xl pointer-events-none select-none">★</div>
          <div className="absolute bottom-4 right-5 text-[#E9B95B] text-xl pointer-events-none select-none">★</div>

          <div className="space-y-4 max-w-3xl mx-auto">
            <span className="inline-block text-xs sm:text-sm uppercase font-black tracking-widest text-[#927B6C]">
              School Friends Reunion 2026
            </span>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-[#594337] tracking-tight leading-[1.1]">
              <span className="block font-kalam text-[#E9B95B] text-3xl sm:text-5xl md:text-6xl mb-1">
                "Some Memories
              </span>
              <span>Never Graduate."</span>
            </h1>

            {/* Supporting Nostalgic Message */}
            <p className="text-sm sm:text-base md:text-lg text-[#927B6C] max-w-2xl mx-auto leading-relaxed pt-2">
              {REUNION_CONFIG.supportingText}
            </p>

            {/* Event Quick Details Pills */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-[#594337]">
              <div className="px-3.5 py-1.5 rounded-full clay-surface-beige flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#E9B95B]" />
                <span>{REUNION_CONFIG.defaultEventDateText}</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-full clay-surface-beige flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-[#E9B8B0]" />
                <span>{REUNION_CONFIG.eventTimeText}</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-full clay-surface-beige flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E9B95B]" />
                <span>Venue Vote In Progress</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onRegisterClick}
                className="w-full sm:w-auto px-9 py-4 rounded-[20px] clay-button-gold text-base sm:text-lg font-black tracking-wide flex items-center justify-center space-x-2 shadow-lg"
              >
                <Ticket className="w-5 h-5 text-[#413027]" />
                <span>{REUNION_CONFIG.primaryCtaText}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onMemoryCardClick}
                className="w-full sm:w-auto px-8 py-4 rounded-[20px] clay-button text-base font-black text-[#594337] flex items-center justify-center space-x-2 border border-[#E9B95B]/40"
              >
                <Camera className="w-5 h-5 text-[#E9B95B]" />
                <span>CREATE MEMORY CARD</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
