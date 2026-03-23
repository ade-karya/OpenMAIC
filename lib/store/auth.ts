import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { verifySiswaLogin, verifyGuruLogin } from '@/app/login/actions';

export interface AuthState {
  isLoggedIn: boolean;
  userId: string | null;
  role: 'siswa' | 'guru' | null;
  loginSiswa: (nisn: string, pin: string) => Promise<{success: boolean, error?: string}>;
  loginGuru: (nik: string, pin: string) => Promise<{success: boolean, error?: string}>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      userId: null,
      role: null,
      loginSiswa: async (nisn: string, pin: string) => {
        const res = await verifySiswaLogin(nisn, pin);
        if (res.success) {
          set({ isLoggedIn: true, userId: nisn, role: 'siswa' });
          return { success: true };
        }
        return { success: false, error: res.error || 'Login gagal.' };
      },
      loginGuru: async (nik: string, pin: string) => {
        const res = await verifyGuruLogin(nik, pin);
        if (res.success) {
          set({ isLoggedIn: true, userId: nik, role: 'guru' });
          return { success: true };
        }
        return { success: false, error: res.error || 'Login gagal.' };
      },
      logout: () => {
        set({ isLoggedIn: false, userId: null, role: null });
        document.cookie = `auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `guru_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`; // clear legacy
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
