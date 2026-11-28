import { createClient } from '@supabase/supabase-js';
import type { 
  Registration, 
  FoodPreference, 
  WallMessage, 
  BenchClaim, 
  GameScore, 
  EventSettings,
  GeneratedCardRecord 
} from '../types';
import { REUNION_CONFIG } from '../config/reunionConfig';

const DEFAULT_SUPABASE_URL = 'https://wpwostqcopjtawlwcyje.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indwd29zdHFjb3BqdGF3bHdjeWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1MjEzMTYsImV4cCI6MjExMTA5NzMxNn0.uYdpQIBGNEhCHrd0IBfF72640CIp89AQtAW20V3Wu0I';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-anon-key')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Clean Initial Data - ready for real classmate registrations
const DEFAULT_REGISTRATIONS: Registration[] = [];
const DEFAULT_FOOD_PREFERENCES: FoodPreference[] = [];
const DEFAULT_WALL_MESSAGES: WallMessage[] = [];
const DEFAULT_BENCH_CLAIMS: BenchClaim[] = [];
const DEFAULT_GAME_SCORES: GameScore[] = [];
const DEFAULT_GENERATED_CARDS: GeneratedCardRecord[] = [];

export const getLocalStorageData = () => {
  const getItem = <T>(key: string, defaultVal: T): T => {
    try {
      const data = localStorage.getItem(`star_matric_${key}`);
      return data ? JSON.parse(data) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  // Helper to remove any legacy mock records that may be cached in visitor's localStorage
  const rawRegs = getItem<Registration[]>('registrations', DEFAULT_REGISTRATIONS);
  const cleanRegs = rawRegs.filter(r => !r.id.startsWith('reg-'));

  const rawFood = getItem<FoodPreference[]>('food_preferences', DEFAULT_FOOD_PREFERENCES);
  const cleanFood = rawFood.filter(f => !f.id.startsWith('food-'));

  const rawWall = getItem<WallMessage[]>('wall_messages', DEFAULT_WALL_MESSAGES);
  const cleanWall = rawWall.filter(m => !m.id.startsWith('msg-'));

  const rawBenches = getItem<BenchClaim[]>('bench_claims', DEFAULT_BENCH_CLAIMS);
  const cleanBenches = rawBenches.filter(b => !b.id.startsWith('bench-'));

  const rawScores = getItem<GameScore[]>('game_scores', DEFAULT_GAME_SCORES);
  const cleanScores = rawScores.filter(s => !s.id.startsWith('score-'));

  const rawCards = getItem<GeneratedCardRecord[]>('generated_cards', DEFAULT_GENERATED_CARDS);
  const cleanCards = rawCards.filter(c => !c.id.startsWith('card-'));

  // Sync cleaned lists back to localStorage if mock data was purged
  if (rawRegs.length !== cleanRegs.length) setLocalStorageItem('registrations', cleanRegs);
  if (rawFood.length !== cleanFood.length) setLocalStorageItem('food_preferences', cleanFood);
  if (rawWall.length !== cleanWall.length) setLocalStorageItem('wall_messages', cleanWall);
  if (rawBenches.length !== cleanBenches.length) setLocalStorageItem('bench_claims', cleanBenches);
  if (rawScores.length !== cleanScores.length) setLocalStorageItem('game_scores', cleanScores);
  if (rawCards.length !== cleanCards.length) setLocalStorageItem('generated_cards', cleanCards);

  // Clear any cached example name in registration storage
  try {
    const cachedName = localStorage.getItem('star_matric_last_registered_student');
    if (cachedName) {
      const lower = cachedName.toLowerCase();
      if (lower.includes('krithik') || lower.includes('karthik') || lower.includes('priya') || lower.includes('senthil') || lower.includes('anand')) {
        localStorage.removeItem('star_matric_last_registered_student');
      }
    }
  } catch {}

  return {
    registrations: cleanRegs,
    foodPreferences: cleanFood,
    wallMessages: cleanWall,
    benchClaims: cleanBenches,
    gameScores: cleanScores,
    generatedCards: cleanCards,
    venueVotes: getItem<Record<string, number>>('venue_votes', {}),
    dateVotes: getItem<Record<string, number>>('date_votes', {}),
    extraPollVotes: getItem<Record<string, Record<string, number>>>('extra_poll_votes', {}),
    userVotes: getItem<string[]>('user_voted_polls', []),
    settings: (() => {
      const current = getItem<EventSettings>('event_settings', {
        locked_venue_id: null,
        locked_date_id: null,
        total_benches: 36,
        batch_name: REUNION_CONFIG.batchName,
        batch_year: REUNION_CONFIG.batchYear,
        organizer_name: REUNION_CONFIG.organizerName,
        announcement_notes: "Get ready for the biggest school reunion! Voting ends soon.",
        card_generator_enabled: true
      });
      // Synchronize batch if stale or outdated
      if (current.batch_year !== REUNION_CONFIG.batchYear || current.batch_name !== REUNION_CONFIG.batchName) {
        current.batch_year = REUNION_CONFIG.batchYear;
        current.batch_name = REUNION_CONFIG.batchName;
        current.organizer_name = REUNION_CONFIG.organizerName;
        setLocalStorageItem('event_settings', current);
      }
      return current;
    })()
  };
};

export const setLocalStorageItem = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(`star_matric_${key}`, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save to localStorage", err);
  }
};
