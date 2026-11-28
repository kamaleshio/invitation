import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { 
  Registration, 
  FoodPreference, 
  WallMessage, 
  BenchClaim, 
  GameScore, 
  EventSettings,
  GeneratedCardRecord 
} from '../types';
import { 
  supabase, 
  isSupabaseConfigured, 
  getLocalStorageData, 
  setLocalStorageItem 
} from '../lib/supabase';
import { REUNION_CONFIG } from '../config/reunionConfig';

interface ReunionDataContextType {
  registrations: Registration[];
  foodPreferences: FoodPreference[];
  wallMessages: WallMessage[];
  benchClaims: BenchClaim[];
  gameScores: GameScore[];
  generatedCards: GeneratedCardRecord[];
  venueVotes: Record<string, number>;
  dateVotes: Record<string, number>;
  extraPollVotes: Record<string, Record<string, number>>;
  settings: EventSettings;
  currentRegistrant: Registration | null;
  setCurrentRegistrant: (reg: Registration | null) => void;
  adminDbNotice: string | null;
  clearAdminDbNotice: () => void;
  refreshRegistrations: () => Promise<Registration[]>;
  isLoadingRegistrations: boolean;
  registrationsError: string | null;
  
  // Registration (Strict 60-student limit enforced)
  addRegistration: (reg: Omit<Registration, 'id' | 'created_at'>) => Promise<{ success: boolean; data?: Registration; error?: string }>;
  updateRegistration: (id: string, updated: Partial<Registration>) => Promise<{ success: boolean; error?: string }>;
  deleteRegistration: (id: string) => Promise<void>;
  clearAllRegistrations: () => Promise<void>;
  
  // Food Preferences
  saveFoodPreference: (pref: Omit<FoodPreference, 'id' | 'created_at'>) => Promise<boolean>;
  
  // Voting
  castVenueVote: (venueId: string, userIdentifier: string) => Promise<{ success: boolean; error?: string }>;
  castDateVote: (dateId: string, userIdentifier: string) => Promise<{ success: boolean; error?: string }>;
  castExtraPollVote: (questionId: string, optionId: string, userIdentifier: string) => Promise<{ success: boolean; error?: string }>;
  hasUserVoted: (pollKey: string) => boolean;
  
  // Memory Card Generator Tracking
  recordCardGenerated: (studentName: string, templateId: 'idcard' | 'classic' | 'golden' | 'vintage') => Promise<void>;
  toggleCardGenerator: (enabled: boolean) => Promise<void>;
  
  // Bench Claims
  claimBench: (benchNumber: number, tagline: string) => Promise<{ success: boolean; error?: string }>;
  
  // Message Wall
  addWallMessage: (name: string, message: string, color: WallMessage['color']) => Promise<{ success: boolean; error?: string }>;
  toggleHideMessage: (id: string, hidden: boolean) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  
  // Game Leaderboard
  submitGameScore: (name: string, score: number, combo: number) => Promise<void>;
  resetLeaderboard: () => Promise<void>;
  
  // Admin Controls
  lockVenue: (venueId: string | null) => Promise<void>;
  lockDate: (dateId: string | null) => Promise<void>;
  updateSettings: (newSettings: Partial<EventSettings>) => Promise<void>;
  
  // Statistics
  stats: {
    totalRegistrations: number;
    maxCapacity: number;
    spotsRemaining: number;
    isCapacityFull: boolean;
    totalAttending: number;
    yesCount: number;
    maybeCount: number;
    noCount: number;
    totalGuests: number;
    vegCount: number;
    nonVegCount: number;
    mildCount: number;
    mediumCount: number;
    spicyCount: number;
    totalVenueVotes: number;
    totalDateVotes: number;
    totalCardsGenerated: number;
  };
}

const ReunionDataContext = createContext<ReunionDataContextType | null>(null);

