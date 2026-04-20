'use server';

import { supabaseAdmin } from '@/lib/supabase-server';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export async function createEvent(formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const description = (formData.get('description') as string) || '';
  const password = formData.get('password') as string;
  const startDate = formData.get('start_date') as string;
  const endDate = formData.get('end_date') as string;
  const organizationName = (formData.get('organization_name') as string)?.trim();
  const finalEventType = (formData.get('event_type') as string)?.trim();
  const location = (formData.get('location') as string)?.trim();
  const usernameFields = ['username', 'username_2', 'username_3', 'username_4', 'username_5'];
  const usernames = usernameFields
    .map((field) => (formData.get(field) as string)?.trim())
    .filter((value): value is string => Boolean(value));
  const uniqueUsernames = Array.from(new Set(usernames));

  if (!name || !password) {
    return { error: 'Event name and password are required' };
  }

  if (uniqueUsernames.length === 0) {
    return { error: 'At least one username is required' };
  }

  if (uniqueUsernames.length > 5) {
    return { error: 'You can only provide up to five usernames' };
  }

  if (!organizationName) {
    return { error: 'Organization is required' };
  }

  if (!location) {
    return { error: 'Event location is required' };
  }

  if (!finalEventType) {
    return { error: 'Event type is required' };
  }

  try {
    // Find or create organization
    let organizationId: string | null = null;

    const { data: existingOrganizations, error: organizationLookupError } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .eq('name', organizationName)
      .limit(1);

    if (organizationLookupError) throw organizationLookupError;

    if (existingOrganizations && existingOrganizations.length > 0) {
      organizationId = existingOrganizations[0].id;
    } else {
      const { data: newOrganization, error: createOrganizationError } = await supabaseAdmin
        .from('organizations')
        .insert({ name: organizationName })
        .select('id')
        .single();

      if (createOrganizationError) throw createOrganizationError;
      organizationId = newOrganization.id;
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    const { data, error } = await supabaseAdmin
      .from('events')
      .insert({
        organization_id: organizationId,
        name,
        description: description || null,
        username: uniqueUsernames[0],
        password_hash: passwordHash,
        start_date: startDate || null,
        end_date: endDate || null,
        location,
        event_type: finalEventType || null,
      })
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation more gracefully
      if (error.code === '23505' && error.message?.includes('username')) {
        throw new Error('This username is already in use. Please note: The same person can create multiple events, but there may be a database constraint. Please contact support if this persists.');
      }
      throw error;
    }

    if (uniqueUsernames.length) {
      const userRows = uniqueUsernames.map((username) => ({
        event_id: data.id,
        username,
      }));

      const { error: eventUsersError } = await supabaseAdmin.from('event_users').insert(userRows);
      if (eventUsersError) throw eventUsersError;
    }

    revalidatePath('/admin');
    return { success: true, event: data };
  } catch (error: any) {
    console.error('Error creating event:', error);
    return { error: error.message || 'Failed to create event' };
  }
}

