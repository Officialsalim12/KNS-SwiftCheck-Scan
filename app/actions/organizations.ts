'use server';

import { supabaseAdmin } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

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

export async function getOrganizations() {
  try {
    const { data, error } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

