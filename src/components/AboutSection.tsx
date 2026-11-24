import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, BookOpen } from 'lucide-react';
import { REUNION_CONFIG } from '../config/reunionConfig';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full overflow-hidden">
      <div className="clay-panel p-8 sm:p-14 bg-[#FFFDF9] border-2 border-[#F0E1CE] relative overflow-hidden space-y-10 shadow-xl">
        
        {/* Subtle Decorative Stars */}
        <div className="absolute top-6 left-8 text-[#E9B95B] text-xl select-none pointer-events-none opacity-80">★</div>
        <div className="absolute top-6 right-8 text-[#E9B95B] text-xl select-none pointer-events-none opacity-80">★</div>
        <div className="absolute bottom-6 right-8 text-[#E9B95B] text-xl select-none pointer-events-none opacity-80">★</div>

        {/* Section Pill Badge */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full clay-pill bg-[#FFFFFF] text-xs font-black uppercase tracking-wider text-[#594337] border border-[#F0E1CE]">
            <BookOpen className="w-3.5 h-3.5 text-[#E9B95B]" />
            <span>Our Nostalgic Journey</span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-5xl font-black text-[#594337] tracking-tight uppercase max-w-3xl mx-auto">
            MORE THAN A REUNION. A REUNION OF MEMORIES.
          </h2>
        </div>

        {/* Description Body */}
        <div className="max-w-3xl mx-auto text-center space-y-6 text-[#927B6C] leading-relaxed text-base sm:text-lg">
          <p className="font-bold text-[#594337]">
            We walked through the same school corridors, shared the same classrooms, laughed together, learned together, and created memories that time could never erase.
          </p>

          <div className="flex items-center justify-center space-x-3 text-[#E9B95B]">
            <span className="w-12 h-0.5 bg-[#F0E1CE]" />
            <Heart className="w-5 h-5 text-[#E9B95B] fill-current" />
            <span className="w-12 h-0.5 bg-[#F0E1CE]" />
          </div>

          <p className="text-xl sm:text-2xl font-black font-kalam text-[#E9B95B]">
            Years may have passed, but the friendships remain.
          </p>

          <p className="text-[#927B6C] text-sm sm:text-base leading-relaxed font-semibold">
            <strong className="text-[#594337]">School Friends Reunion 2026</strong> is our chance to reconnect, remember the beautiful days, meet our classmates again, and create new memories together.
          </p>
        </div>

        {/* Centerpiece: Official Batch Group Photo Frame */}
        <div className="max-w-4xl mx-auto clay-card p-4 sm:p-6 bg-[#FFFFFF] border-2 border-[#F0E1CE] rounded-[28px] space-y-4 shadow-md">
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-[#FFF5E8] shadow-inner">
            <img 
              src={REUNION_CONFIG.officialGroupPhotoUrl} 
              alt="Star Matric Hr. Sec. School Batch Group Photo"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute bottom-3 left-3 px-3.5 py-1.5 rounded-full clay-pill bg-[#FFFFFF]/90 text-[#594337] text-xs font-black backdrop-blur-md border border-[#E9B95B] shadow-sm">
              🎓 Official Batch Group Photo • 2024 - 2025
            </div>
          </div>
          <div className="text-center space-y-1">
            <h4 className="text-base sm:text-lg font-black text-[#594337]">
              STAR MATRIC HR. SEC. SCHOOL • BATCH 2024 - 2025
            </h4>
            <p className="text-xs text-[#927B6C] font-semibold">
              Reuniting 60 classmates and our respected teachers under one roof
            </p>
          </div>
        </div>

        {/* Nostalgic Pillars: 3 Clay Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="clay-surface-cream p-6 rounded-[24px] border border-[#F0E1CE] text-center space-y-2 hover:border-[#E9B95B] transition">
            <div className="w-12 h-12 rounded-full bg-[#FFF5E8] border border-[#F0E1CE] text-[#E9B95B] flex items-center justify-center mx-auto shadow-sm text-xl">
              🏫
            </div>
            <h3 className="font-black text-sm uppercase tracking-wide text-[#594337]">
              {REUNION_CONFIG.schoolShortName}
            </h3>
            <p className="text-xs text-[#927B6C] leading-relaxed font-semibold">
              The classrooms, morning assemblies, and campus grounds that shaped our childhood.
            </p>
          </div>

          <div className="clay-surface-cream p-6 rounded-[24px] border border-[#F0E1CE] text-center space-y-2 hover:border-[#E9B95B] transition">
            <div className="w-12 h-12 rounded-full bg-[#FFF5E8] border border-[#F0E1CE] text-[#E9B95B] flex items-center justify-center mx-auto shadow-sm text-xl">
              🤝
            </div>
            <h3 className="font-black text-sm uppercase tracking-wide text-[#594337]">
              Lifelong Bonds
            </h3>
            <p className="text-xs text-[#927B6C] leading-relaxed font-semibold">
              From shared lunch tiffins to bench scribbles, true school friendships never graduate.
            </p>
          </div>

          <div className="clay-surface-cream p-6 rounded-[24px] border border-[#F0E1CE] text-center space-y-2 hover:border-[#E9B95B] transition">
            <div className="w-12 h-12 rounded-full bg-[#FFF5E8] border border-[#F0E1CE] text-[#E9B95B] flex items-center justify-center mx-auto shadow-sm text-xl">
              ✨
            </div>
            <h3 className="font-black text-sm uppercase tracking-wide text-[#594337]">
              Batch 2024 - 2025
            </h3>
            <p className="text-xs text-[#927B6C] leading-relaxed font-semibold">
              Reuniting 60 classmates for one grand day of celebration, laughter, and keepsakes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};