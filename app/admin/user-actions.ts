'use server';

import { db, UserRole } from '@/lib/server/db';
import { revalidatePath } from 'next/cache';

export async function getUsers() {
  return db.getUsers();
}

export async function addUserAction(prevState: any, formData: FormData) {
  const nik = formData.get('id') as string;
  const name = formData.get('name') as string;
  const pin = formData.get('pin') as string;
  const role = formData.get('role') as UserRole;

  if (!nik || !name || !pin || !role || pin.length < 6) {
    return { error: 'Semua field wajib diisi dan PIN minimal 6 digit.' };
  }

  try {
    db.addUser({
      id: nik,
      name,
      role,
      pin,
    });
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Gagal menambahkan pengguna.' };
  }
}

export async function deleteUserAction(id: string, role: UserRole) {
  try {
    const success = db.deleteUser(id, role);
    if (success) {
      revalidatePath('/admin/dashboard');
      return { success: true };
    }
    return { error: 'Pengguna tidak ditemukan.' };
  } catch (err: any) {
    return { error: err.message || 'Gagal menghapus pengguna.' };
  }
}
