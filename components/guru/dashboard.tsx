'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  BookOpen,
  Clock,
  Plus,
  BarChart3,
  Settings,
  Presentation,
  LogOut,
  LogIn,
  GraduationCap,
  Zap,
  TrendingUp,
  RefreshCw,
  Activity,
  Search,
  FlaskConical,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/auth';

// ─── Types ──────────────────────────────────────────────────────────────────

interface DashboardStats {
  registeredStudents: number;
  registeredTeachers: number;
  totalActivities: number;
  activitiesToday: number;
  loginsToday: number;
  quizzesToday: number;
  activeStudentsToday: number;
  uniqueStudentsAllTime: number;
}

interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  type: 'login' | 'classroom_join' | 'quiz_complete' | 'pbl_start' | 'classroom_create';
  metadata?: Record<string, unknown>;
  timestamp: string;
}

const ACTIVITY_CONFIG: Record<
  string,
  { icon: typeof LogIn; label: string; color: string; bg: string; border: string }
> = {
  login: {
    icon: LogIn,
    label: 'Login',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  classroom_join: {
    icon: BookOpen,
    label: 'Masuk Kelas',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  quiz_complete: {
    icon: GraduationCap,
    label: 'Selesai Kuis',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  pbl_start: {
    icon: FlaskConical,
    label: 'Mulai PBL',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  classroom_create: {
    icon: Plus,
    label: 'Buat Kelas',
    color: 'text-pink-600 dark:text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
  },
};

function formatRelativeTime(isoTime: string): string {
  const diff = Date.now() - new Date(isoTime).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Kemarin';
  if (days < 7) return `${days} hari lalu`;
  return new Date(isoTime).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getActivityDescription(item: ActivityItem): string {
  switch (item.type) {
    case 'login':
      return `${item.userName} masuk ke sistem`;
    case 'classroom_join': {
      const className = (item.metadata?.classroomName as string) || 'sebuah kelas';
      return `${item.userName} bergabung ke ${className}`;
    }
    case 'quiz_complete': {
      const score = item.metadata?.score;
      const total = item.metadata?.total;
      if (score !== undefined && total !== undefined) {
        return `${item.userName} menyelesaikan kuis (${score}/${total})`;
      }
      return `${item.userName} menyelesaikan kuis`;
    }
    case 'pbl_start':
      return `${item.userName} memulai sesi PBL`;
    case 'classroom_create':
      return `${item.userName} membuat kelas baru`;
    default:
      return `${item.userName} melakukan aktivitas`;
  }
}

// ─── Dashboard Component ───────────────────────────────────────────────────

export function GuruDashboard({ onEnterAi }: { onEnterAi?: () => void }) {
  const userId = useAuthStore((s) => s.userId);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const handleLogout = () => {
    // Navigate back to login
    router.replace('/login');
    // Small delay before clearing state so transition feels smooth
    // and doesn't instantly unmount before the route changes.
    setTimeout(() => {
      logout();
    }, 100);
  };

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [statsRes, activitiesRes] = await Promise.all([
        fetch('/api/activities?stats=true'),
        fetch('/api/activities?limit=100'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data || statsData);
      }
      if (activitiesRes.ok) {
        const actData = await activitiesRes.json();
        setActivities((actData.data?.activities) || []);
      }
    } catch {
      // Silently handle fetch error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const filteredActivities = searchQuery
    ? activities.filter(
        (a) =>
          a.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.userId.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : activities;

  const statCards = stats
    ? [
        {
          title: 'Siswa Terdaftar',
          value: stats.registeredStudents,
          icon: Users,
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-500/10',
          gradient: 'from-blue-500/20 to-blue-600/5',
        },
        {
          title: 'Aktivitas Hari Ini',
          value: stats.activitiesToday,
          icon: Zap,
          color: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-500/10',
          gradient: 'from-amber-500/20 to-amber-600/5',
        },
        {
          title: 'Login Hari Ini',
          value: stats.loginsToday,
          icon: TrendingUp,
          color: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-500/10',
          gradient: 'from-emerald-500/20 to-emerald-600/5',
        },
        {
          title: 'Kuis Hari Ini',
          value: stats.quizzesToday,
          icon: BarChart3,
          color: 'text-violet-600 dark:text-violet-400',
          bg: 'bg-violet-500/10',
          gradient: 'from-violet-500/20 to-violet-600/5',
        },
      ]
    : [];

  return (
    <div className="min-h-[100dvh] w-full bg-slate-50 dark:bg-slate-950 relative overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-violet-500/[0.07] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50rem] h-[50rem] bg-emerald-500/[0.07] rounded-full blur-[120px]" />
        <div className="absolute top-[40%] right-[20%] w-[30rem] h-[30rem] bg-blue-500/[0.05] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Dashboard Guru
                </h1>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  ID: {userId || 'N/A'}
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Online</span>
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="rounded-xl h-9 px-3 text-xs font-medium"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={handleLogout}
              variant="destructive"
              size="sm"
              className="rounded-xl shadow-lg shadow-red-500/20 h-9 px-3 text-xs font-medium"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Keluar
            </Button>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border/50 rounded-2xl p-5 animate-pulse"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 mb-3" />
                  <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                  <div className="h-8 w-14 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              ))
            : statCards.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    <div className="relative">
                      <div className={`p-2.5 rounded-xl ${stat.bg} w-fit mb-3`}>
                        <Icon className={`w-4.5 h-4.5 ${stat.color}`} />
                      </div>
                      <h3 className="text-xs font-medium text-muted-foreground mb-1">{stat.title}</h3>
                      <div className="text-2xl md:text-3xl font-bold font-sans tracking-tight">
                        {stat.value}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
        </motion.div>

        {/* Action & Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content — Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* CTA Banner */}
            <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl shadow-violet-500/20">
              <div className="absolute top-0 right-0 p-8 opacity-10 mix-blend-overlay">
                <Presentation className="w-36 h-36 rotate-12" />
              </div>
              <div className="relative z-10 max-w-lg">
                <h2 className="text-xl md:text-2xl font-bold mb-2">Buat Kelas Baru</h2>
                <p className="text-violet-100 mb-5 text-sm leading-relaxed">
                  Unggah materi PDF dan AI akan mengubahnya menjadi presentasi interaktif dengan kuis dan aktivitas pembelajaran.
                </p>
                <Button
                  onClick={onEnterAi}
                  variant="secondary"
                  size="sm"
                  className="rounded-xl h-10 px-5 text-violet-700 font-bold hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Akses AI Kelas
                </Button>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-violet-500/10">
                    <Activity className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="text-base font-bold">Semua Aktivitas Siswa</h3>
                  {activities.length > 0 && (
                    <span className="text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {activities.length}
                    </span>
                  )}
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                  <input
                    type="text"
                    placeholder="Cari siswa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 pr-3 rounded-lg border border-border/50 bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/30 w-36 md:w-48 transition-all"
                  />
                </div>
              </div>

              <div className="max-h-[500px] overflow-y-auto">
                {loading ? (
                  <div className="p-6 space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800" />
                        <div className="flex-1">
                          <div className="h-3 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-1.5" />
                          <div className="h-2.5 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredActivities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                      <Activity className="w-6 h-6 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground/60">
                      {searchQuery ? 'Tidak ada hasil ditemukan' : 'Belum ada aktivitas siswa'}
                    </p>
                    <p className="text-xs text-muted-foreground/40 mt-1">
                      {searchQuery
                        ? 'Coba kata kunci lain'
                        : 'Aktivitas akan muncul saat siswa login dan mengikuti kelas'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/30">
                    <AnimatePresence initial={false}>
                      {filteredActivities.map((item, i) => {
                        const config = ACTIVITY_CONFIG[item.type] || ACTIVITY_CONFIG.login;
                        const Icon = config.icon;

                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i < 20 ? i * 0.02 : 0 }}
                            className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                          >
                            <div
                              className={`w-9 h-9 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center shrink-0`}
                            >
                              <Icon className={`w-4 h-4 ${config.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground/90 leading-snug truncate">
                                {getActivityDescription(item)}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-muted-foreground/50 font-mono">
                                  {item.userId}
                                </span>
                                <span className="text-[10px] text-muted-foreground/30">•</span>
                                <span
                                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${config.bg} ${config.color}`}
                                >
                                  {config.label}
                                </span>
                              </div>
                            </div>
                            <span className="text-[11px] text-muted-foreground/50 shrink-0">
                              {formatRelativeTime(item.timestamp)}
                            </span>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Quick Summary */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border/50 rounded-2xl p-5">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-violet-500" />
                Ringkasan
              </h3>
              {stats ? (
                <div className="space-y-3">
                  <SummaryRow
                    label="Siswa Aktif Hari Ini"
                    value={stats.activeStudentsToday}
                    total={stats.registeredStudents}
                    color="emerald"
                  />
                  <SummaryRow
                    label="Total Siswa Tercatat"
                    value={stats.uniqueStudentsAllTime}
                    color="blue"
                  />
                  <SummaryRow
                    label="Guru Terdaftar"
                    value={stats.registeredTeachers}
                    color="violet"
                  />
                  <SummaryRow
                    label="Total Semua Aktivitas"
                    value={stats.totalActivities}
                    color="amber"
                  />
                </div>
              ) : (
                <div className="space-y-3 animate-pulse">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="h-3 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-5 w-10 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Active Students */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border/50 rounded-2xl p-5">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Siswa Terbaru Aktif
              </h3>
              {loading ? (
                <div className="space-y-3 animate-pulse">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                      <div className="flex-1">
                        <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded mb-1" />
                        <div className="h-2 w-14 bg-slate-200 dark:bg-slate-800 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (() => {
                // Get unique recent students
                const seen = new Set<string>();
                const recentStudents = activities
                  .filter((a) => {
                    if (seen.has(a.userId)) return false;
                    seen.add(a.userId);
                    return true;
                  })
                  .slice(0, 8);

                if (recentStudents.length === 0) {
                  return (
                    <p className="text-xs text-muted-foreground/50 text-center py-4">
                      Belum ada siswa aktif
                    </p>
                  );
                }

                return (
                  <div className="space-y-2">
                    {recentStudents.map((student, i) => (
                      <motion.div
                        key={student.userId}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.04 }}
                        className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group cursor-default"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                          {student.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{student.userName}</p>
                          <p className="text-[10px] text-muted-foreground/50 font-mono">
                            {student.userId}
                          </p>
                        </div>
                        <span className="text-[10px] text-muted-foreground/40 shrink-0">
                          {formatRelativeTime(student.timestamp)}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function SummaryRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total?: number;
  color: 'emerald' | 'blue' | 'violet' | 'amber';
}) {
  const colorMap = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    violet: 'bg-violet-500',
    amber: 'bg-amber-500',
  };

  const percentage = total && total > 0 ? Math.round((value / total) * 100) : null;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-bold tabular-nums">
          {value}
          {total !== undefined && (
            <span className="text-muted-foreground/50 font-normal text-xs">/{total}</span>
          )}
        </span>
      </div>
      {percentage !== null && (
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
            className={`h-full rounded-full ${colorMap[color]}`}
          />
        </div>
      )}
    </div>
  );
}
