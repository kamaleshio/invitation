import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { OpeningScene } from './components/OpeningScene';
import { Navbar } from './components/Navbar';
import { CountdownSection } from './components/CountdownSection';
import { AboutSection } from './components/AboutSection';
import { SchoolMemoryGallery } from './components/SchoolMemoryGallery';
import { RegistrationSection } from './components/RegistrationSection';
import { MessageWallSection } from './components/MessageWallSection';
import { WhatsAppSection } from './components/WhatsAppSection';
import { HeartCursorTrail } from './components/HeartCursorTrail';
import { BranchingNodeNetwork } from './components/BranchingNodeNetwork';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LanguageProvider } from './context/LanguageContext';
import { ReunionDataProvider, useReunionData } from './context/ReunionDataContext';

// Simple Error Boundary to guarantee no blank screen
class GlobalErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFF5E8] flex flex-col items-center justify-center p-6 text-center text-[#594337] space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#E9B95B]/20 text-[#E9B95B] flex items-center justify-center text-3xl mx-auto">
            🎓
          </div>
          <h2 className="text-2xl font-black uppercase">Star Matric School Reunion 2026</h2>
          <p className="text-sm text-[#927B6C] max-w-md">
            Welcome classmate! Click below to enter the reunion homepage.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="px-6 py-3 rounded-2xl clay-button-gold text-sm font-black"
          >
            Enter Reunion
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const AppContent: React.FC = () => {
  const { settings } = useReunionData();

  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(() => {
    return window.location.hash === '#admin';
  });

  // Listen to hash changes for #admin
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setIsAdminOpen(true);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigateToSection = (id: string) => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-[#FFF5E8] text-[#594337] relative selection:bg-[#E9B95B] selection:text-[#413027] warm-grid-bg">
      {/* Heart & Star Cursor Trail for desktop */}
      <HeartCursorTrail />

      {/* Cinematic Branching Node Animation Network (Reference Inspired) */}
      <BranchingNodeNetwork />

      {/* Ambient Floating Liquid Glass Elements (Inspired by Reference UI) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden max-w-full -z-0">
        {/* Soft Golden & Champagne Glow Orbs */}
        <div className="absolute top-[15%] left-[5%] w-[420px] h-[420px] rounded-full bg-[#E9B95B]/15 blur-[120px]" />
        <div className="absolute top-[45%] right-[5%] w-[480px] h-[480px] rounded-full bg-[#F6C9A8]/20 blur-[140px]" />
        <div className="absolute top-[75%] left-[10%] w-[450px] h-[450px] rounded-full bg-[#E9B8B0]/18 blur-[130px]" />

        {/* Floating 3D Peach Sphere (Top Left) */}
        <motion.div
          animate={{ y: [0, -18, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[18%] left-[3%] w-24 h-24 sm:w-32 sm:h-32 floating-sphere opacity-75 hidden md:block"
        />

        {/* Floating Tilted Liquid Glass Slate with Metallic Ribbon (Top Right) */}
        <motion.div
          animate={{ y: [0, 16, 0], rotate: [12, 15, 12] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[22%] right-2 sm:right-[3%] w-52 sm:w-64 h-36 sm:h-44 liquid-glass-slate p-3 hidden md:block"
        >
          {/* Internal Metallic Sweep Line */}
          <div className="w-full h-full rounded-2xl relative overflow-hidden border border-white/50">
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E9B95B] to-transparent shadow-[0_0_8px_rgba(233,185,91,0.8)] -rotate-12" />
          </div>
        </motion.div>

        {/* Floating 3D Ceramic Sphere (Mid Right) */}
        <motion.div
          animate={{ y: [0, 22, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[52%] right-[4%] w-20 h-20 sm:w-28 sm:h-28 floating-sphere opacity-70 hidden md:block"
        />

        {/* Floating Tilted Liquid Glass Slate (Mid Left) */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [-10, -7, -10] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[58%] left-2 sm:left-[2%] w-48 sm:w-60 h-32 sm:h-40 liquid-glass-slate p-3 hidden md:block"
        >
          <div className="w-full h-full rounded-2xl relative overflow-hidden border border-white/50">
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E9B95B] to-transparent shadow-[0_0_8px_rgba(233,185,91,0.8)] rotate-6" />
          </div>
        </motion.div>

        {/* Floating Sphere (Bottom Left) */}
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute top-[82%] left-[6%] w-16 h-16 sm:w-24 sm:h-24 floating-sphere opacity-60 hidden md:block"
        />
      </div>

      {/* CONTINUOUS SCROLL-DRIVEN ARCHITECTURE (NO NEXT BUTTON, SMOOTH REVERSE SCROLL) */}
      <div className="flex flex-col min-h-screen relative w-full max-w-full overflow-x-hidden">
        
        {/* 1. 3D Invitation Chamber Hero at Top */}
        <OpeningScene onScrollToHomepage={() => handleNavigateToSection('countdown-hero')} />

        {/* 2. Floating Liquid Glass Navbar (Pinned below intro hero) */}
        <Navbar 
          onOpenAdmin={() => setIsAdminOpen(true)}
          onNavigateTo={handleNavigateToSection}
        />

        <main className="flex-grow space-y-16 sm:space-y-24">
          {/* 3. Hero Countdown Section ("ONE LAST TIME, BACK TO WHERE IT ALL BEGAN.") */}
          <div id="countdown-hero">
            <CountdownSection 
              onRegisterClick={() => handleNavigateToSection('registration')}
              onExploreClick={() => handleNavigateToSection('gallery')}
            />
          </div>

          {/* 4. About Section Nostalgic Story ("MORE THAN A REUNION. A REUNION OF MEMORIES.") */}
          <AboutSection />

          {/* 5. School Memory Gallery ("THE DAYS WE WISH WE COULD RELIVE") */}
          <SchoolMemoryGallery />

          {/* 6. Student Registration ("LET'S SEE WHO'S COMING!" - Max 60 Limit) */}
          <RegistrationSection 
            onNavigateToSection={handleNavigateToSection}
          />

          {/* 7. Sticky Notes Memory Wall */}
          <MessageWallSection />

          {/* 9. WhatsApp Sharing & QR Section */}
          <WhatsAppSection />
        </main>

        {/* Footer */}
        <Footer onOpenAdmin={() => setIsAdminOpen(true)} />

        {/* Admin Login & Admin Dashboard Modal */}
        {isAdminOpen && (
          <AdminDashboard onClose={() => {
            setIsAdminOpen(false);
            if (window.location.hash === '#admin') {
              window.history.pushState(null, '', window.location.pathname);
            }
          }} />
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <GlobalErrorBoundary>
      <LanguageProvider>
        <ReunionDataProvider>
          <AppContent />
        </ReunionDataProvider>
      </LanguageProvider>
    </GlobalErrorBoundary>
  );
}