export async function getEvents(organizationId?: string) {
  try {
    let query = supabaseAdmin
      .from('events')
      .select('*, organizations(name)')
      .order('created_at', { ascending: false });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function getEventById(eventId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('events')
      .select('*, organizations(name), event_users(username, id)')
      .eq('id', eventId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function verifyEventCredentials(
  username: string,
  password: string,
  eventId: string,
) {
  const cleanedUsername = username?.trim();
  if (!cleanedUsername || !password || !eventId) {
    return { valid: false, event: null };
  }

  try {
    const { data: event, error } = await supabaseAdmin
      .from('events')
      .select('*, event_users(username)')
      .eq('id', eventId)
      .single();

    if (error || !event) {
      return { valid: false, event: null, error: 'Invalid credentials' };
    }

    if (event.is_suspended) {
      return { valid: false, event: null, error: 'This event has been suspended by the administrator.' };
    }

    const allowedUsernames = [
      event.username,
      ...(event.event_users?.map((user: { username: string }) => user.username) ?? []),
    ].filter(Boolean);

    if (!allowedUsernames.includes(cleanedUsername)) {
      return { valid: false, event: null };
    }

    const isValid = await bcrypt.compare(password, event.password_hash);
    return { valid: isValid, event: isValid ? event : null };
  } catch (error: any) {
    console.error('Error verifying event credentials:', error);
    return { valid: false, event: null };
  }
}

export async function updateEvent(eventId: string, formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const description = (formData.get('description') as string) || '';
  const password = (formData.get('password') as string)?.trim();
  const startDate = formData.get('start_date') as string;
  const endDate = formData.get('end_date') as string;
  const organizationName = (formData.get('organization_name') as string)?.trim();
  const finalEventType = (formData.get('event_type') as string)?.trim();
  const location = (formData.get('location') as string)?.trim();

  const usernameFields = ['username', 'username_2', 'username_3', 'username_4', 'username_5'];
  const usernames = usernameFields
    .map((field) => (formData.get(field) as string)?.trim())
    .filter((value): value is string => Boolean(value));
  const uniqueUsernames = Array.from(new Set(usernames));

  if (!eventId) {
    return { error: 'Event ID is required' };
  }

  if (!name) {
    return { error: 'Event name is required' };
  }

  if (uniqueUsernames.length === 0) {
    return { error: 'At least one username is required' };
  }

  if (uniqueUsernames.length > 5) {
    return { error: 'You can only provide up to five usernames' };
  }

  if (!organizationName) {
    return { error: 'Organization is required' };
  }

  if (!location) {
    return { error: 'Event location is required' };
  }

  if (!finalEventType) {
    return { error: 'Event type is required' };
  }

  try {
    const { data: existingEvent, error: fetchError } = await supabaseAdmin
      .from('events')
      .select('id')
      .eq('id', eventId)
      .single();

    if (fetchError || !existingEvent) {
      return { error: 'Event not found' };
    }

    // Find or create organization
    let organizationId: string | null = null;

    const { data: existingOrganizations, error: organizationLookupError } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .eq('name', organizationName)
      .limit(1);

    if (organizationLookupError) throw organizationLookupError;

    if (existingOrganizations && existingOrganizations.length > 0) {
      organizationId = existingOrganizations[0].id;
    } else {
      const { data: newOrganization, error: createOrganizationError } = await supabaseAdmin
        .from('organizations')
        .insert({ name: organizationName })
        .select('id')
        .single();

      if (createOrganizationError) throw createOrganizationError;
      organizationId = newOrganization.id;
    }

    const updatePayload: Record<string, any> = {
      organization_id: organizationId,
      name,
      description: description || null,
      username: uniqueUsernames[0],
      start_date: startDate || null,
      end_date: endDate || null,
      location,
      event_type: finalEventType || null,
    };

    if (password) {
      updatePayload.password_hash = await bcrypt.hash(password, 10);
    }

    const { error: updateError } = await supabaseAdmin
      .from('events')
      .update(updatePayload)
      .eq('id', eventId);

    if (updateError) {
      // Handle unique constraint violation more gracefully
      if (updateError.code === '23505' && updateError.message?.includes('username')) {
        throw new Error('This username is already in use. Please note: The same person can create multiple events, but there may be a database constraint. Please contact support if this persists.');
      }
      throw updateError;
    }

    const { error: deleteUsersError } = await supabaseAdmin.from('event_users').delete().eq('event_id', eventId);
    if (deleteUsersError) throw deleteUsersError;

    const userRows = uniqueUsernames.map((username) => ({
      event_id: eventId,
      username,
    }));

    const { error: insertUsersError } = await supabaseAdmin.from('event_users').insert(userRows);
    if (insertUsersError) throw insertUsersError;

    revalidatePath('/admin');
    revalidatePath(`/admin/events/${eventId}/dashboard`);
    revalidatePath(`/admin/events/${eventId}/dashboard/settings`);

    return { success: true };
  } catch (error: any) {
    console.error('Error updating event:', error);
    return { error: error.message || 'Failed to update event' };
  }
}

export async function resetEventPassword(eventId: string, newPassword: string) {
  if (!eventId || !newPassword) {
    return { error: 'Event ID and new password are required' };
  }

  try {
    const passwordHash = await bcrypt.hash(newPassword, 10);

    const { error: updateError } = await supabaseAdmin
      .from('events')
      .update({ password_hash: passwordHash })
      .eq('id', eventId);

    if (updateError) throw updateError;
    return { success: true };
  } catch (error: any) {
    console.error('Error resetting event password:', error);
    return { error: error.message || 'Failed to reset password' };
  }
}

export async function deleteEvent(eventId: string) {
  if (!eventId) {
    return { error: 'Event ID is required' };
  }

  try {
    const { error } = await supabaseAdmin
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
    
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return { error: error.message || 'Failed to delete event' };
  }
}

export async function toggleEventSuspension(eventId: string, suspend: boolean) {
  if (!eventId) {
    return { error: 'Event ID is required' };
  }

  try {
    const { error } = await supabaseAdmin
      .from('events')
      .update({ is_suspended: suspend })
      .eq('id', eventId);

    if (error) throw error;
    
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('Error toggling event suspension:', error);
    return { error: error.message || 'Failed to update event status' };
  }
}

