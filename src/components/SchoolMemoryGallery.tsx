import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Sparkles, X, ChevronLeft, ChevronRight, ZoomIn, Heart } from 'lucide-react';
import { REUNION_CONFIG } from '../config/reunionConfig';
import type { MemoryPhoto } from '../config/reunionConfig';
import { sound } from '../utils/soundEffects';

export const SchoolMemoryGallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'group' | 'tour' | 'campus'>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<MemoryPhoto | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  
  const allPhotos = REUNION_CONFIG.defaultMemoryPhotos;
  
  const filteredPhotos = selectedCategory === 'all' 
    ? allPhotos 
    : allPhotos.filter(p => p.category === selectedCategory);

  const handleOpenPhoto = (photo: MemoryPhoto, index: number) => {
    sound.playPop();
    setSelectedPhoto(photo);
    setSelectedIndex(index);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playPop();
    const nextIdx = (selectedIndex + 1) % filteredPhotos.length;
    setSelectedIndex(nextIdx);
    setSelectedPhoto(filteredPhotos[nextIdx]);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playPop();
    const prevIdx = (selectedIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    setSelectedIndex(prevIdx);
    setSelectedPhoto(filteredPhotos[prevIdx]);
  };

  // Keyboard navigation (Arrow keys & Escape)
  useEffect(() => {
    if (!selectedPhoto) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        setSelectedPhoto(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, selectedIndex, filteredPhotos]);

  return (
    <section id="gallery" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 w-full overflow-hidden">
      {/* Section Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full clay-pill bg-[#FFFFFF] text-[#594337] text-xs font-bold uppercase tracking-wider border border-[#F0E1CE]">
          <Camera className="w-3.5 h-3.5 text-[#E9B95B]" />
          <span>School Memories Vault</span>
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-5xl font-black text-[#594337] tracking-tight uppercase">
          THE DAYS WE WISH WE COULD RELIVE
        </h2>

        {/* Supporting text */}
        <p className="text-sm sm:text-base text-[#927B6C] max-w-2xl mx-auto leading-relaxed font-semibold">
          From classroom lessons to playground laughter, every corner of our school holds a story worth remembering.
        </p>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-4">
          {[
            { id: 'all', label: 'All Memories', count: allPhotos.length, icon: Sparkles },
            { id: 'group', label: 'Official Group Photo', count: allPhotos.filter(p => p.category === 'group').length, icon: Camera },
            { id: 'tour', label: 'School Tour Diaries', count: allPhotos.filter(p => p.category === 'tour').length, icon: Heart },
            { id: 'campus', label: 'Campus & Classrooms', count: allPhotos.filter(p => p.category === 'campus').length, icon: Camera },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                sound.playPop();
                setSelectedCategory(cat.id as any);
              }}
              className={`px-4 py-2 rounded-full text-xs font-black transition-all ${
                selectedCategory === cat.id
                  ? 'clay-button-gold text-[#413027] shadow-md'
                  : 'clay-button text-[#594337] border border-[#F0E1CE] hover:text-[#E9B95B]'
              }`}
            >
              <span>{cat.label}</span>
              <span className="ml-1.5 opacity-75 font-mono">({cat.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Warm Polaroid / Clay Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 sm:gap-9">
        {filteredPhotos.map((photo, index) => {
          const rotation = photo.rotation || (index % 2 === 0 ? -1.5 : 1.5);
          const isGroupPhoto = photo.category === 'group';
          const isTourPhoto = photo.category === 'tour';

          return (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: index * 0.05 }}
              style={{ rotate: `${rotation}deg` }}
              onClick={() => handleOpenPhoto(photo, index)}
              className={`clay-card p-4 sm:p-5 rounded-[26px] bg-[#FFFFFF] cursor-pointer group select-none border-2 border-[#F0E1CE] hover:border-[#E9B95B] hover:shadow-xl transition-all ${
                isGroupPhoto ? 'sm:col-span-2 lg:col-span-2' : ''
              }`}
            >
              {/* Photo Image Frame */}
              <div className={`relative rounded-2xl overflow-hidden mb-4 bg-[#FFF5E8] shadow-inner ${
                isGroupPhoto ? 'aspect-[16/9]' : 'aspect-[4/3]'
              }`}>
                <img
                  src={photo.url}
                  alt={photo.caption}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=80";
                  }}
                />

                {/* Badge Tag */}
                <div className={`absolute bottom-2.5 right-2.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wider shadow-md border ${
                  isGroupPhoto
                    ? 'bg-[#E9B95B] text-[#413027] border-white/60'
                    : isTourPhoto
                    ? 'bg-[#594337] text-[#FFF5E8] border-[#F0E1CE]'
                    : 'bg-[#FFFFFF]/90 text-[#594337] border-[#E9B95B]'
                }`}>
                  {isGroupPhoto ? '🎓 BATCH GROUP PHOTO' : isTourPhoto ? '🚌 SCHOOL TOUR' : `★ Photo ${index + 1}`}
                </div>

                {/* Hover Zoom Icon */}
                <div className="absolute inset-0 bg-[#594337]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#E9B95B] text-[#413027] flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition">
                    <ZoomIn className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Caption */}
              <div className="px-1 text-center space-y-1">
                <h3 className="font-black text-base text-[#594337] group-hover:text-[#E9B95B] transition font-sans line-clamp-1">
                  "{photo.caption}"
                </h3>
                {photo.year && (
                  <p className="text-xs text-[#927B6C] font-semibold">
                    {photo.year}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox Modal with Full View and Prev/Next Navigation */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 bg-[#594337]/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-[#FFFFFF] p-4 sm:p-6 border-2 border-[#F0E1CE] rounded-[32px] overflow-hidden shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-10 clay-button p-2.5 rounded-full text-[#594337] hover:text-rose-600 shadow-md"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Image Frame with Full Visibility */}
              <div className="relative rounded-2xl overflow-hidden bg-[#FFF5E8] mb-4 min-h-[320px] max-h-[70vh] flex items-center justify-center">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.caption}
                  className="w-full max-h-[68vh] object-contain rounded-xl"
                />

                {/* Prev Navigation arrow */}
                <button
                  onClick={(e) => handlePrev(e)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 clay-button p-3 rounded-full text-[#594337] shadow-lg hover:scale-105 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Next Navigation arrow */}
                <button
                  onClick={(e) => handleNext(e)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 clay-button p-3 rounded-full text-[#594337] shadow-lg hover:scale-105 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Caption */}
              <div className="text-center space-y-1 px-2">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-base sm:text-lg font-black text-[#594337]">
                    "{selectedPhoto.caption}"
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E9B95B]/30 text-[#594337] font-bold border border-[#E9B95B]">
                    {selectedIndex + 1} / {filteredPhotos.length}
                  </span>
                </div>
                <p className="text-xs text-[#927B6C] font-semibold">
                  {selectedPhoto.year} • {REUNION_CONFIG.schoolName}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};