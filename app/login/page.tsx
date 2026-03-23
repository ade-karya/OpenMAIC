'use client';

import { useState, useEffect, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useAuthStore } from '@/lib/store/auth';
import { Button } from '@/components/ui/button';
import { ArrowRight, UserSquare2, Lock, Loader2, GraduationCap, Briefcase } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';function SiswaLoginForm() {
  const [nisn, setNisn] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const loginSiswa = useAuthStore((s) => s.loginSiswa);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await loginSiswa(nisn, pin);
      if (success) {
        router.push('/');
      } else {
        setError('NISN atau PIN salah. NISN harus 10 digit.');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat masuk.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold tracking-wide uppercase text-muted-foreground ml-1">
          NISN Siswa
        </label>
        <div className="relative group">
          <div className="absolute left-3.5 top-1/2 -mt-[9px] text-muted-foreground/60 group-focus-within:text-violet-500 transition-colors">
            <UserSquare2 className="size-[18px]" />
          </div>
          <input
            type="text"
            required
            value={nisn}
            onChange={(e) => setNisn(e.target.value.replace(/\D/g, ''))}
            placeholder="Masukkan 10 digit angka"
            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-border/60 hover:border-violet-500/40 rounded-xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all placeholder:font-normal"
            maxLength={10}
            inputMode="numeric"
          />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-muted-foreground/40 bg-muted px-1.5 py-0.5 rounded">
            {nisn.length}/10
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold tracking-wide uppercase text-muted-foreground ml-1">
          PIN
        </label>
        <div className="relative group">
          <div className="absolute left-3.5 top-1/2 -mt-[9px] text-muted-foreground/60 group-focus-within:text-violet-500 transition-colors">
            <Lock className="size-[18px]" />
          </div>
          <input
            type="password"
            required
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Min. 6 karakter"
            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-border/60 hover:border-violet-500/40 rounded-xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all placeholder:font-normal"
          />
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <div className="p-3 my-1 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs text-red-600 dark:text-red-400 font-medium">
            {error}
          </div>
        </motion.div>
      )}

      <Button
        type="submit"
        disabled={isLoading || nisn.length < 10 || pin.length < 6}
        className="w-full mt-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-[0_0_20px_rgba(124,58,237,0.2)] h-[46px] group"
      >
        {isLoading ? <Loader2 className="size-[18px] animate-spin" /> : (
          <div className="flex items-center gap-2">
            <span>Masuk Siswa</span>
            <ArrowRight className="size-[18px] group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </Button>
    </form>
  );
}

function GuruLoginForm() {
  const loginGuru = useAuthStore((s) => s.loginGuru);
  const [nik, setNik] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await loginGuru(nik, pin);
      if (res.success) {
        router.push('/');
      } else {
        setError(res.error || 'Terjadi kesalahan');
      }
    } catch (err) {
      setError('Terjadi kesalahan sistem');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold tracking-wide uppercase text-muted-foreground ml-1">
          NIK / NUPTK
        </label>
        <div className="relative group">
          <div className="absolute left-3.5 top-1/2 -mt-[9px] text-muted-foreground/60 group-focus-within:text-emerald-500 transition-colors">
            <UserSquare2 className="size-[18px]" />
          </div>
          <input
            type="text"
            required
            value={nik}
            onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
            placeholder="Masukkan NIK/NUPTK"
            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-border/60 hover:border-emerald-500/40 rounded-xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:font-normal"
            inputMode="numeric"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold tracking-wide uppercase text-muted-foreground ml-1">
          PIN
        </label>
        <div className="relative group">
          <div className="absolute left-3.5 top-1/2 -mt-[9px] text-muted-foreground/60 group-focus-within:text-emerald-500 transition-colors">
            <Lock className="size-[18px]" />
          </div>
          <input
            type="password"
            required
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Min. 6 karakter"
            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-border/60 hover:border-emerald-500/40 rounded-xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:font-normal"
          />
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <div className="p-3 my-1 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs text-red-600 dark:text-red-400 font-medium">
            {error}
          </div>
        </motion.div>
      )}

      <Button
        type="submit"
        disabled={isLoading || pin.length < 6 || nik.length < 5}
        className="w-full mt-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)] h-[46px] group"
      >
        {isLoading ? <Loader2 className="size-[18px] animate-spin" /> : (
          <div className="flex items-center gap-2">
            <span>Masuk Guru</span>
            <ArrowRight className="size-[18px] group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  const [isClient, setIsClient] = useState(false);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && isLoggedIn) {
      router.replace('/');
    }
  }, [isClient, isLoggedIn, router]);

  if (!isClient) return null; // Avoid Hydration Mismatch

  return (
    <div className="min-h-[100dvh] w-full bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: '4s' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[40rem] h-[40rem] bg-emerald-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: '6s' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-border/40 shadow-2xl overflow-hidden p-[1px]">
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl rounded-[calc(1.5rem-1px)] p-6 sm:p-8 h-full">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-violet-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                Pilih Akses Menu
              </h1>
              <p className="text-[14px] text-muted-foreground">
                Silahkan masuk sebagai Siswa atau Guru
              </p>
            </div>

            <Tabs defaultValue="siswa" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <TabsTrigger value="siswa" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm transition-all duration-300">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Siswa
                </TabsTrigger>
                <TabsTrigger value="guru" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm transition-all duration-300">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Guru
                </TabsTrigger>
              </TabsList>
              
              {/* Siswa */}
              <TabsContent value="siswa" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <SiswaLoginForm />
                </motion.div>
              </TabsContent>
              
              {/* Guru */}
              <TabsContent value="guru" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <GuruLoginForm />
                </motion.div>
              </TabsContent>
            </Tabs>

          </div>
        </div>
      </motion.div>
      <div className="mt-12 text-xs text-muted-foreground/50 tracking-wide uppercase font-medium">
        KELAS KECERDASAN ARTIFISIAL
      </div>
    </div>
  );
}
