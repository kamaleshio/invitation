import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Sparkles, AlertCircle, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useReunionData } from '../context/ReunionDataContext';
import { sound } from '../utils/soundEffects';
import type { WallMessage } from '../types';

export const MessageWallSection: React.FC = () => {
  const { wallMessages, addWallMessage, currentRegistrant } = useReunionData();

  const [authorName, setAuthorName] = useState(currentRegistrant?.name || '');
  const [messageText, setMessageText] = useState('');
  const [noteColor, setNoteColor] = useState<WallMessage['color']>('yellow');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pastel Sticky Note Color Palettes with warm chocolate text
  const colorMap: Record<WallMessage['color'], { bg: string; text: string; border: string }> = {
    yellow: { bg: 'bg-[#FFF9E6]', text: 'text-[#594337]', border: 'border-[#F0D597]' },
    pink: { bg: 'bg-[#FDF0EE]', text: 'text-[#594337]', border: 'border-[#F2C2BB]' },
    cyan: { bg: 'bg-[#F0F8FF]', text: 'text-[#594337]', border: 'border-[#B8DDF8]' },
    lime: { bg: 'bg-[#F2FAF4]', text: 'text-[#594337]', border: 'border-[#BBE3C7]' },
    orange: { bg: 'bg-[#FEF6EE]', text: 'text-[#594337]', border: 'border-[#F8D2B4]' },
    purple: { bg: 'bg-[#F8F2FC]', text: 'text-[#594337]', border: 'border-[#E0CCF5]' },
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!messageText.trim()) {
      setErrorMsg("Please enter a short memory note.");
      return;
    }

    setIsSubmitting(true);
    sound.playPop();

    const res = await addWallMessage(
      authorName || currentRegistrant?.name || "Classmate",
      messageText,
      noteColor
    );

    if (!res.success) {
      setErrorMsg(res.error || "Failed to post note.");
    } else {
      setMessageText('');
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.7 },
        colors: ['#E9B95B', '#E9B8B0', '#F6C9A8', '#594337', '#FFFFFF']
      });
    }

    setIsSubmitting(false);
  };

  const visibleMessages = wallMessages.filter(m => !m.hidden);

  return (
    <section id="message-wall" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12 relative w-full overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-80 bg-[#E9B95B]/10 rounded-full blur-[110px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full clay-pill text-[#594337] text-xs font-bold uppercase tracking-wider bg-white/90 border border-[#F0E1CE]">
          <MessageSquare className="w-3.5 h-3.5 text-[#E9B95B]" />
          <span>Nostalgia Board</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-[#594337] tracking-tight">
          Class Memory Sticky Wall
        </h2>

        <p className="text-sm sm:text-base text-[#8E725B] max-w-xl mx-auto leading-relaxed font-normal">
          Pin a nostalgic memory, teacher quote, school nickname, or inside joke for everyone to read!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Post a Note Card (4 cols) */}
        <div className="lg:col-span-4 clay-card bg-white/95 border border-[#F0E1CE] p-6 sm:p-7 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-[#594337] uppercase tracking-wider pb-2 border-b border-[#F0E1CE]">
            Pin Your Memory Note
          </h3>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-xs font-semibold text-rose-700 flex items-center space-x-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handlePost} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#594337] mb-1">
                Your Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#F0E1CE] text-xs font-medium text-[#594337] focus:outline-none focus:border-[#E9B95B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#594337] mb-1">
                Memory Note (Max 140 chars)
              </label>
              <textarea
                rows={3}
                maxLength={140}
                required
                placeholder="Remember when we hid during PT period..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#F0E1CE] text-xs font-medium text-[#594337] focus:outline-none focus:border-[#E9B95B] resize-none"
              />
              <div className="text-[10px] text-right text-[#8E725B] mt-0.5">
                {140 - messageText.length} chars left
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#594337] mb-1.5">
                Note Color Tint
              </label>
              <div className="flex gap-2">
                {(['yellow', 'pink', 'cyan', 'lime'] as WallMessage['color'][]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNoteColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition ${
                      c === 'yellow' ? 'bg-[#FFF9E6]' : c === 'pink' ? 'bg-[#FDF0EE]' : c === 'cyan' ? 'bg-[#F0F8FF]' : 'bg-[#F2FAF4]'
                    } ${noteColor === c ? 'border-[#E9B95B] scale-110 shadow-md' : 'border-gray-300'}`}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-[18px] bg-[#E9B95B] hover:bg-[#DFAB48] text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm text-[#594337] transition"
            >
              <Send className="w-3.5 h-3.5 text-[#594337]" />
              <span>{isSubmitting ? "Pinning..." : "PIN NOTE TO WALL"}</span>
            </button>
          </form>
        </div>

        {/* RIGHT: Pinned Notes Grid (8 cols) */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {visibleMessages.length === 0 ? (
            <div className="col-span-full p-12 text-center text-xs font-semibold text-[#8E725B] clay-card bg-white/95 border border-[#F0E1CE]">
              No notes pinned yet! Be the first classmate to leave a note.
            </div>
          ) : (
            visibleMessages.map((msg, idx) => {
              const rot = idx % 3 === 0 ? -2 : idx % 3 === 1 ? 1.5 : -1;
              const styling = colorMap[msg.color] || colorMap.yellow;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{ rotate: `${rot}deg` }}
                  className={`p-4 rounded-2xl ${styling.bg} border ${styling.border} shadow-md relative flex flex-col justify-between min-h-[140px] select-none hover:rotate-0 hover:scale-105 transition-transform duration-200`}
                >
                  {/* Pin Circle on top */}
                  <div className="w-3.5 h-3.5 rounded-full bg-[#E9B95B] border-2 border-white shadow-sm mx-auto -mt-1 mb-2" />

                  <p className="text-xs font-kalam text-[#594337] leading-relaxed my-1">
                    "{msg.message}"
                  </p>

                  <div className="pt-2 border-t border-[#594337]/10 flex items-center justify-between text-[10px] font-medium text-[#8E725B]">
                    <span className="text-[#594337] font-bold">{msg.name}</span>
                    <span>{new Date(msg.created_at).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
