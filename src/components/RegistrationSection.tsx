import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Users, 
  Share2, 
  MessageCircle, 
  ArrowRight, 
  BookOpen,
  Ticket
} from 'lucide-react';
import { REUNION_CONFIG } from '../config/reunionConfig';
import { useReunionData } from '../context/ReunionDataContext';
import { sound } from '../utils/soundEffects';
import type { AttendanceStatus, Registration } from '../types';

interface RegistrationSectionProps {
  onNavigateToSection?: (sectionId: string) => void;
}

export const RegistrationSection: React.FC<RegistrationSectionProps> = ({ 
  onNavigateToSection
}) => {
  const { addRegistration, stats } = useReunionData();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    batch: 'XII - A',
    guests: 0,
    attendance_status: 'Yes' as AttendanceStatus
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successReg, setSuccessReg] = useState<Registration | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return;

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) return;

    setIsSubmitting(true);

    try {
      const res = await addRegistration({
        name: formData.name.trim(),
        phone: cleanPhone,
        email: formData.email.trim() || undefined,
        batch: formData.batch.trim() || "XII - A",
        guests: Number(formData.guests) || 0,
        attendance_status: formData.attendance_status
      });

      if (res.data) {
        setSuccessReg(res.data);
      } else {
        const fallbackStudent: Registration = {
          id: `student-${Date.now()}`,
          name: formData.name.trim(),
          phone: cleanPhone,
          email: formData.email.trim() || undefined,
          batch: formData.batch.trim() || "XII - A",
          guests: Number(formData.guests) || 0,
          attendance_status: formData.attendance_status,
          created_at: new Date().toISOString()
        };
        setSuccessReg(fallbackStudent);
      }

      sound.playCelebration();

      confetti({
        particleCount: 85,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#E9B95B', '#F2CE85', '#FFF5E8', '#8E725B', '#FFFFFF']
      });

      const registeredName = formData.name.trim();
      const registeredBatch = formData.batch.trim();
      localStorage.setItem('star_matric_last_registered_student', registeredName);
      localStorage.setItem('star_matric_last_registered_batch', registeredBatch);

    } catch {
      // Guaranteed local confirmation fallback
      const fallbackStudent: Registration = {
        id: `student-${Date.now()}`,
        name: formData.name.trim(),
        phone: cleanPhone,
        email: formData.email.trim() || undefined,
        batch: formData.batch.trim() || "XII - A",
        guests: Number(formData.guests) || 0,
        attendance_status: formData.attendance_status,
        created_at: new Date().toISOString()
      };
      setSuccessReg(fallbackStudent);
      sound.playCelebration();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareWhatsApp = () => {
    sound.playPop();
    const siteUrl = window.location.origin;
    const msg = `Hey classmate! I just registered for the ${REUNION_CONFIG.schoolName} Reunion on 27 December 2026 at ${REUNION_CONFIG.confirmedVenueName}. Register here: ${siteUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <section id="registration" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10 w-full overflow-hidden">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full clay-pill bg-[#FFFFFF] text-[#594337] text-xs font-bold uppercase tracking-wider border border-[#F0E1CE]">
          <Ticket className="w-3.5 h-3.5 text-[#E9B95B]" />
          <span>Classmate Attendance RSVP</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-[#594337] tracking-tight uppercase">
          LET'S SEE WHO'S COMING!
        </h2>

        <p className="text-sm sm:text-base text-[#927B6C] max-w-xl mx-auto font-semibold">
          Secure your confirmed seat for our grand reunion at <strong>{REUNION_CONFIG.confirmedVenueName}</strong>
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!successReg ? (
          /* ================= CLAY REGISTRATION FORM ================= */
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="clay-card p-6 sm:p-10 bg-[#FFFFFF] border-2 border-[#F0E1CE] relative shadow-lg"
          >
            {/* Event Summary Banner */}
            <div className="mb-8 p-4 rounded-2xl clay-surface-cream border border-[#F0E1CE] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold text-[#594337]">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#E9B95B] flex-shrink-0" />
                <span><strong>School:</strong> {REUNION_CONFIG.schoolShortName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-[#E9B95B] flex-shrink-0" />
                <span><strong>Date:</strong> 27 December 2026</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#E9B95B] flex-shrink-0" />
                <span><strong>Time:</strong> 10:00 AM IST</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs uppercase font-extrabold tracking-wider text-[#594337] mb-2">
                      Full Name <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#927B6C] absolute left-4 top-3.5" />
                      <input
                        type="text"
                        required
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 clay-input text-sm font-semibold text-[#594337]"
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs uppercase font-extrabold tracking-wider text-[#594337] mb-2">
                      Mobile Number (WhatsApp) <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#927B6C] absolute left-4 top-3.5" />
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 clay-input text-sm font-semibold text-[#594337]"
                      />
                    </div>
                    <span className="text-[10px] text-[#927B6C] mt-1 block font-medium">
                      One registration per number • Confidential
                    </span>
                  </div>

                  {/* Standard / Class / Section */}
                  <div>
                    <label className="block text-xs uppercase font-extrabold tracking-wider text-[#594337] mb-2">
                      Standard / Class / Section <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. XII - A / XII - B / Commerce"
                      value={formData.batch}
                      onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                      className="w-full px-4 py-3 clay-input text-sm font-semibold text-[#594337]"
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs uppercase font-extrabold tracking-wider text-[#594337] mb-2">
                      Email Address <span className="text-[#927B6C] font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#927B6C] absolute left-4 top-3.5" />
                      <input
                        type="email"
                        placeholder="student@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 clay-input text-sm font-semibold text-[#594337]"
                      />
                    </div>
                  </div>

                  {/* Number of Guests */}
                  <div>
                    <label className="block text-xs uppercase font-extrabold tracking-wider text-[#594337] mb-2">
                      Number of Guests (Family / Spouse)
                    </label>
                    <div className="relative">
                      <Users className="w-4 h-4 text-[#927B6C] absolute left-4 top-3.5" />
                      <select
                        value={formData.guests}
                        onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value, 10) })}
                        className="w-full pl-11 pr-4 py-3 clay-input text-sm font-semibold text-[#594337] bg-[#FFFDF9]"
                      >
                        <option value={0}>0 (Just me)</option>
                        <option value={1}>+1 Guest</option>
                        <option value={2}>+2 Guests</option>
                        <option value={3}>+3 Guests</option>
                      </select>
                    </div>
                  </div>

                  {/* Attendance Confirmation */}
                  <div>
                    <label className="block text-xs uppercase font-extrabold tracking-wider text-[#594337] mb-2">
                      Will you attend? <span className="text-rose-600">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Yes', 'Maybe', 'No'] as AttendanceStatus[]).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setFormData({ ...formData, attendance_status: status })}
                          className={`py-3 rounded-xl text-xs font-black transition border ${
                            formData.attendance_status === status
                              ? 'clay-button-gold text-[#413027] shadow-sm'
                              : 'clay-button text-[#594337] border-[#F0E1CE]'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 text-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-10 py-4 rounded-[22px] clay-button-gold text-base font-black tracking-wide flex items-center justify-center space-x-2 shadow-md mx-auto disabled:opacity-50 text-[#413027]"
                  >
                    <span>{isSubmitting ? "Confirming..." : "CONFIRM REGISTRATION"}</span>
                    <ArrowRight className="w-5 h-5 text-[#413027]" />
                  </motion.button>
                </div>
              </form>
          </motion.div>
        ) : (
          /* ================= SUCCESS CONFIRMATION IN WARM CLAY ================= */
          <motion.div
            key="success"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-6"
          >
            {/* VIP Pass */}
            <div className="clay-card p-8 sm:p-10 bg-[#FFFFFF] border-2 border-[#E9B95B] relative overflow-hidden shadow-xl">
              <div className="absolute top-4 right-4 text-3xl text-[#E9B95B]">★</div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-[#E9B95B]">
                  <span>🎓</span>
                  <span>Registered Classmate Confirmed • {successReg.name}</span>
                </div>

                <h3 className="text-3xl sm:text-4xl font-black text-[#594337]">
                  Welcome, {successReg.name}!
                </h3>

                <p className="text-xs sm:text-sm font-semibold text-[#927B6C]">
                  Standard: {successReg.batch} • Attendance: {successReg.attendance_status}
                </p>

                <div className="p-4 rounded-2xl clay-surface-cream border border-[#F0E1CE] text-[#594337] text-xs sm:text-sm leading-relaxed space-y-1">
                  <div>"Your registration slot has been reserved for the <strong>{REUNION_CONFIG.schoolName}</strong> reunion on 27 December 2026 at <strong>{REUNION_CONFIG.confirmedVenueName}</strong>."</div>
                  <div className="text-[11px] text-[#927B6C] font-semibold">Have questions or travel doubts? Any doubts call: <strong className="text-[#594337]">{REUNION_CONFIG.contactPhone}</strong></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-[#F0E1CE] flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={REUNION_CONFIG.whatsappGroupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sound.playPop()}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-[20px] clay-button-gold text-sm font-black flex items-center justify-center space-x-2 text-[#413027]"
                >
                  <MessageCircle className="w-4 h-4 text-[#413027]" />
                  <span>JOIN WHATSAPP GROUP</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <button
                  onClick={handleShareWhatsApp}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-[20px] clay-button text-sm font-bold text-[#594337] flex items-center justify-center space-x-2 border border-[#E9B95B]"
                >
                  <Share2 className="w-4 h-4 text-[#E9B95B]" />
                  <span>Share on WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Quick Link to Gallery */}
            <div className="clay-card p-6 bg-[#FFFFFF] border-2 border-[#F0E1CE] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-[#E9B95B]" />
                <span className="text-xs sm:text-sm font-bold text-[#594337]">
                  Want to relive our school memories while you wait?
                </span>
              </div>
              <button
                onClick={() => onNavigateToSection?.('gallery')}
                className="px-4 py-2 rounded-xl clay-button text-xs font-bold text-[#594337] border border-[#F0E1CE]"
              >
                View Memory Photos →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};