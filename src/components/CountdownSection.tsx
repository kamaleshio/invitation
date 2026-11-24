import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Ticket, Sparkles, Users, ArrowRight, MapPin, Phone } from 'lucide-react';
import { REUNION_CONFIG } from '../config/reunionConfig';
import { useReunionData } from '../context/ReunionDataContext';
import { sound } from '../utils/soundEffects';

interface CountdownSectionProps {
  onRegisterClick?: () => void;
  onExploreClick?: () => void;
}

export const CountdownSection: React.FC<CountdownSectionProps> = ({
  onRegisterClick,
  onExploreClick
}) => {
  const { stats } = useReunionData();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isReunionDay: false,
    totalSeconds: 0
  });

  useEffect(() => {
    // 27 December 2026, 10:00 AM IST (Asia/Kolkata)
    const targetDate = new Date(REUNION_CONFIG.eventTimestamp).getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isReunionDay: true,
          totalSeconds: 0
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isReunionDay: false,
        totalSeconds: difference
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRegister = () => {
    sound.playPop();
    if (onRegisterClick) {
      onRegisterClick();
    } else {
      const el = document.getElementById('registration');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExplore = () => {
    sound.playPop();
    if (onExploreClick) {
      onExploreClick();
    } else {
      const el = document.getElementById('gallery');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const generateGoogleCalendarUrl = () => {
    const title = encodeURIComponent(`${REUNION_CONFIG.eventName} - ${REUNION_CONFIG.schoolName}`);
    const details = encodeURIComponent(`${REUNION_CONFIG.eventName} for ${REUNION_CONFIG.schoolName}. Time: ${REUNION_CONFIG.eventTimeText} (${REUNION_CONFIG.eventTimezone}). Venue: ${REUNION_CONFIG.confirmedVenueName}.`);
    const location = encodeURIComponent(`${REUNION_CONFIG.confirmedVenueName}, Karur`);
    const dates = "20261227T043000Z/20261227T083000Z";
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  };

  const timeUnits = [
    { label: "DAYS", value: timeLeft.days },
    { label: "HOURS", value: timeLeft.hours },
    { label: "MINUTES", value: timeLeft.minutes },
    { label: "SECONDS", value: timeLeft.seconds },
  ];

  return (
    <section id="countdown" className="pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full overflow-hidden">
      {/* Main Hero Clay / Warm Panel */}
      <div className="clay-panel p-8 sm:p-14 border-2 border-[#F0E1CE] bg-[#FFFDF9] text-center space-y-10 relative overflow-hidden shadow-xl">
        
        {/* Subtle Ambient Golden Glow Behind Panel */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-[#E9B95B]/15 rounded-full blur-[80px] pointer-events-none" />

        {/* Decorative Golden Star Accents */}
        <div className="absolute top-6 left-8 text-[#E9B95B] text-xl select-none pointer-events-none opacity-80">★</div>
        <div className="absolute top-6 right-8 text-[#E9B95B] text-xl select-none pointer-events-none opacity-80">★</div>
        <div className="absolute bottom-6 left-8 text-[#E9B95B] text-xl select-none pointer-events-none opacity-80">★</div>
        <div className="absolute bottom-6 right-8 text-[#E9B95B] text-xl select-none pointer-events-none opacity-80">★</div>

        {/* Hero Headers */}
        <div className="space-y-4 max-w-3xl mx-auto relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-5 py-2 rounded-full clay-pill text-xs font-black uppercase tracking-wider text-[#594337] border border-[#F0E1CE]">
            <span className="text-sm">🎓</span>
            <span>{REUNION_CONFIG.schoolName}</span>
            <span className="text-[#E9B95B]">★</span>
            <span className="text-[#927B6C]">{REUNION_CONFIG.batchYear} Batch</span>
          </div>

          {/* Main Title: SCHOOL FRIENDS REUNION 2026 */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#594337] tracking-tight uppercase leading-tight">
            {timeLeft.isReunionDay ? "TODAY IS REUNION DAY! 🎉" : "SCHOOL FRIENDS REUNION 2026"}
          </h1>

          {/* Subtitle from Spec: "ONE LAST TIME, BACK TO WHERE IT ALL BEGAN." */}
          <p className="text-lg sm:text-2xl font-black text-[#E9B95B] tracking-wide font-sans">
            "ONE LAST TIME, BACK TO WHERE IT ALL BEGAN."
          </p>

          <p className="text-sm sm:text-base text-[#927B6C] max-w-xl mx-auto leading-relaxed font-semibold">
            The countdown is ticking. Relive our school memories, classroom benches, and lifelong friendships.
          </p>

          {/* Information Cards (Date, Time, Venue, Doubts) */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-bold text-[#594337]">
            <div className="px-4 py-2 rounded-full clay-surface-cream border border-[#F0E1CE] flex items-center space-x-2">
              <span className="text-base">📅</span>
              <span><strong>DATE:</strong> 27 DECEMBER 2026</span>
            </div>
            <div className="px-4 py-2 rounded-full clay-surface-cream border border-[#F0E1CE] flex items-center space-x-2">
              <span className="text-base">⏰</span>
              <span><strong>TIME:</strong> 10:00 AM IST</span>
            </div>
            <div className="px-4 py-2 rounded-full clay-surface-cream border border-[#F0E1CE] flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-[#E9B95B]" />
              <span><strong>VENUE:</strong> {REUNION_CONFIG.confirmedVenueName}</span>
            </div>
            <a
              href={REUNION_CONFIG.contactPhoneTel}
              onClick={() => sound.playPop()}
              className="px-4 py-2 rounded-full clay-button border border-[#E9B95B] flex items-center space-x-2 text-[#594337] hover:scale-105 transition"
            >
              <Phone className="w-3.5 h-3.5 text-[#E9B95B]" />
              <span><strong>ANY DOUBTS CALL:</strong> {REUNION_CONFIG.contactPhone}</span>
            </a>
          </div>
        </div>

        {/* 4 Large Premium Countdown Blocks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto relative z-10">
          {timeUnits.map((unit) => (
            <motion.div
              key={unit.label}
              whileHover={{ scale: 1.05, y: -4 }}
              className="clay-card p-6 sm:p-8 rounded-[28px] bg-[#FFFFFF] border-2 border-[#F0E1CE] flex flex-col items-center justify-center space-y-1 shadow-md hover:border-[#E9B95B]"
            >
              <div className="text-4xl sm:text-6xl font-black text-[#594337] tracking-tight font-mono">
                {String(unit.value).padStart(2, '0')}
              </div>
              <div className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#E9B95B]">
                {unit.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons: REGISTER NOW and EXPLORE OUR MEMORIES */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 relative z-10">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleRegister}
            className="w-full sm:w-auto px-9 py-4 rounded-[22px] clay-button-gold text-base sm:text-lg font-black tracking-wide flex items-center justify-center space-x-2.5 shadow-md text-[#413027]"
          >
            <Ticket className="w-5 h-5 text-[#413027]" />
            <span>REGISTER NOW</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleExplore}
            className="w-full sm:w-auto px-8 py-4 rounded-[22px] clay-button text-base font-black text-[#594337] flex items-center justify-center space-x-2.5 border border-[#F0E1CE]"
          >
            <span>EXPLORE OUR MEMORIES</span>
            <ArrowRight className="w-4 h-4 text-[#E9B95B]" />
          </motion.button>
        </div>

        {/* Real Production Database Registration Capacity Meter */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
          <div className="px-5 py-2.5 rounded-full clay-surface-cream border border-[#F0E1CE] text-xs font-bold text-[#594337] flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <Users className="w-4 h-4 text-[#E9B95B]" />
            <span>
              <strong>{stats.totalRegistrations} / 60</strong> Registered classmates
            </span>
          </div>

          <div className="px-5 py-2.5 rounded-full clay-surface-cream border border-[#F0E1CE] text-xs font-bold text-[#594337]">
            {stats.isCapacityFull ? (
              <strong className="text-rose-600">ALL 60 SLOTS FILLED!</strong>
            ) : (
              <span className="text-[#594337]">
                <strong className="text-[#E9B95B]">{stats.spotsRemaining} SPOTS REMAINING</strong>
              </span>
            )}
          </div>
        </div>

        {/* Calendar Sync Link */}
        <div className="pt-4 flex items-center justify-center text-xs relative z-10">
          <a
            href={generateGoogleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playPop()}
            className="px-5 py-2.5 rounded-full clay-button text-[#927B6C] hover:text-[#594337] font-bold flex items-center space-x-2 border border-[#F0E1CE] shadow-sm"
          >
            <Calendar className="w-4 h-4 text-[#E9B95B]" />
            <span>Add 27 Dec 2026 to Google Calendar</span>
          </a>
        </div>
      </div>
    </section>
  );
};