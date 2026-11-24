import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Utensils, Flame, Leaf, Check, Sparkles, MapPin, Phone } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useReunionData } from '../context/ReunionDataContext';
import { REUNION_CONFIG } from '../config/reunionConfig';
import { sound } from '../utils/soundEffects';
import type { DietType, SpiceLevel } from '../types';

export const FoodPreferenceSection: React.FC = () => {
  const { currentRegistrant, saveFoodPreference, stats } = useReunionData();

  const [diet, setDiet] = useState<DietType>('Non-veg');
  const [spiceLevel, setSpiceLevel] = useState<SpiceLevel>('Medium');
  const [notes, setNotes] = useState('');
  const [attendeeName, setAttendeeName] = useState(currentRegistrant?.name || '');
  const [guestCount, setGuestCount] = useState(currentRegistrant?.guests || 0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playCelebration();

    await saveFoodPreference({
      registration_id: currentRegistrant?.id || `guest-${Date.now()}`,
      attendee_name: attendeeName || currentRegistrant?.name || "Fellow Classmate",
      diet,
      spice_level: spiceLevel,
      notes: notes.trim(),
      guests_count: guestCount
    });

    setSubmitted(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#E9B95B', '#E9B8B0', '#F6C9A8', '#594337', '#FFFFFF']
    });
  };

  const totalFeastPlates = stats.nonVegCount + stats.vegCount;

  return (
    <section id="food-poll" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative">
      {/* Glow highlight */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#E9B95B]/10 rounded-full blur-[90px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="text-center space-y-4 mb-10">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full clay-pill text-[#594337] text-xs font-bold uppercase tracking-wider border border-[#F0E1CE]">
          <MapPin className="w-3.5 h-3.5 text-[#E9B95B]" />
          <span>Feast Venue: {REUNION_CONFIG.confirmedVenueName}</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-[#594337] tracking-tight">
          <span className="text-[#E9B95B] font-kalam text-4xl sm:text-6xl block mb-1">
            "Biryani is Waiting!"
          </span>
          Feast at Habibi Mandi Karur
        </h2>

        <p className="text-sm sm:text-base text-[#927B6C] max-w-xl mx-auto leading-relaxed font-semibold">
          We are moving to <strong>{REUNION_CONFIG.confirmedVenueName}</strong> for our grand reunion feast! Select your dietary preference and spice level.
        </p>

        {/* Any doubts call Contact Pill */}
        <div className="pt-2">
          <a
            href={REUNION_CONFIG.contactPhoneTel}
            onClick={() => sound.playPop()}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full clay-pill border border-[#E9B95B] text-xs font-semibold text-[#594337] hover:scale-105 transition shadow-sm"
          >
            <Phone className="w-4 h-4 text-[#E9B95B]" />
            <span>Any doubts call: <strong className="text-[#594337]">{REUNION_CONFIG.contactPhone}</strong></span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Live Animated Biryani Pot / Plate Counter (5 cols) */}
        <div className="lg:col-span-5 clay-card p-6 sm:p-8 space-y-6 text-center bg-[#FFFFFF] border-2 border-[#F0E1CE]">
          <div className="relative inline-block mx-auto">
            <div className="text-7xl select-none animate-float-slow">
              🍲
            </div>
          </div>

          <div>
            <h4 className="text-3xl font-black text-[#594337]">
              {totalFeastPlates} Plates Reserved
            </h4>
            <p className="text-xs text-[#927B6C] mt-1 font-semibold">
              Live catering tally (classmates & guests)
            </p>
          </div>

          {/* Non-veg vs Veg Split */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl clay-surface-peach text-left border border-[#F6C9A8]">
              <div className="flex items-center space-x-1.5 text-[#594337] mb-1">
                <Flame className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#594337]">Non-Veg</span>
              </div>
              <div className="text-3xl font-black text-[#594337]">{stats.nonVegCount}</div>
              <div className="text-[11px] text-[#927B6C] font-semibold">Mutton / Chicken Biryani</div>
            </div>

            <div className="p-4 rounded-2xl clay-surface-beige text-left border border-[#F0E1CE]">
              <div className="flex items-center space-x-1.5 text-[#594337] mb-1">
                <Leaf className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#594337]">Veg</span>
              </div>
              <div className="text-3xl font-black text-[#594337]">{stats.vegCount}</div>
              <div className="text-[11px] text-[#927B6C] font-semibold">Paneer / Mushroom Feast</div>
            </div>
          </div>

          {/* Spice Breakdown */}
          <div className="pt-2 border-t border-[#F0E1CE]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#927B6C] mb-2">
              Spice Preference Breakdown
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl clay-surface-cream border border-[#F0E1CE]">
                <div className="text-xs font-bold text-[#927B6C]">Mild</div>
                <div className="text-base font-black text-[#594337]">{stats.mildCount}</div>
              </div>
              <div className="p-2.5 rounded-xl clay-surface-cream border border-[#F0E1CE]">
                <div className="text-xs font-bold text-[#927B6C]">Medium</div>
                <div className="text-base font-black text-[#594337]">{stats.mediumCount}</div>
              </div>
              <div className="p-2.5 rounded-xl clay-surface-cream border border-[#F0E1CE]">
                <div className="text-xs font-bold text-[#927B6C]">Spicy 🔥</div>
                <div className="text-base font-black text-[#594337]">{stats.spicyCount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Preference Form (7 cols) */}
        <div className="lg:col-span-7 clay-card p-6 sm:p-8 bg-[#FFFFFF] border-2 border-[#F0E1CE]">
          {submitted ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-12 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-[#E9B95B] text-[#413027] flex items-center justify-center mx-auto shadow-md">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="text-2xl font-black text-[#594337]">
                Biryani Order Saved!
              </h3>
              <p className="text-xs sm:text-sm text-[#927B6C] max-w-sm mx-auto font-semibold">
                Thank you! Your dietary choice of <strong>{diet} ({spiceLevel} Spice)</strong> has been recorded for the kitchen team.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 rounded-[18px] clay-button text-xs font-bold text-[#594337] border border-[#F0E1CE]"
              >
                Update My Order
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-lg font-black text-[#594337] pb-2 border-b border-[#F0E1CE]">
                Select Your Plate Details
              </h3>

              {/* Attendee Name */}
              <div>
                <label className="block text-xs uppercase font-extrabold tracking-wider text-[#594337] mb-2">
                  Attendee Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                  className="w-full px-4 py-3 clay-input text-sm font-bold text-[#594337]"
                />
              </div>

              {/* Diet Choice */}
              <div>
                <label className="block text-xs uppercase font-extrabold tracking-wider text-[#594337] mb-2">
                  Dietary Choice
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['Non-veg', 'Veg'] as DietType[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDiet(d)}
                      className={`py-3.5 px-4 rounded-[18px] font-black text-xs sm:text-sm flex items-center justify-center space-x-2 transition border ${
                        diet === d
                          ? d === 'Non-veg'
                            ? 'clay-surface-peach border-[#E9B95B] text-[#594337] shadow-md'
                            : 'clay-surface-beige border-emerald-500 text-[#594337] shadow-md'
                          : 'clay-button border-[#F0E1CE] text-[#927B6C]'
                      }`}
                    >
                      {d === 'Non-veg' ? <Flame className="w-4 h-4 text-rose-600" /> : <Leaf className="w-4 h-4 text-emerald-600" />}
                      <span>{d === 'Non-veg' ? "Authentic Non-Veg" : "Pure Vegetarian"}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Spice Level */}
              <div>
                <label className="block text-xs uppercase font-extrabold tracking-wider text-[#594337] mb-2">
                  Preferred Spice Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Mild', 'Medium', 'Spicy'] as SpiceLevel[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSpiceLevel(level)}
                      className={`py-3 rounded-[18px] font-bold text-xs transition border ${
                        spiceLevel === level
                          ? 'clay-button-gold text-[#413027] border-[#E9B95B]'
                          : 'clay-button border-[#F0E1CE] text-[#927B6C]'
                      }`}
                    >
                      {level} {level === 'Spicy' ? '🔥' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary Notes */}
              <div>
                <label className="block text-xs uppercase font-extrabold tracking-wider text-[#594337] mb-2">
                  Special Notes / Allergies <span className="text-[#927B6C] font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Extra raitha, Jain veg, no peanuts, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 clay-input text-sm font-semibold text-[#594337]"
                />
              </div>

              <div className="pt-2 text-center">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-9 py-3.5 rounded-[22px] clay-button-gold text-sm font-black tracking-wide text-[#413027]"
                >
                  SAVE BIRYANI PREFERENCE
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
