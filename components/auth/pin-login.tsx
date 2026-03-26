'use client';

/**
 * PIN Login Screen
 *
 * Full-screen PIN entry with animated dots, numeric keypad,
 * and beautiful gradient branding.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Delete, LogIn } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { useI18n } from '@/lib/hooks/use-i18n';

const PIN_LENGTH = 4;

export function PinLogin() {
  const { t } = useI18n();
  const login = useAuthStore((s) => s.login);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus container for keyboard input
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const appendDigit = useCallback(
    (digit: string) => {
      if (loading) return;
      setError('');
      setPin((prev) => {
        if (prev.length >= PIN_LENGTH) return prev;
        return prev + digit;
      });
    },
    [loading],
  );

  const removeDigit = useCallback(() => {
    if (loading) return;
    setPin((prev) => prev.slice(0, -1));
    setError('');
  }, [loading]);

  const handleSubmit = useCallback(async () => {
    if (pin.length !== PIN_LENGTH || loading) return;
    setLoading(true);
    setError('');

    const result = await login(pin);
    if (!result.success) {
      setShake(true);
      setError(result.error || 'PIN salah');
      setPin('');
      setTimeout(() => setShake(false), 500);
    }
    setLoading(false);
  }, [pin, loading, login]);

  // Auto-submit when PIN is complete
  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      const timer = setTimeout(() => handleSubmit(), 200);
      return () => clearTimeout(timer);
    }
  }, [pin, handleSubmit]);

  // Keyboard support
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        appendDigit(e.key);
      } else if (e.key === 'Backspace') {
        removeDigit();
      } else if (e.key === 'Enter') {
        handleSubmit();
      }
    },
    [appendDigit, removeDigit, handleSubmit],
  );

  const numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 focus:outline-none"
    >
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-500/8 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: '5s' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/8 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: '7s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: '9s' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center px-6"
      >
        {/* Lock icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
          className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 backdrop-blur-xl"
        >
          <Lock className="size-8 text-violet-400" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-white mb-1"
        >
          Masukkan PIN
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-slate-400 mb-8"
        >
          Masukkan PIN 4 digit untuk masuk
        </motion.p>

        {/* PIN dots */}
        <motion.div
          animate={shake ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex gap-4 mb-8"
        >
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <motion.div
              key={i}
              className="relative"
              initial={false}
            >
              <div
                className={`size-4 rounded-full transition-all duration-200 ${
                  i < pin.length
                    ? 'bg-violet-400 shadow-lg shadow-violet-500/40 scale-110'
                    : 'bg-slate-700 border-2 border-slate-600'
                }`}
              />
              <AnimatePresence>
                {i < pin.length && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.8, opacity: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 rounded-full bg-violet-400"
                  />
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -5, height: 0 }}
              className="text-sm text-red-400 mb-4 text-center"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Numpad */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-3 w-[280px]"
        >
          {numpadKeys.map((key, i) => {
            if (key === '') {
              return <div key={i} />;
            }

            if (key === 'del') {
              return (
                <button
                  key={i}
                  onClick={removeDigit}
                  disabled={loading || pin.length === 0}
                  className="h-14 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 active:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Delete className="size-5" />
                </button>
              );
            }

            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.92 }}
                onClick={() => appendDigit(key)}
                disabled={loading || pin.length >= PIN_LENGTH}
                className="h-14 rounded-xl text-xl font-semibold text-white bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/5 hover:border-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm"
              >
                {key}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Loading indicator */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6 flex items-center gap-2 text-sm text-slate-400"
            >
              <div className="size-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
              Memverifikasi...
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
