'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAdmin(prevState: any, formData: FormData) {
  const pin = formData.get('pin') as string;
  const ADMIN_PIN = process.env.ADMIN_PIN || '123456'; // Default PIN if not set

  if (pin === ADMIN_PIN) {
    (await cookies()).set('admin_session', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });
    redirect('/admin/dashboard');
  }

  return { error: 'Invalid PIN' };
}

export async function logoutAdmin() {
  (await cookies()).delete('admin_session');
  redirect('/admin/login');
}
