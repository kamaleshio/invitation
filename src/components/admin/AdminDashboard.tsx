import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Users, 
  Utensils, 
  MapPin, 
  MessageSquare, 
  Download, 
  Trash2, 
  EyeOff, 
  Eye, 
  Lock, 
  Unlock, 
  Search, 
  LogOut, 
  CheckCircle,
  FileSpreadsheet,
  Camera,
  Calendar,
  Sparkles,
  Edit,
  X,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  RefreshCw
} from 'lucide-react';
import { useReunionData } from '../../context/ReunionDataContext';
import { REUNION_CONFIG } from '../../config/reunionConfig';
import { sound } from '../../utils/soundEffects';
import type { Registration } from '../../types';

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const { 
    registrations, 
    foodPreferences, 
    wallMessages, 
    benchClaims, 
    generatedCards,
    venueVotes,
    dateVotes,
    stats, 
    settings, 
    lockVenue, 
    lockDate,
    updateRegistration,
    deleteRegistration,
    clearAllRegistrations,
    toggleHideMessage, 
    deleteMessage, 
    toggleCardGenerator,
    updateSettings,
    adminDbNotice,
    clearAdminDbNotice,
    refreshRegistrations,
    isLoadingRegistrations,
    registrationsError
  } = useReunionData();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Tab
  const [tab, setTab] = useState<'attendees' | 'cards' | 'food' | 'wall' | 'announcement'>('attendees');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Yes' | 'Maybe' | 'No'>('All');

  // Pagination State for Users Table
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Edit Registration Modal State
  const [editingReg, setEditingReg] = useState<Registration | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewPhotoUrl, setViewPhotoUrl] = useState<string | null>(null);

  // Auto-fetch fresh database records when admin logs in
  React.useEffect(() => {
    if (isAuthenticated) {
      refreshRegistrations();
    }
  }, [isAuthenticated, refreshRegistrations]);

  // Reset page to 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Announcement edit
  const [announcementNotes, setAnnouncementNotes] = useState(settings.announcement_notes || '');

  // Login Handler (Admin password: "krithik2007")
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'krithik2007') {
      sound.playCelebration();
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      sound.playPop();
      setAuthError('Invalid Admin credentials.');
    }
  };

  // Export Attendees to CSV
  const exportAttendeesCSV = () => {
    sound.playPop();
    const headers = ["ID", "Full Name", "Phone", "Email", "Batch", "Guests", "Attendance Status", "Registration Date"];
    const rows = registrations.map(r => [
      r.id,
      `"${r.name}"`,
      `"${r.phone}"`,
      `"${r.email || ''}"`,
      `"${r.batch}"`,
      r.guests,
      r.attendance_status,
      `"${new Date(r.created_at).toLocaleString()}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Star-Matric-Registrations-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Food Preferences to CSV
  const exportFoodCSV = () => {
    sound.playPop();
    const headers = ["ID", "Attendee Name", "Diet (Veg/Non-veg)", "Spice Level", "Guest Count", "Dietary Notes", "Created At"];
    const rows = foodPreferences.map(f => [
      f.id,
      `"${f.attendee_name}"`,
      f.diet,
      f.spice_level,
      f.guests_count,
      `"${(f.notes || '').replace(/"/g, '""')}"`,
      `"${new Date(f.created_at).toLocaleString()}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Star-Matric-Food-Orders-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReg) return;
    sound.playPop();
    await updateRegistration(editingReg.id, editingReg);
    setEditingReg(null);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    sound.playPop();
    await deleteRegistration(deletingId);
    setDeletingId(null);
  };

  const handleClearAllRegistrations = async () => {
    if (window.confirm("⚠️ Are you sure you want to clear all test registrations to start fresh for your real batchmates? This will reset attendee registrations, food orders, and bench claims.")) {
      sound.playPop();
      await clearAllRegistrations();
    }
  };

  // Filtered Attendees (search across name, phone, email, and batch)
  const filteredRegistrations = registrations.filter(r => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q ||
                         r.name.toLowerCase().includes(q) ||
                         r.phone.includes(q) ||
                         (r.email && r.email.toLowerCase().includes(q)) ||
                         r.batch.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || r.attendance_status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRegistrations.length / pageSize) || 1;
  const paginatedRegistrations = filteredRegistrations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ================= ADMIN LOGIN SCREEN (PHASE 13) =================
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#594337]/50 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full clay-card bg-white border-2 border-[#F0E1CE] p-8 space-y-6 text-center shadow-2xl"
        >
          <div className="w-16 h-16 rounded-full bg-[#FFF9E6] border border-[#E9B95B] text-[#594337] flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-8 h-8 text-[#E9B95B]" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-[#594337]">
              Reunion Organizer Portal
            </h3>
            <p className="text-xs text-[#8E725B]">
              Authorized administrator dashboard for {REUNION_CONFIG.schoolName}
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs font-semibold">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-[#594337] mb-1.5">
                Admin Password / PIN
              </label>
              <input
                type="password"
                required
                autoFocus
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#F0E1CE] text-sm font-medium text-[#594337] focus:outline-none focus:border-[#E9B95B]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-[20px] bg-[#E9B95B] hover:bg-[#DFAB48] text-sm font-bold text-[#594337] shadow-md transition"
            >
              SIGN IN TO ADMIN CONSOLE
            </button>
          </form>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="text-xs text-[#8E725B] hover:text-[#594337] font-medium underline"
            >
              &larr; Return to Public Website
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ================= ADMIN DASHBOARD (PHASE 14) =================
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#FFF5E8] text-[#594337] warm-grid-bg p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="clay-card bg-white/95 border border-[#F0E1CE] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FFF9E6] border border-[#E9B95B] text-xs font-bold text-[#594337] mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#E9B95B]" />
              <span>Organizer Administration Console</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#594337]">
              {REUNION_CONFIG.schoolName} — Admin Dashboard
            </h2>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={exportAttendeesCSV}
              className="px-4 py-2.5 rounded-[18px] bg-white border border-[#F0E1CE] hover:bg-[#FFF5E8] text-xs font-semibold text-[#594337] flex items-center space-x-1.5 shadow-sm transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-[18px] bg-white border border-[#F0E1CE] hover:bg-[#FFF5E8] text-xs font-semibold text-[#8E725B] hover:text-[#594337] flex items-center space-x-1.5 shadow-sm transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit Admin</span>
            </button>
          </div>
        </div>

        {/* Database & Supabase Diagnostics (Admin Only) */}
        <div className={`p-4 rounded-2xl border ${adminDbNotice ? 'bg-amber-50 border-amber-300' : 'bg-emerald-50 border-emerald-200'} flex items-start justify-between shadow-sm`}>
          <div className="flex items-start space-x-3">
            <span className="text-xl mt-0.5">{adminDbNotice ? '⚠️' : '🟢'}</span>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#594337] flex items-center space-x-2">
                <span>Database Sync Status (Admin Eyes Only)</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${adminDbNotice ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'}`}>
                  {adminDbNotice ? 'Notice Logged' : 'Healthy / Active'}
                </span>
              </div>
              <p className="text-xs text-[#594337] mt-1 font-medium">
                {adminDbNotice ? adminDbNotice : `All ${registrations.length} registrations are saved and active. Normal visitors never see database connection errors and are always confirmed smoothly.`}
              </p>
            </div>
          </div>
          {adminDbNotice && (
            <button
              onClick={clearAdminDbNotice}
              className="text-xs font-bold text-amber-800 hover:text-amber-950 underline ml-4 flex-shrink-0"
            >
              Dismiss
            </button>
          )}
        </div>

        {/* METRICS SUMMARY CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="clay-card bg-white/95 border border-[#F0E1CE] p-5 shadow-md">
            <span className="text-xs uppercase font-bold text-[#8E725B]">Registrations</span>
            <div className="text-3xl font-black text-[#594337] mt-1">{stats.totalRegistrations} / 60</div>
            <span className="text-[11px] text-[#D4A343] font-medium">
              {stats.spotsRemaining} spots available
            </span>
          </div>

          <div className="clay-card bg-white/95 border border-[#F0E1CE] p-5 shadow-md">
            <span className="text-xs uppercase font-bold text-[#8E725B]">Total Attending</span>
            <div className="text-3xl font-black text-[#594337] mt-1">{stats.totalAttending}</div>
            <span className="text-[11px] text-[#8E725B] font-medium">
              {stats.yesCount} classmates + {stats.totalGuests} guests
            </span>
          </div>

          <div className="clay-card bg-white/95 border border-[#F0E1CE] p-5 shadow-md">
            <span className="text-xs uppercase font-bold text-[#8E725B]">Reunion Schedule</span>
            <div className="text-xl sm:text-2xl font-black text-[#D4A343] mt-1">27 Dec 2026</div>
            <span className="text-[11px] text-[#8E725B] font-medium">
              10:00 AM IST • Confirmed
            </span>
          </div>

          <div className="clay-card bg-white/95 border border-[#F0E1CE] p-5 shadow-md">
            <span className="text-xs uppercase font-bold text-[#8E725B]">Memory Cards Created</span>
            <div className="text-3xl font-black text-[#D4A343] mt-1">{stats.totalCardsGenerated}</div>
            <span className="text-[11px] text-[#8E725B] font-medium">
              Personalized keepsakes downloaded
            </span>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-[#F0E1CE] space-x-2 overflow-x-auto pb-1">
          {[
            { id: 'attendees', name: 'Registrations', icon: Users },
            { id: 'cards', name: 'Memory Cards', icon: Camera },
            { id: 'food', name: 'Catering Orders', icon: Utensils },
            { id: 'wall', name: 'Sticky Notes', icon: MessageSquare },
            { id: 'announcement', name: 'Announcement', icon: Sparkles },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                sound.playPop();
                setTab(t.id as any);
              }}
              className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs sm:text-sm flex items-center space-x-2 transition border-b-2 ${
                tab === t.id
                  ? 'bg-white text-[#594337] border-[#E9B95B] shadow-sm'
                  : 'text-[#8E725B] hover:text-[#594337] border-transparent'
              }`}
            >
              <t.icon className="w-4 h-4" />
              <span>{t.name}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: REGISTRATIONS MANAGEMENT */}
        {tab === 'attendees' && (
          <div className="clay-card bg-white/95 border border-[#F0E1CE] p-6 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-grow max-w-md">
                <Search className="w-4 h-4 text-[#8E725B] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search by name, phone, or batch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#F0E1CE] text-xs font-medium text-[#594337] focus:outline-none focus:border-[#E9B95B]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#8E725B]">Status:</span>
                {(['All', 'Yes', 'Maybe', 'No'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                      statusFilter === s
                        ? 'bg-[#E9B95B] text-[#594337] border-[#D4A343]'
                        : 'bg-white text-[#594337] border-[#F0E1CE] hover:bg-[#FFF5E8]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
                <button
                  onClick={() => {
                    sound.playPop();
                    refreshRegistrations();
                  }}
                  disabled={isLoadingRegistrations}
                  title="Sync latest registered users from database"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-[#594337] border border-[#F0E1CE] hover:bg-[#FFF5E8] flex items-center space-x-1.5 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRegistrations ? 'animate-spin text-[#D4A343]' : 'text-[#8E725B]'}`} />
                  <span>{isLoadingRegistrations ? 'Syncing...' : 'Sync DB'}</span>
                </button>
                {registrations.length > 0 && (
                  <button
                    onClick={handleClearAllRegistrations}
                    title="Clear test data to launch live for real classmates"
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 flex items-center space-x-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset / Go Live</span>
                  </button>
                )}
              </div>
            </div>

            {/* Error banner if database fetch failed */}
            {registrationsError && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-xs font-medium flex items-center justify-between">
                <span>{registrationsError}</span>
                <button
                  onClick={() => refreshRegistrations()}
                  className="underline font-bold hover:text-amber-900 ml-2"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-[#F0E1CE]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-[#594337] font-bold uppercase tracking-wider border-b border-[#F0E1CE]">
                  <tr>
                    <th className="p-3.5">Photo</th>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Mobile</th>
                    <th className="p-3.5">Standard / Batch</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Guests</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Registered At</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E1CE] font-medium text-[#594337]">
                  {isLoadingRegistrations && registrations.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-[#8E725B]">
                        <div className="flex items-center justify-center space-x-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-[#D4A343]" />
                          <span>Loading registered users from database...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-6 text-center text-[#8E725B]">
                        {searchQuery || statusFilter !== 'All' 
                          ? 'No registrations match your search criteria.' 
                          : 'No registered users found in the database.'}
                      </td>
                    </tr>
                  ) : (
                    paginatedRegistrations.map((r) => (
                      <tr key={r.id} className="hover:bg-[#FFFDF9] transition">
                        <td className="p-3.5">
                          {r.photo_url ? (
                            <img
                              src={r.photo_url}
                              alt={r.name}
                              onClick={() => setViewPhotoUrl(r.photo_url || null)}
                              className="w-9 h-9 rounded-full object-cover border border-[#E9B95B] cursor-pointer hover:scale-110 transition shadow-sm"
                              title="Click to view full photo"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#FFF5E8] border border-[#F0E1CE] flex items-center justify-center text-xs font-bold text-[#8E725B]">
                              {r.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </td>
                        <td className="p-3.5 font-bold text-[#594337]">{r.name}</td>
                        <td className="p-3.5">
                          {r.email ? (
                            <span className="font-mono text-[#8E725B] text-[11px]">{r.email}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="p-3.5 font-mono text-[#8E725B]">{r.phone}</td>
                        <td className="p-3.5">{r.batch}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF5E8] text-[#594337] border border-[#F0E1CE]">
                            {(r as any).role || 'Alumni'}
                          </span>
                        </td>
                        <td className="p-3.5 text-[#D4A343] font-bold">+{r.guests}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            r.attendance_status === 'Yes' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                            r.attendance_status === 'Maybe' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                            'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            {r.attendance_status}
                          </span>
                        </td>
                        <td className="p-3.5 text-[11px] text-[#8E725B]">
                          {r.created_at ? new Date(r.created_at).toLocaleString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => setEditingReg(r)}
                            className="p-1.5 rounded-lg bg-white hover:bg-[#FFF5E8] text-[#594337] border border-[#F0E1CE] shadow-sm"
                            title="Edit Registration"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(r.id)}
                            className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-[#F0E1CE] shadow-sm"
                            title="Delete Registration"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredRegistrations.length > pageSize && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 px-1">
                <span className="text-xs text-[#8E725B]">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredRegistrations.length)} of {filteredRegistrations.length} registrations
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-xl border border-[#F0E1CE] bg-white text-xs font-semibold text-[#594337] disabled:opacity-40 hover:bg-[#FFF5E8] transition"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-bold text-[#594337] px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-xl border border-[#F0E1CE] bg-white text-xs font-semibold text-[#594337] disabled:opacity-40 hover:bg-[#FFF5E8] transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ANNOUNCEMENT MANAGEMENT */}
        {tab === 'announcement' && (
          <div className="clay-card bg-white/95 border border-[#F0E1CE] p-6 sm:p-8 max-w-2xl mx-auto space-y-5 shadow-xl">
            <h3 className="text-lg font-bold text-[#594337] pb-2 border-b border-[#F0E1CE]">
              Manage Official Announcement
            </h3>

            <div className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[#8E725B] mb-1">Announcement Message Note:</label>
                <textarea
                  rows={3}
                  value={announcementNotes}
                  onChange={(e) => setAnnouncementNotes(e.target.value)}
                  placeholder="e.g. Venue finalized! Bus transportation arrangements details coming soon..."
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#F0E1CE] text-xs font-medium text-[#594337] focus:outline-none focus:border-[#E9B95B]"
                />
              </div>

              <button
                onClick={() => {
                  sound.playPop();
                  updateSettings({ announcement_notes: announcementNotes });
                }}
                className="px-6 py-2.5 rounded-[18px] bg-[#E9B95B] hover:bg-[#DFAB48] text-xs font-bold text-[#594337] shadow-sm transition"
              >
                SAVE ANNOUNCEMENT NOTE
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: MEMORY CARDS MANAGEMENT */}
        {tab === 'cards' && (
          <div className="clay-card bg-white/95 border border-[#F0E1CE] p-6 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-[#F0E1CE] gap-2">
              <div>
                <h3 className="text-base font-bold text-[#594337]">
                  Personalized Memory Card Studio Management
                </h3>
                <p className="text-xs text-[#8E725B]">
                  Total Keepsake Downloads: <strong className="text-[#D4A343]">{stats.totalCardsGenerated}</strong> cards rendered
                </p>
              </div>

              <button
                onClick={() => toggleCardGenerator(!settings.card_generator_enabled)}
                className="px-4 py-2 rounded-xl bg-white border border-[#F0E1CE] text-xs font-semibold flex items-center space-x-2 text-[#594337] shadow-sm"
              >
                {settings.card_generator_enabled ? (
                  <>
                    <ToggleRight className="w-5 h-5 text-emerald-600" />
                    <span>Generator Enabled</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-5 h-5 text-rose-500" />
                    <span>Generator Disabled</span>
                  </>
                )}
              </button>
            </div>

            {/* Recent Cards List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8E725B]">
                Recent Generated Card Activity
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {generatedCards.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#F0E1CE] space-y-1 shadow-sm">
                    <div className="text-xs font-bold text-[#594337]">{c.studentName}</div>
                    <div className="text-[11px] text-[#8E725B]">
                      Template: <span className="font-bold text-[#D4A343] uppercase">{c.templateId}</span>
                    </div>
                    <div className="text-[10px] text-[#8E725B]">
                      Downloads: {c.downloadCount || 1} • {new Date(c.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CATERING / FOOD */}
        {tab === 'food' && (
          <div className="clay-card bg-white/95 border border-[#F0E1CE] p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0E1CE]">
              <h3 className="text-base font-bold text-[#594337]">
                Biryani & Catering Preference Roster
              </h3>
              <button
                onClick={exportFoodCSV}
                className="px-4 py-2 rounded-xl bg-white border border-[#F0E1CE] hover:bg-[#FFF5E8] text-xs font-semibold text-[#594337] flex items-center space-x-1.5 shadow-sm transition"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export Catering Orders</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[#F0E1CE]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-[#594337] font-bold uppercase tracking-wider border-b border-[#F0E1CE]">
                  <tr>
                    <th className="p-3.5">Attendee</th>
                    <th className="p-3.5">Diet</th>
                    <th className="p-3.5">Spice</th>
                    <th className="p-3.5">Guests</th>
                    <th className="p-3.5">Special Dietary Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E1CE] font-medium text-[#594337]">
                  {foodPreferences.map((f) => (
                    <tr key={f.id} className="hover:bg-[#FFFDF9]">
                      <td className="p-3.5 font-bold text-[#594337]">{f.attendee_name}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          f.diet === 'Veg' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}>
                          {f.diet}
                        </span>
                      </td>
                      <td className="p-3.5 text-[#8E725B]">{f.spice_level}</td>
                      <td className="p-3.5 text-[#D4A343] font-bold">+{f.guests_count}</td>
                      <td className="p-3.5 italic text-[#8E725B]">{f.notes || "None"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: WALL MESSAGES MODERATION */}
        {tab === 'wall' && (
          <div className="clay-card bg-white/95 border border-[#F0E1CE] p-6 space-y-6 shadow-xl">
            <h3 className="text-base font-bold text-[#594337] pb-3 border-b border-[#F0E1CE]">
              Message Wall Moderation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {wallMessages.map((m) => (
                <div key={m.id} className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#F0E1CE] space-y-2 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-[#594337]">
                      <span>{m.name}</span>
                      {m.hidden && <span className="text-[10px] text-rose-500 font-bold">(HIDDEN)</span>}
                    </div>
                    <p className="text-xs font-kalam text-[#8E725B] mt-1">"{m.message}"</p>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2 border-t border-[#F0E1CE]">
                    <button
                      onClick={() => toggleHideMessage(m.id, !m.hidden)}
                      className="p-1.5 rounded-lg bg-white border border-[#F0E1CE] text-xs"
                      title={m.hidden ? "Unhide" : "Hide"}
                    >
                      {m.hidden ? <Eye className="w-3.5 h-3.5 text-[#E9B95B]" /> : <EyeOff className="w-3.5 h-3.5 text-rose-500" />}
                    </button>
                    <button
                      onClick={() => deleteMessage(m.id)}
                      className="p-1.5 rounded-lg bg-white border border-[#F0E1CE] text-xs text-rose-500 hover:bg-rose-50"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* EDIT REGISTRATION MODAL */}
      <AnimatePresence>
        {editingReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#594337]/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full clay-card bg-white border-2 border-[#F0E1CE] p-6 space-y-4 shadow-2xl text-[#594337]"
            >
              <div className="flex justify-between items-center pb-2 border-b border-[#F0E1CE]">
                <h3 className="font-bold text-sm text-[#594337]">Edit Student Registration</h3>
                <button onClick={() => setEditingReg(null)} className="p-1 text-[#8E725B] hover:text-[#594337]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3 text-xs font-semibold">
                <div>
                  <label className="block text-[#8E725B] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editingReg.name}
                    onChange={(e) => setEditingReg({ ...editingReg, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#F0E1CE] text-xs font-medium text-[#594337] focus:outline-none focus:border-[#E9B95B]"
                  />
                </div>
                <div>
                  <label className="block text-[#8E725B] mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    value={editingReg.phone}
                    onChange={(e) => setEditingReg({ ...editingReg, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#F0E1CE] text-xs font-medium text-[#594337] focus:outline-none focus:border-[#E9B95B]"
                  />
                </div>
                <div>
                  <label className="block text-[#8E725B] mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editingReg.email || ''}
                    placeholder="student@example.com"
                    onChange={(e) => setEditingReg({ ...editingReg, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#F0E1CE] text-xs font-medium text-[#594337] focus:outline-none focus:border-[#E9B95B]"
                  />
                </div>
                <div>
                  <label className="block text-[#8E725B] mb-1">Batch / Section</label>
                  <input
                    type="text"
                    value={editingReg.batch}
                    onChange={(e) => setEditingReg({ ...editingReg, batch: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#F0E1CE] text-xs font-medium text-[#594337] focus:outline-none focus:border-[#E9B95B]"
                  />
                </div>
                <div>
                  <label className="block text-[#8E725B] mb-1">Attendance Status</label>
                  <select
                    value={editingReg.attendance_status}
                    onChange={(e) => setEditingReg({ ...editingReg, attendance_status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#F0E1CE] text-xs font-medium text-[#594337] focus:outline-none focus:border-[#E9B95B]"
                  >
                    <option value="Yes">Yes</option>
                    <option value="Maybe">Maybe</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingReg(null)}
                    className="px-4 py-2 rounded-xl bg-white border border-[#F0E1CE] text-xs font-medium text-[#8E725B] hover:bg-[#FFF5E8]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#E9B95B] hover:bg-[#DFAB48] text-xs font-bold text-[#594337] shadow-sm"
                  >
                    SAVE CHANGES
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#594337]/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-sm w-full clay-card bg-white border-2 border-[#F0E1CE] p-6 space-y-4 text-center shadow-2xl text-[#594337]"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 border border-rose-300 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-[#594337]">Delete Registration?</h3>
              <p className="text-xs text-[#8E725B]">
                Are you sure you want to remove this registration record? This action cannot be undone.
              </p>
              <div className="pt-2 flex justify-center space-x-2">
                <button
                  onClick={() => setDeletingId(null)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#F0E1CE] text-xs font-medium text-[#8E725B] hover:bg-[#FFF5E8]"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-5 py-2 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 shadow-sm transition"
                >
                  DELETE RECORD
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PHOTO PREVIEW MODAL */}
      <AnimatePresence>
        {viewPhotoUrl && (
          <div 
            onClick={() => setViewPhotoUrl(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full clay-card bg-white border-2 border-[#F0E1CE] p-4 space-y-3 shadow-2xl text-center"
            >
              <div className="flex justify-between items-center pb-2 border-b border-[#F0E1CE]">
                <h4 className="font-bold text-sm text-[#594337]">Student Photograph</h4>
                <button onClick={() => setViewPhotoUrl(null)} className="p-1 text-[#8E725B] hover:text-[#594337]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="rounded-xl overflow-hidden max-h-[70vh] flex items-center justify-center bg-[#FFF5E8]">
                <img
                  src={viewPhotoUrl}
                  alt="Student full preview"
                  className="w-full h-auto max-h-[65vh] object-contain rounded-lg"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
