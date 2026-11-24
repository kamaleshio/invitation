import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, Calendar, Clock, ChevronDown } from 'lucide-react';
import { REUNION_CONFIG } from '../config/reunionConfig';
import { sound } from '../utils/soundEffects';

interface OpeningSceneProps {
  onScrollToHomepage?: () => void;
}

export const OpeningScene: React.FC<OpeningSceneProps> = ({ onScrollToHomepage }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [stars, setStars] = useState<Array<{ id: number; left: number; top: number; size: number; delay: number }>>([]);
  const musicTriggeredRef = useRef(false);

  // Scroll progress through the sticky track
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // 1. Envelope Flap opens smoothly on initial scroll (0 -> 0.25)
  const flapRotateX = useTransform(scrollYProgress, [0, 0.22], [0, 180]);
  const flapZIndex = useTransform(scrollYProgress, [0, 0.11, 0.12, 1], [35, 35, 5, 5]);
  const sealOpacity = useTransform(scrollYProgress, [0, 0.14], [1, 0]);

  // 2. Letter emerges completely from envelope (0.18 -> 0.65)
  // Letter moves upward by -290px while envelope base moves downward by +70px
  // Total separation of 360px guarantees the entire letter is 100% visible and unclipped
  const letterY = useTransform(scrollYProgress, [0.18, 0.65], [0, -290]);
  const letterScale = useTransform(scrollYProgress, [0.18, 0.65], [0.94, 1.04]);
  const envelopeY = useTransform(scrollYProgress, [0.18, 0.65], [0, 70]);

  // 3. Subtle prompt indicators
  const initialPromptOpacity = useTransform(scrollYProgress, [0, 0.10], [1, 0]);
  const letterPromptOpacity = useTransform(scrollYProgress, [0.45, 0.65, 0.95], [0, 1, 0.3]);
  const sceneOpacity = useTransform(scrollYProgress, [0.85, 1.0], [1, 0.7]);

  // Trigger soft background music once user starts scrolling
  useEffect(() => {
    return scrollYProgress.onChange((val) => {
      if (val > 0.05 && !musicTriggeredRef.current) {
        musicTriggeredRef.current = true;
        sound.startBackgroundMusic();
      }
    });
  }, [scrollYProgress]);

  // Generate subtle warm decorative stars
  useEffect(() => {
    const starList = [
      { id: 1, left: 12, top: 16, size: 14, delay: 0 },
      { id: 2, left: 22, top: 40, size: 10, delay: 1.2 },
      { id: 3, left: 82, top: 20, size: 16, delay: 0.6 },
      { id: 4, left: 78, top: 50, size: 12, delay: 2.1 },
      { id: 5, left: 16, top: 74, size: 11, delay: 1.5 },
      { id: 6, left: 86, top: 80, size: 15, delay: 0.9 },
      { id: 7, left: 48, top: 10, size: 18, delay: 2.5 },
      { id: 8, left: 32, top: 86, size: 11, delay: 1.8 },
      { id: 9, left: 68, top: 88, size: 13, delay: 0.4 },
    ];
    setStars(starList);
  }, []);

  const handleScrollToContent = () => {
    const target = document.getElementById('countdown-hero');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else if (onScrollToHomepage) {
      onScrollToHomepage();
    }
  };

  return (
    <section 
      ref={containerRef}
      id="invitation-hero"
      className="relative min-h-[230vh] w-full max-w-full overflow-hidden select-none"
    >
      {/* STICKY VIEWPORT CONTAINER */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden px-4">
        
        {/* 1. CINEMATIC WARM BACKGROUND WITH FLOATING SPHERES */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {/* Ambient Warm Radial Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#E9B95B]/15 rounded-full blur-[130px]" />
          <div className="absolute top-2/3 right-10 w-[420px] h-[420px] bg-[#F6C9A8]/25 rounded-full blur-[120px]" />

          {/* 3D Floating Spheres (Warm Cream & Peach) */}
          <motion.div
            animate={{ y: [0, -18, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-[8%] w-16 h-16 sm:w-20 sm:h-20 floating-sphere opacity-80 hidden md:block"
          />
          <motion.div
            animate={{ y: [0, 20, 0], rotate: [0, -6, 0] }}
            transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-44 right-[10%] w-20 h-20 sm:w-24 sm:h-24 floating-sphere opacity-75 hidden md:block"
          />
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-32 left-[12%] w-12 h-12 floating-sphere opacity-70 hidden lg:block"
          />

          {/* Golden Ambient Stars */}
          {stars.map((s) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: [0.3, 0.9, 0.3],
                scale: [0.9, 1.2, 0.9],
                y: [0, -6, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: s.delay,
                ease: "easeInOut"
              }}
              style={{
                position: 'absolute',
                left: `${s.left}%`,
                top: `${s.top}%`,
                color: '#E9B95B',
                fontSize: `${s.size}px`,
                filter: 'drop-shadow(0 0 6px rgba(233,185,91,0.4))'
              }}
            >
              ★
            </motion.div>
          ))}
        </div>

        <motion.div 
          style={{ opacity: sceneOpacity }}
          className="relative z-10 w-full max-w-sm sm:max-w-md flex flex-col items-center"
        >
          {/* 2. TOP BRAND PILL */}
          <header className="mb-6 flex items-center justify-center">
            <div className="inline-flex items-center space-x-2.5 px-5 py-2 clay-pill text-xs font-black tracking-widest uppercase text-[#594337] border border-[#F0E1CE] shadow-sm">
              <Sparkles className="w-4 h-4 text-[#E9B95B]" />
              <span>{REUNION_CONFIG.schoolName}</span>
              <span className="text-[#E9B95B]">★</span>
            </div>
          </header>

          {/* 3. 3D REUNION INVITATION ENVELOPE & LETTER CONTAINER */}
          <div className="relative w-full aspect-[4/3] max-w-[390px] mx-auto perspective-1000">
            
            {/* ENVELOPE BACKING (Shifts down slightly to accentuate letter rising) */}
            <motion.div
              style={{ y: envelopeY }}
              className="absolute inset-0 rounded-[30px] bg-[#F0E1CE] border-2 border-[#E2CEB7] shadow-2xl transition-transform duration-100"
            />

            {/* LETTER CARD (Slides smoothly UP as visitor scrolls down) */}
            <motion.div
              style={{
                y: letterY,
                scale: letterScale,
                boxShadow: '0 20px 45px -10px rgba(89, 67, 55, 0.22), 0 4px 12px rgba(89, 67, 55, 0.08)'
              }}
              className="absolute inset-x-3.5 top-3.5 bottom-3.5 rounded-[24px] bg-[#FFFFFF] border-2 border-[#E9B95B] p-5 sm:p-6 flex flex-col justify-between z-10"
            >
              {/* Letter Header */}
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center space-x-1.5 text-[#E9B95B]">
                  <span className="text-xs">★</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#927B6C]">
                    Official Reunion Invitation
                  </span>
                  <span className="text-xs">★</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-[#594337] tracking-tight">
                  {REUNION_CONFIG.schoolName}
                </h2>
                <p className="text-[11px] font-bold text-[#E9B95B]">
                  {REUNION_CONFIG.batchName}
                </p>
              </div>

              {/* Letter Body */}
              <div className="my-1.5 p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#F0E1CE] text-center space-y-1.5">
                <p className="text-xs font-bold text-[#594337] italic font-kalam">
                  "{REUNION_CONFIG.headline}"
                </p>
                <p className="text-[11px] text-[#927B6C] leading-relaxed">
                  Years passed, memories stayed. Our beloved classrooms and batchmates are waiting to celebrate together!
                </p>
                <div className="pt-1.5 flex items-center justify-center space-x-3 text-[11px] font-black text-[#594337]">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-[#E9B95B]" />
                    <span>27 Dec 2026</span>
                  </span>
                  <span className="text-[#E9B95B]">•</span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-[#E9B95B]" />
                    <span>10:00 AM IST</span>
                  </span>
                </div>
              </div>

              {/* In-letter guidance when revealed */}
              <div className="text-center pt-0.5">
                <span className="text-[10px] font-bold text-[#927B6C] uppercase tracking-wider">
                  Venue: {REUNION_CONFIG.confirmedVenueName}
                </span>
              </div>
            </motion.div>

            {/* ENVELOPE FRONT POCKET (Holds bottom of envelope, behind which letter emerges) */}
            <motion.div 
              style={{ y: envelopeY }}
              className="absolute inset-x-0 bottom-0 h-[66%] rounded-b-[30px] rounded-t-[12px] bg-[#FFFFFF] border-t-2 border-x-2 border-b-2 border-[#F0E1CE] z-20 pointer-events-none flex items-end justify-center pb-3.5 shadow-md"
            >
              <div className="text-[10px] font-black text-[#927B6C] uppercase tracking-widest flex items-center space-x-2">
                <span className="text-[#E9B95B]">★</span>
                <span className="text-[#594337]">Class of Reunion 2026</span>
                <span className="text-[#E9B95B]">★</span>
              </div>
            </motion.div>

            {/* ENVELOPE TOP FLAP (Folds open 180° via scrollProgress) */}
            <motion.div
              style={{
                y: envelopeY,
                rotateX: flapRotateX,
                zIndex: flapZIndex,
                transformOrigin: 'top center'
              }}
              className="absolute top-0 inset-x-0 h-[52%] rounded-t-[30px] rounded-b-[20px] bg-gradient-to-b from-[#F8F1E7] to-[#F0E1CE] border-2 border-[#E2CEB7] flex items-center justify-center preserve-3d shadow-sm"
            >
              {/* Golden Wax Seal on Flap (Smoothly fades as flap opens) */}
              <motion.div 
                style={{ opacity: sealOpacity }}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F2CE85] via-[#E9B95B] to-[#D99F37] flex flex-col items-center justify-center border-2 border-[#FFFFFF] shadow-lg shadow-[#E9B95B]/30"
              >
                <span className="text-lg">🎓</span>
                <span className="text-[8px] font-black tracking-wider text-[#413027]">2026</span>
              </motion.div>
            </motion.div>
          </div>

          {/* 4. SCROLL PROMPT GUIDANCE (NO BUTTONS - 100% SCROLL CONTROLLED) */}
          <div className="mt-6 text-center z-30 h-14 flex items-center justify-center">
            {/* Initial closed prompt */}
            <motion.div
              style={{ opacity: initialPromptOpacity }}
              className="flex flex-col items-center space-y-1"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-[#927B6C]">
                Scroll down to open invitation
              </span>
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronDown className="w-4 h-4 text-[#E9B95B]" />
              </motion.div>
            </motion.div>

            {/* Prompt when invitation has emerged */}
            <motion.div
              style={{ opacity: letterPromptOpacity }}
              onClick={handleScrollToContent}
              className="cursor-pointer inline-flex flex-col items-center space-y-1 py-1 px-4 rounded-xl clay-pill hover:border-[#E9B95B] transition"
            >
              <span className="text-xs font-black uppercase tracking-wider text-[#594337] flex items-center space-x-1">
                <span>Continue scrolling to enter reunion</span>
                <span className="text-[#E9B95B]">↓</span>
              </span>
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronDown className="w-4 h-4 text-[#E9B95B]" />
              </motion.div>
            </motion.div>
          </div>

        </motion.div>
      </div>
    </section>
  );
};
