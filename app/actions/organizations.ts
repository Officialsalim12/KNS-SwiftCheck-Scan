'use server';

import { supabaseAdmin } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { setOrgSession, clearOrgSession } from '@/lib/org-auth';
import { redirect } from 'next/navigation';

export async function createOrganization(formData: FormData) {
  const name = formData.get('name') as string;

  if (!name) {
    return { error: 'Organization name is required' };
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('organizations')
      .insert({ name })
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/admin');
    return { success: true, organization: data };
  } catch (error: any) {
    console.error('Error creating organization:', error);
    return { error: error.message || 'Failed to create organization' };
  }
}

export async function registerOrganization(formData: FormData) {
  const name = (formData.get('organization') as string)?.trim();
  const contactName = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;

  if (!name || !email || !password || !contactName) {
    return { error: 'All fields are required' };
  }

  try {
    // Check if organization or email already exists
    const { data: existingOrg } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .or(`name.eq."${name}",email.eq."${email}"`)
      .maybeSingle();

    if (existingOrg) {
      return { error: 'Organization name or email already registered' };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const { data, error } = await supabaseAdmin
      .from('organizations')
      .insert({
        name,
        contact_name: contactName,
        email,
        password_hash: passwordHash,
      })
      .select()
      .single();

    if (error) throw error;

    await setOrgSession(data.id, data.name, data.email);
    
    revalidatePath('/admin');
    return { success: true, organization: data };
  } catch (error: any) {
    console.error('Error registering organization:', error);
    return { error: error.message || 'Failed to register organization' };
  }
}

export async function loginOrganization(formData: FormData) {
  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  try {
    const { data: org, error } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error || !org) {
      return { error: 'Invalid email or password' };
    }

    const isValid = await bcrypt.compare(password, org.password_hash);
    if (!isValid) {
      return { error: 'Invalid email or password' };
    }

    await setOrgSession(org.id, org.name, org.email);
    
    // Redirect to a dashboard or main page
    // For now, let's assume they go to home or we can create an org dashboard
    return { success: true };
  } catch (error: any) {
    console.error('Error logging in organization:', error);
    return { error: error.message || 'Failed to login' };
  }
}

export async function logoutOrganization() {
  await clearOrgSession();
  redirect('/register');
}

