'use client';

import { useActionState, useEffect, useState } from 'react';
import { loginAdmin } from '../actions';
import { Button } from '@/components/ui/button';
import { Lock, Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminLogin() {
  const [state, formAction, isPending] = useActionState(loginAdmin, null);
  const [pin, setPin] = useState('');
  
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  if (!isClient) return null;

  return (
    <div className="min-h-[100dvh] w-full bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute top-0 right-1/4 w-[40rem] h-[40rem] bg-rose-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: '4s' }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-[40rem] h-[40rem] bg-orange-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: '6s' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-border/40 shadow-2xl overflow-hidden p-[1px]">
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl rounded-[calc(1.5rem-1px)] p-8 h-full">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-rose-100 dark:bg-rose-500/20 rounded-2xl">
                  <ShieldCheck className="w-8 h-8 text-rose-600 dark:text-rose-400" />
                </div>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-rose-600 to-orange-600 dark:from-rose-400 dark:to-orange-400 bg-clip-text text-transparent mb-2">
                Admin Area
              </h1>
              <p className="text-[14px] text-muted-foreground">
                Gunakan PIN administrator untuk masuk
              </p>
            </div>

            <form action={formAction} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wide uppercase text-muted-foreground ml-1">
                  PIN Akses
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -mt-[9px] text-muted-foreground/60 group-focus-within:text-rose-500 transition-colors">
                    <Lock className="size-[18px]" />
                  </div>
                  <input
                    type="password"
                    name="pin"
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="******"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-border/60 hover:border-rose-500/40 rounded-xl text-[14px] font-medium tracking-widest focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all placeholder:tracking-normal placeholder:font-normal"
                  />
                </div>
              </div>

              {state?.error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -5 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  className="py-1"
                >
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs text-red-600 dark:text-red-400 font-medium">
                    {state.error}
                  </div>
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={isPending || pin.length < 6}
                className="w-full mt-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 active:scale-[0.98] text-white shadow-[0_0_20px_rgba(244,63,94,0.2)] hover:shadow-[0_0_25px_rgba(244,63,94,0.4)] transition-all h-[46px] relative group overflow-hidden"
              >
                {isPending ? (
                  <Loader2 className="size-[18px] animate-spin relative z-10" />
                ) : (
                  <span className="font-semibold text-[15px] relative z-10">Otorisasi Akses</span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </motion.div>
      <div className="mt-12 text-xs text-muted-foreground/50 tracking-wide uppercase">
        Sistem Manajemen OpenMAIC
      </div>
    </div>
  );
}
