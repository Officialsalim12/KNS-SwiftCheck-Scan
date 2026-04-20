'use server';

import { verifyAdmin, setAdminSession, clearAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const password = formData.get('password') as string;

  if (!password) {
    return { error: 'Password is required' };
  }

  const isValid = await verifyAdmin(password);
  
  if (!isValid) {
    return { error: 'Invalid password' };
  }

  await setAdminSession();
  redirect('/admin');
}

export async function logout() {
  await clearAdminSession();
  redirect('/register');
}