export const ReunionDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = useMemo(() => getLocalStorageData(), []);

  const [registrations, setRegistrations] = useState<Registration[]>(initial.registrations);
  const [foodPreferences, setFoodPreferences] = useState<FoodPreference[]>(initial.foodPreferences);
  const [wallMessages, setWallMessages] = useState<WallMessage[]>(initial.wallMessages);
  const [benchClaims, setBenchClaims] = useState<BenchClaim[]>(initial.benchClaims);
  const [gameScores, setGameScores] = useState<GameScore[]>(initial.gameScores);
  const [generatedCards, setGeneratedCards] = useState<GeneratedCardRecord[]>(initial.generatedCards);
  const [venueVotes, setVenueVotes] = useState<Record<string, number>>(initial.venueVotes);
  const [dateVotes, setDateVotes] = useState<Record<string, number>>(initial.dateVotes);
  const [extraPollVotes, setExtraPollVotes] = useState<Record<string, Record<string, number>>>(initial.extraPollVotes);
  const [settings, setSettings] = useState<EventSettings>(initial.settings);
  const [currentRegistrant, setCurrentRegistrant] = useState<Registration | null>(() => {
    try {
      const stored = localStorage.getItem('star_matric_current_registrant');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [serverCount, setServerCount] = useState<number | null>(null);
  const [adminDbNotice, setAdminDbNotice] = useState<string | null>(null);
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);
  const [registrationsError, setRegistrationsError] = useState<string | null>(null);

  const clearAdminDbNotice = useCallback(() => {
    setAdminDbNotice(null);
  }, []);

  // Fetch all registered users from database via dedicated API or direct Supabase query
  const refreshRegistrations = useCallback(async (): Promise<Registration[]> => {
    setIsLoadingRegistrations(true);
    setRegistrationsError(null);
    let freshRegs: Registration[] | null = null;

    // Method 1: Dedicated production serverless API endpoint
    try {
      const res = await fetch('/api/registrations', { 
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          freshRegs = json.data as Registration[];
        }
      }
    } catch (err: any) {
      console.warn("API /api/registrations fetch notice:", err?.message);
    }

    // Method 2: Direct Supabase client query
    if (!freshRegs && isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('registrations')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          freshRegs = data as Registration[];
        } else if (error) {
          console.warn("Direct Supabase query error:", error.message);
          setRegistrationsError(error.message);
        }
      } catch (err: any) {
        console.warn("Supabase fetch exception:", err);
        setRegistrationsError(err?.message || 'Database connection error');
      }
    }

    if (freshRegs) {
      setRegistrations(freshRegs);
      setLocalStorageItem('registrations', freshRegs);
      setIsLoadingRegistrations(false);
      return freshRegs;
    }

    setIsLoadingRegistrations(false);
    return [];
  }, []);

  // Fetch real database statistics from Vercel serverless API
  const fetchLiveStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats', { 
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.totalRegistered === 'number') {
          setServerCount(data.totalRegistered);
        }
      }
    } catch {
      // ignore in offline mode
    }
  }, []);

  useEffect(() => {
    fetchLiveStats();
    // Poll every 25 seconds for live production updates (only when tab is visible to conserve bandwidth)
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchLiveStats();
      }
    }, 25000);
    return () => clearInterval(interval);
  }, [fetchLiveStats]);

  // Cross-tab broadcast channel for local sync
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('star_matric_channel');
      bc.onmessage = (event) => {
        if (event.data?.type === 'SYNC') {
          fetchLiveStats();
          const fresh = getLocalStorageData();
          setRegistrations(fresh.registrations);
          setFoodPreferences(fresh.foodPreferences);
          setWallMessages(fresh.wallMessages);
          setBenchClaims(fresh.benchClaims);
          setGameScores(fresh.gameScores);
          setGeneratedCards(fresh.generatedCards);
          setVenueVotes(fresh.venueVotes);
          setDateVotes(fresh.dateVotes);
          setExtraPollVotes(fresh.extraPollVotes);
          setSettings(fresh.settings);
        }
      };
    } catch (e) {
      console.warn("BroadcastChannel not supported", e);
    }
    return () => {
      bc?.close();
    };
  }, [fetchLiveStats]);

  const broadcastSync = () => {
    try {
      const bc = new BroadcastChannel('star_matric_channel');
      bc.postMessage({ type: 'SYNC' });
      bc.close();
    } catch {
      // ignore
    }
  };

  // Sync to Supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const fetchAllSupabaseData = async () => {
      try {
        const [
          { data: regs },
          { data: foods },
          { data: msgs },
          { data: claims },
          { data: scores },
          { data: sett }
        ] = await Promise.all([
          supabase.from('registrations').select('*'),
          supabase.from('food_preferences').select('*'),
          supabase.from('wall_messages').select('*').order('created_at', { ascending: false }),
          supabase.from('bench_claims').select('*'),
          supabase.from('game_scores').select('*').order('score', { ascending: false }).limit(20),
          supabase.from('event_settings').select('*').eq('id', 'main').single()
        ]);

        if (regs) setRegistrations(regs);
        if (foods) setFoodPreferences(foods);
        if (msgs) setWallMessages(msgs);
        if (claims) setBenchClaims(claims);
        if (scores) setGameScores(scores);
        if (sett) setSettings(sett);
      } catch (err) {
        console.error("Supabase initial fetch error:", err);
      }
    };

    fetchAllSupabaseData();
    refreshRegistrations();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, () => {
        fetchAllSupabaseData();
        refreshRegistrations();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wall_messages' }, () => fetchAllSupabaseData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bench_claims' }, () => fetchAllSupabaseData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'food_preferences' }, () => fetchAllSupabaseData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'poll_options' }, () => fetchAllSupabaseData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Save currentRegistrant to localStorage
  useEffect(() => {
    if (currentRegistrant) {
      localStorage.setItem('star_matric_current_registrant', JSON.stringify(currentRegistrant));
    }
  }, [currentRegistrant]);

  // Derived Stats
  const stats = useMemo(() => {
    const rawCount = registrations.length;
    // Always prioritize fresh production database count from Vercel API
    const totalRegistrations = serverCount !== null ? serverCount : rawCount;
    const maxCapacity = 999;
    const spotsRemaining = 999;
    const isCapacityFull = false;

    let yesCount = 0;
    let maybeCount = 0;
    let noCount = 0;
    let totalGuests = 0;
    let totalAttending = 0;

    registrations.forEach(r => {
      if (r.attendance_status === 'Yes') {
        yesCount += 1;
        totalGuests += (r.guests || 0);
        totalAttending += 1 + (r.guests || 0);
      } else if (r.attendance_status === 'Maybe') {
        maybeCount += 1;
      } else {
        noCount += 1;
      }
    });

    let vegCount = 0;
    let nonVegCount = 0;
    let mildCount = 0;
    let mediumCount = 0;
    let spicyCount = 0;

    foodPreferences.forEach(f => {
      const multiplier = 1 + (f.guests_count || 0);
      if (f.diet === 'Veg') vegCount += multiplier;
      else nonVegCount += multiplier;

      if (f.spice_level === 'Mild') mildCount += multiplier;
      else if (f.spice_level === 'Medium') mediumCount += multiplier;
      else if (f.spice_level === 'Spicy') spicyCount += multiplier;
    });

    const totalVenueVotes = Object.values(venueVotes).reduce((a, b) => a + b, 0);
    const totalDateVotes = Object.values(dateVotes).reduce((a, b) => a + b, 0);
    const totalCardsGenerated = generatedCards.reduce((acc, c) => acc + (c.downloadCount || 1), 0);

    return {
      totalRegistrations,
      maxCapacity,
      spotsRemaining,
      isCapacityFull,
      totalAttending,
      yesCount,
      maybeCount,
      noCount,
      totalGuests,
      vegCount,
      nonVegCount,
      mildCount,
      mediumCount,
      spicyCount,
      totalVenueVotes,
      totalDateVotes,
      totalCardsGenerated
    };
  }, [serverCount, registrations, foodPreferences, venueVotes, dateVotes, generatedCards]);

  // Check if user voted in a specific poll
  const hasUserVoted = (pollKey: string): boolean => {
    try {
      const votedPolls = JSON.parse(localStorage.getItem('star_matric_user_voted_polls') || '[]');
      return votedPolls.includes(pollKey);
    } catch {
      return false;
    }
  };

  const markUserVoted = (pollKey: string) => {
    try {
      const votedPolls = JSON.parse(localStorage.getItem('star_matric_user_voted_polls') || '[]');
      if (!votedPolls.includes(pollKey)) {
        votedPolls.push(pollKey);
        localStorage.setItem('star_matric_user_voted_polls', JSON.stringify(votedPolls));
      }
    } catch {
      // ignore
    }
  };

  // 1. Add Registration (OPEN / FREE CAPACITY FOR ALL CLASSMATES)
  const addRegistration = async (regData: Omit<Registration, 'id' | 'created_at'>) => {
    const cleanPhone = regData.phone.replace(/\D/g, '');
    let savedReg: Registration | null = null;

    // Attempt 1: Call production Vercel serverless API
    try {
      const apiRes = await fetch('/api/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(regData)
      });

      if (apiRes.ok) {
        const apiData = await apiRes.json();
        if (apiData.success && apiData.data) {
          savedReg = apiData.data as Registration;
          if (apiData.stats?.totalRegistered !== undefined) {
            setServerCount(apiData.stats.totalRegistered);
          }
          if (apiData.dbError || apiData.warning) {
            setAdminDbNotice(`Database status (Admin only): ${apiData.dbError || apiData.warning}`);
          }
        }
      } else {
        const errJson = await apiRes.json().catch(() => null);
        const errMsg = errJson?.error || '';
        if (errMsg.includes('ALL REGISTRATION SLOTS ARE FILLED')) {
          return { success: false, error: errMsg };
        }
        // Technical database errors are isolated to the admin only
        if (errMsg) {
          console.warn("Database sync notice (admin only):", errMsg);
          setAdminDbNotice(`Supabase API Notice: ${errMsg}`);
        }
      }
    } catch (err: any) {
      console.warn("API register fetch failed, local storage fallback active:", err);
      setAdminDbNotice(`Local storage fallback: API call failed (${err?.message || 'offline'})`);
    }

    if (savedReg) {
      // Re-fetch all registered users from database so admin & table are 100% in sync
      const freshList = await refreshRegistrations();
      if (!freshList.some(r => r.id === savedReg!.id)) {
        const updated = [savedReg, ...freshList.filter(r => r.id !== savedReg!.id)];
        setRegistrations(updated);
        setLocalStorageItem('registrations', updated);
      }
      setCurrentRegistrant(savedReg);
      try {
        localStorage.setItem('star_matric_current_registrant', JSON.stringify(savedReg));
      } catch {}
      broadcastSync();
      fetchLiveStats();
      return { success: true, data: savedReg };
    }

    // Attempt 2: Direct Supabase client insert if API didn't return
    let finalReg: Registration | null = null;
    if (isSupabaseConfigured && supabase) {
      try {
        let phoneToInsert = cleanPhone;
        const insertObj: any = {
          name: regData.name.trim(),
          phone: phoneToInsert,
          batch: regData.batch || 'XII - A',
          guests: regData.guests || 0,
          attendance_status: regData.attendance_status || 'Yes',
          created_at: new Date().toISOString()
        };
        if (regData.email) insertObj.email = regData.email.trim();
        if (regData.photo_url) insertObj.photo_url = regData.photo_url;

        let { data: inserted, error: insertError } = await supabase
          .from('registrations')
          .insert([insertObj])
          .select()
          .single();

        if (insertError && insertError.message?.includes('registrations_phone_key')) {
          phoneToInsert = `${cleanPhone}-${Math.floor(1000 + Math.random() * 9000)}`;
          insertObj.phone = phoneToInsert;
          const retry = await supabase.from('registrations').insert([insertObj]).select().single();
          inserted = retry.data;
        }

        if (inserted) {
          finalReg = inserted as Registration;
        }
      } catch (err: any) {
        console.warn("Direct Supabase insert error:", err);
      }
    }

    if (!finalReg) {
      finalReg = {
        ...regData,
        name: regData.name.trim(),
        phone: cleanPhone,
        id: typeof crypto !== 'undefined' && crypto.randomUUID 
          ? crypto.randomUUID() 
          : `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0')}`,
        created_at: new Date().toISOString()
      };
    }

    const freshList = await refreshRegistrations();
    if (!freshList.some(r => r.id === finalReg!.id)) {
      const updated = [finalReg, ...freshList.filter(r => r.id !== finalReg!.id)];
      setRegistrations(updated);
      setLocalStorageItem('registrations', updated);
    }

    setCurrentRegistrant(finalReg);
    try {
      localStorage.setItem('star_matric_current_registrant', JSON.stringify(finalReg));
    } catch {}
    broadcastSync();
    fetchLiveStats();
    return { success: true, data: finalReg };
  };

  // Update Registration (Admin)
  const updateRegistration = async (id: string, updatedFields: Partial<Registration>) => {
    try {
      await fetch('/api/registrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updatedFields })
      });
    } catch (err) {
      console.warn("PUT /api/registrations error:", err);
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.from('registrations').update(updatedFields).eq('id', id);
    }

    await refreshRegistrations();
    broadcastSync();
    fetchLiveStats();
    return { success: true };
  };

  // Delete Registration (Admin)
  const deleteRegistration = async (id: string) => {
    try {
      await fetch(`/api/registrations?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn("DELETE /api/registrations error:", err);
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.from('registrations').delete().eq('id', id);
    }

    await refreshRegistrations();
    broadcastSync();
    fetchLiveStats();
  };

  // Clear All Registrations (for starting clean live reunion)
  const clearAllRegistrations = async () => {
    setRegistrations([]);
    setFoodPreferences([]);
    setBenchClaims([]);

    setLocalStorageItem('registrations', []);
    setLocalStorageItem('food_preferences', []);
    setLocalStorageItem('bench_claims', []);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('registrations').delete().neq('id', 'keep-none');
      await supabase.from('food_preferences').delete().neq('id', 'keep-none');
      await supabase.from('bench_claims').delete().neq('id', 'keep-none');
    }
    broadcastSync();
  };

  // 2. Save Food Preference
  const saveFoodPreference = async (prefData: Omit<FoodPreference, 'id' | 'created_at'>) => {
    const newPref: FoodPreference = {
      ...prefData,
      id: `food-${Date.now()}`,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('food_preferences').insert([newPref]);
    }

    const updated = [...foodPreferences.filter(f => f.registration_id !== prefData.registration_id), newPref];
    setFoodPreferences(updated);
    setLocalStorageItem('food_preferences', updated);
    broadcastSync();
    return true;
  };

  // 3. Cast Venue Vote
  const castVenueVote = async (venueId: string, _userIdentifier: string) => {
    if (settings.locked_venue_id) {
      return { success: false, error: "The venue poll has been locked by the admin!" };
    }
    if (hasUserVoted('venue_poll')) {
      return { success: false, error: "You have already cast your vote for the venue!" };
    }

    const currentCount = venueVotes[venueId] || 0;
    const newVotes = { ...venueVotes, [venueId]: currentCount + 1 };
    setVenueVotes(newVotes);
    setLocalStorageItem('venue_votes', newVotes);
    markUserVoted('venue_poll');

    if (isSupabaseConfigured && supabase) {
      await supabase.rpc('increment_poll_vote', { option_id: venueId });
    }

    broadcastSync();
    return { success: true };
  };

  // 4. Cast Date Vote
  const castDateVote = async (dateId: string, _userIdentifier: string) => {
    if (settings.locked_date_id) {
      return { success: false, error: "The reunion date has already been locked by the organizer!" };
    }
    if (hasUserVoted('date_poll')) {
      return { success: false, error: "You have already cast your vote for the reunion date!" };
    }

    const currentCount = dateVotes[dateId] || 0;
    const newVotes = { ...dateVotes, [dateId]: currentCount + 1 };
    setDateVotes(newVotes);
    setLocalStorageItem('date_votes', newVotes);
    markUserVoted('date_poll');

    if (isSupabaseConfigured && supabase) {
      await supabase.rpc('increment_poll_vote', { option_id: dateId });
    }

    broadcastSync();
    return { success: true };
  };

  // 5. Cast Extra Poll Vote
  const castExtraPollVote = async (questionId: string, optionId: string, _userIdentifier: string) => {
    const pollKey = `poll_${questionId}`;
    if (hasUserVoted(pollKey)) {
      return { success: false, error: "You have already voted on this question!" };
    }

    const questionVotes = extraPollVotes[questionId] || {};
    const count = questionVotes[optionId] || 0;
    const updatedQuestion = { ...questionVotes, [optionId]: count + 1 };
    const updated = { ...extraPollVotes, [questionId]: updatedQuestion };

    setExtraPollVotes(updated);
    setLocalStorageItem('extra_poll_votes', updated);
    markUserVoted(pollKey);
    broadcastSync();
    return { success: true };
  };

  // 6. Record Memory Card Generated
  const recordCardGenerated = async (studentName: string, templateId: 'idcard' | 'classic' | 'golden' | 'vintage') => {
    const existingIndex = generatedCards.findIndex(c => c.studentName.toLowerCase() === studentName.toLowerCase() && c.templateId === templateId);
    let updated: GeneratedCardRecord[];

    if (existingIndex >= 0) {
      updated = generatedCards.map((c, i) => i === existingIndex ? { ...c, downloadCount: (c.downloadCount || 1) + 1, createdAt: new Date().toISOString() } : c);
    } else {
      const newCard: GeneratedCardRecord = {
        id: `card-${Date.now()}`,
        studentName,
        templateId,
        downloadCount: 1,
        createdAt: new Date().toISOString()
      };
      updated = [newCard, ...generatedCards];
    }

    setGeneratedCards(updated);
    setLocalStorageItem('generated_cards', updated);
    broadcastSync();
  };

  const toggleCardGenerator = async (enabled: boolean) => {
    const updated = { ...settings, card_generator_enabled: enabled };
    setSettings(updated);
    setLocalStorageItem('event_settings', updated);
    broadcastSync();
  };

  // 7. Claim Bench
  const claimBench = async (benchNumber: number, tagline: string) => {
    if (!currentRegistrant) {
      return { success: false, error: "Please register first to claim your old classroom bench!" };
    }

    const alreadyClaimedByOther = benchClaims.some(b => b.bench_number === benchNumber && b.registration_id !== currentRegistrant.id);
    if (alreadyClaimedByOther) {
      return { success: false, error: `Bench #${benchNumber} has already been claimed by a classmate!` };
    }

    let category: 'front' | 'middle' | 'last' = 'middle';
    if (benchNumber <= 12) category = 'front';
    else if (benchNumber >= 28) category = 'last';

    const newClaim: BenchClaim = {
      id: `bench-claim-${Date.now()}`,
      registration_id: currentRegistrant.id,
      student_name: currentRegistrant.name,
      bench_number: benchNumber,
      tagline: tagline.trim() || "My nostalgic spot!",
      row_category: category,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('bench_claims').upsert([newClaim], { onConflict: 'bench_number' });
    }

    const filtered = benchClaims.filter(b => b.registration_id !== currentRegistrant.id && b.bench_number !== benchNumber);
    const updated = [...filtered, newClaim];
    setBenchClaims(updated);
    setLocalStorageItem('bench_claims', updated);
    broadcastSync();
    return { success: true };
  };

  const sanitizeMessage = (text: string) => {
    const badWords = ['badword1', 'abuse', 'vulgar', 'spam'];
    let sanitized = text;
    badWords.forEach(w => {
      const reg = new RegExp(w, 'gi');
      sanitized = sanitized.replace(reg, '***');
    });
    return sanitized;
  };

  // 8. Add Wall Message
  const addWallMessage = async (name: string, rawMessage: string, color: WallMessage['color']) => {
    const lastPostTime = localStorage.getItem('star_matric_last_msg_time');
    if (lastPostTime) {
      const diffSec = (Date.now() - parseInt(lastPostTime, 10)) / 1000;
      if (diffSec < 60) {
        return { success: false, error: "Please wait a moment before posting another memory note!" };
      }
    }

    const message = sanitizeMessage(rawMessage.trim().substring(0, 140));
    if (!message) {
      return { success: false, error: "Message cannot be empty." };
    }

    const newMsg: WallMessage = {
      id: `msg-${Date.now()}`,
      name: name.trim() || "Classmate",
      message,
      color,
      hidden: false,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('wall_messages').insert([newMsg]);
    }

    const updated = [newMsg, ...wallMessages];
    setWallMessages(updated);
    setLocalStorageItem('wall_messages', updated);
    localStorage.setItem('star_matric_last_msg_time', Date.now().toString());
    broadcastSync();
    return { success: true };
  };

  const toggleHideMessage = async (id: string, hidden: boolean) => {
    const updated = wallMessages.map(m => m.id === id ? { ...m, hidden } : m);
    setWallMessages(updated);
    setLocalStorageItem('wall_messages', updated);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('wall_messages').update({ hidden }).eq('id', id);
    }
    broadcastSync();
  };

  const deleteMessage = async (id: string) => {
    const updated = wallMessages.filter(m => m.id !== id);
    setWallMessages(updated);
    setLocalStorageItem('wall_messages', updated);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('wall_messages').delete().eq('id', id);
    }
    broadcastSync();
  };

  // 9. Submit Game Score
  const submitGameScore = async (name: string, score: number, combo: number) => {
    let badge = 'Bell Runner';
    if (score >= 450) badge = 'Grand Bell Master';
    else if (score >= 350) badge = 'Bell Master';
    else if (score >= 200) badge = 'Bell Chimer';

    const newScore: GameScore = {
      id: `score-${Date.now()}`,
      name: name.trim() || 'Student',
      score,
      combo,
      badge,
      created_at: new Date().toISOString()
    };

    const updated = [...gameScores, newScore]
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    setGameScores(updated);
    setLocalStorageItem('game_scores', updated);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('game_scores').insert([newScore]);
    }
    broadcastSync();
  };

  const resetLeaderboard = async () => {
    setGameScores([]);
    setLocalStorageItem('game_scores', []);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('game_scores').delete().neq('id', 'keep-all');
    }
    broadcastSync();
  };

  // 10. Lock Venue / Lock Date (Admin)
  const lockVenue = async (venueId: string | null) => {
    const updated = { ...settings, locked_venue_id: venueId };
    setSettings(updated);
    setLocalStorageItem('event_settings', updated);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('event_settings').upsert([{ id: 'main', locked_venue_id: venueId }]);
    }
    broadcastSync();
  };

  const lockDate = async (dateId: string | null) => {
    const updated = { ...settings, locked_date_id: dateId };
    setSettings(updated);
    setLocalStorageItem('event_settings', updated);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('event_settings').upsert([{ id: 'main', locked_date_id: dateId }]);
    }
    broadcastSync();
  };

  const updateSettings = async (newSettings: Partial<EventSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    setLocalStorageItem('event_settings', updated);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('event_settings').upsert([{ id: 'main', ...updated }]);
    }
    broadcastSync();
  };

  return (
    <ReunionDataContext.Provider
      value={{
        registrations,
        foodPreferences,
        wallMessages,
        benchClaims,
        gameScores,
        generatedCards,
        venueVotes,
        dateVotes,
        extraPollVotes,
        settings,
        currentRegistrant,
        setCurrentRegistrant,
        addRegistration,
        updateRegistration,
        deleteRegistration,
        clearAllRegistrations,
        saveFoodPreference,
        castVenueVote,
        castDateVote,
        castExtraPollVote,
        hasUserVoted,
        recordCardGenerated,
        toggleCardGenerator,
        claimBench,
        addWallMessage,
        toggleHideMessage,
        deleteMessage,
        submitGameScore,
        resetLeaderboard,
        lockVenue,
        lockDate,
        updateSettings,
        adminDbNotice,
        clearAdminDbNotice,
        refreshRegistrations,
        isLoadingRegistrations,
        registrationsError,
        stats
      }}
    >
      {children}
    </ReunionDataContext.Provider>
  );
};

export const useReunionData = () => {
  const context = useContext(ReunionDataContext);
  if (!context) {
    throw new Error('useReunionData must be used within a ReunionDataProvider');
  }
  return context;
};
