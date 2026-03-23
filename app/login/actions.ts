'use server';

import { db } from '@/lib/server/db';
import { activityDb } from '@/lib/server/activity-db';
import { cookies } from 'next/headers';

export async function verifySiswaLogin(nisn: string, pin: string) {
  const user = db.getUserById(nisn, 'siswa');
  
  if (user && user.pin === pin) {
    (await cookies()).set('auth_session', 'true', { 
      path: '/', 
      maxAge: 2592000,
      httpOnly: false
    });

    // Log login activity for teacher dashboard
    try {
      activityDb.logActivity(nisn, user.name, 'login');
    } catch {
      // Don't block login on activity logging failure
    }

    return { success: true, name: user.name, role: 'siswa' };
  }
  return { success: false, error: 'NISN tidak ditemukan atau PIN salah.' };
}

export async function verifyGuruLogin(nik: string, pin: string) {
  const user = db.getUserById(nik, 'guru');
  
  if (user && user.pin === pin) {
    (await cookies()).set('auth_session', 'true', { 
      path: '/', 
      maxAge: 2592000,
      httpOnly: false
    });
    return { success: true, name: user.name, role: 'guru' };
  }
  return { success: false, error: 'NIK/NUPTK tidak ditemukan atau PIN salah.' };
}
