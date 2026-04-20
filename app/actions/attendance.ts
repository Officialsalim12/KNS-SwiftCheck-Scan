'use server';

import { supabaseAdmin } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { EventSession, getEventSession } from '@/app/actions/event-auth';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function findParticipantByIdentifier(identifier: string) {
  const cleanedIdentifier = identifier?.trim();

  if (!cleanedIdentifier) {
    return { participant: null, error: 'Please provide a valid QR code or ID number.' };
  }

  const tryFetch = async (column: 'id' | 'id_number', value: string) => {
    const { data, error } = await supabaseAdmin
      .from('participants')
      .select('*')
      .eq(column, value)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  };

  try {
    if (uuidRegex.test(cleanedIdentifier)) {
      const participant = await tryFetch('id', cleanedIdentifier);
      if (participant) {
        return { participant };
      }
    }

    const participantByIdNumber = await tryFetch('id_number', cleanedIdentifier);
    if (participantByIdNumber) {
      return { participant: participantByIdNumber };
    }

    // Final fallback: if identifier looked like UUID but participant not found, try again by ID number (already done)
    return {
      participant: null,
      error: 'No participant found for this QR code or ID number.',
    };
  } catch (error: any) {
    console.error('Participant lookup error:', error);
    return { participant: null, error: error.message || 'Failed to find participant' };
  }
}

type SessionContextResult =
  | {
      session: EventSession;
    }
  | { error: string };

type SessionLocationContextResult =
  | {
      session: EventSession;
      location: string;
    }
  | { error: string };

async function requireSessionContext(): Promise<SessionContextResult> {
  const session = await getEventSession();
  if (!session?.eventId || !session?.username) {
    return {
      error: 'Please log in to your event dashboard before recording attendance.',
    };
  }
  return { session };
}

async function requireSessionContextWithLocation(): Promise<SessionLocationContextResult> {
  const base = await requireSessionContext();
  if ('error' in base) {
    return base;
  }
  const location = base.session.location?.trim();
  if (!location) {
    return {
      error: 'Location not set for this session. Please log out and log back in with your station location.',
    };
  }
  return { session: base.session, location };
}

/**
 * Upload photo to Supabase Storage
 */
async function uploadPhoto(participantId: string, photoDataUrl: string): Promise<string> {
  try {
    // Convert data URL to buffer
    const base64Data = photoDataUrl.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload to Supabase Storage
    const fileName = `${participantId}_photo_${Date.now()}.jpg`;
    const { data, error } = await supabaseAdmin.storage
      .from('participant-photos')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload photo: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('participant-photos')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
}

// Helper function to check if participant has already checked in today
async function hasCheckedInToday(participantId: string): Promise<boolean> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabaseAdmin
      .from('attendance')
      .select('id')
      .eq('participant_id', participantId)
      .gte('check_in_time', today.toISOString())
      .lt('check_in_time', tomorrow.toISOString())
      .limit(1);

    if (error) {
      console.error('Error checking daily check-in:', error);
      return false;
    }

    return (data?.length ?? 0) > 0;
  } catch (error) {
    console.error('Error in hasCheckedInToday:', error);
    return false;
  }
}

// Dedicated check-in function
export async function checkIn(identifier: string) {
  try {
    const sessionContext = await requireSessionContextWithLocation();
    if ('error' in sessionContext) {
      return { error: sessionContext.error };
    }

    const { participant, error } = await findParticipantByIdentifier(identifier);

    if (error || !participant) {
      return { error: error || 'Participant not found.' };
    }

    if (participant.event_id && participant.event_id !== sessionContext.session.eventId) {
      return { error: 'This participant is not registered for your event.' };
    }

    // Check if already checked in today
    const alreadyCheckedIn = await hasCheckedInToday(participant.id);
    if (alreadyCheckedIn) {
      return { error: 'You have already checked in today. Please check out first or wait until tomorrow.' };
    }

    // Check if this is first time check-in (no photo)
    const isFirstTime = !participant.photo_url;

    // Return participant info for photo capture or verification
    return {
      needsPhoto: isFirstTime,
      needsVerification: !isFirstTime,
      participant: {
        id: participant.id,
        name: participant.name,
        email: participant.email,
        photo_url: participant.photo_url,
        event_id: participant.event_id,
      },
      eventLocation: sessionContext.location,
    };
  } catch (error: any) {
    console.error('Error checking in:', error);
    return { error: error.message || 'Failed to check in' };
  }
}

// Process check-in with photo (first time)
export async function processCheckInWithPhoto(participantId: string, photoDataUrl: string) {
  try {
    const sessionContext = await requireSessionContextWithLocation();
    if ('error' in sessionContext) {
      return { error: sessionContext.error };
    }

    const cleanedId = participantId.trim();
    
    // Check if already checked in today
    const alreadyCheckedIn = await hasCheckedInToday(cleanedId);
    if (alreadyCheckedIn) {
      return { error: 'You have already checked in today. Please check out first or wait until tomorrow.' };
    }
    
    // Get participant info
    const { data: participant } = await supabaseAdmin
      .from('participants')
      .select('name, email, event_id')
      .eq('id', cleanedId)
      .single();

    if (participant?.event_id && participant.event_id !== sessionContext.session.eventId) {
      return { error: 'This participant is not registered for your event.' };
    }
    
    // Upload photo
    const photoUrl = await uploadPhoto(cleanedId, photoDataUrl);

    // Update participant with photo URL
    const { error: updateError } = await supabaseAdmin
      .from('participants')
      .update({ photo_url: photoUrl })
      .eq('id', cleanedId);

    if (updateError) throw updateError;

    // Create check-in record with location
    const { error: checkinError } = await supabaseAdmin
      .from('attendance')
      .insert({
        participant_id: cleanedId,
        event_id: sessionContext.session.eventId,
        check_in_time: new Date().toISOString(),
        location: sessionContext.location,
      });

    if (checkinError) throw checkinError;

    // Revalidate attendance and dashboard pages
    revalidatePath('/admin/attendance');
    revalidatePath(`/admin/events/${sessionContext.session.eventId}/dashboard`);
    return { 
      success: true, 
      type: 'checkin',
      message: 'Checked in successfully with photo'
    };
  } catch (error: any) {
    console.error('Error processing check-in with photo:', error);
    return { error: error.message || 'Failed to process check-in' };
  }
}

// Process check-in after verification (subsequent check-ins)
export async function processCheckInVerified(participantId: string) {
  try {
    const sessionContext = await requireSessionContextWithLocation();
    if ('error' in sessionContext) {
      return { error: sessionContext.error };
    }

    const cleanedId = participantId.trim();
    
    // Check if already checked in today
    const alreadyCheckedIn = await hasCheckedInToday(cleanedId);
    if (alreadyCheckedIn) {
      return { error: 'You have already checked in today. Please check out first or wait until tomorrow.' };
    }
    
    // Get participant info
    const { data: participant } = await supabaseAdmin
      .from('participants')
      .select('name, email, event_id')
      .eq('id', cleanedId)
      .single();

    if (participant?.event_id && participant.event_id !== sessionContext.session.eventId) {
      return { error: 'This participant is not registered for your event.' };
    }

    // Create check-in record with location
    const { error: checkinError } = await supabaseAdmin
      .from('attendance')
      .insert({
        participant_id: cleanedId,
        event_id: sessionContext.session.eventId,
        check_in_time: new Date().toISOString(),
        location: sessionContext.location,
      });

    if (checkinError) throw checkinError;

    // Revalidate attendance and dashboard pages
    revalidatePath('/admin/attendance');
    revalidatePath(`/admin/events/${sessionContext.session.eventId}/dashboard`);
    return { 
      success: true, 
      type: 'checkin',
      message: 'Checked in successfully'
    };
  } catch (error: any) {
    console.error('Error processing verified check-in:', error);
    return { error: error.message || 'Failed to process check-in' };
  }
}

// Helper function to check if participant has already checked out today
async function hasCheckedOutToday(participantId: string): Promise<boolean> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabaseAdmin
      .from('attendance')
      .select('id')
      .eq('participant_id', participantId)
      .not('check_out_time', 'is', null)
      .gte('check_out_time', today.toISOString())
      .lt('check_out_time', tomorrow.toISOString())
      .limit(1);

    if (error) {
      console.error('Error checking daily check-out:', error);
      return false;
    }

    return (data?.length ?? 0) > 0;
  } catch (error) {
    console.error('Error in hasCheckedOutToday:', error);
    return false;
  }
}

// Dedicated check-out function
export async function checkOut(identifier: string) {
  try {
    const sessionContext = await requireSessionContextWithLocation();
    if ('error' in sessionContext) {
      return { error: sessionContext.error };
    }

    const { participant, error } = await findParticipantByIdentifier(identifier);

    if (error || !participant) {
      return { error: error || 'Participant not found.' };
    }

    const cleanedId = participant.id;

    if (participant.event_id && participant.event_id !== sessionContext.session.eventId) {
      return { error: 'This participant is not registered for your event.' };
    }

    // Check if already checked out today
    const alreadyCheckedOut = await hasCheckedOutToday(cleanedId);
    if (alreadyCheckedOut) {
      return { error: 'You have already checked out today. Please check in first or wait until tomorrow.' };
    }

    // Find the most recent check-in without a check-out
    const { data: latestCheckIn, error: attendanceError } = await supabaseAdmin
      .from('attendance')
      .select('*')
      .eq('participant_id', cleanedId)
      .eq('event_id', sessionContext.session.eventId)
      .is('check_out_time', null)
      .order('check_in_time', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (attendanceError) {
      console.error('Attendance query error:', attendanceError);
    }

    if (latestCheckIn) {
      // Update the latest check-in with check-out time
      const { error: checkoutError } = await supabaseAdmin
        .from('attendance')
        .update({
          check_out_time: new Date().toISOString(),
          checkout_location: sessionContext.location,
        })
        .eq('id', latestCheckIn.id);

      if (checkoutError) throw checkoutError;

      // Revalidate attendance and dashboard pages
      revalidatePath('/admin/attendance');
      revalidatePath(`/admin/events/${sessionContext.session.eventId}/dashboard`);
      return { 
        success: true, 
        type: 'checkout',
        participant: participant.name,
        message: 'Checked out successfully'
      };
    } else {
      return { 
        error: 'No active check-in found. Please check in first before checking out.'
      };
    }
  } catch (error: any) {
    console.error('Error checking out:', error);
    return { error: error.message || 'Failed to check out' };
  }
}

export async function getAttendanceLogs(eventId?: string) {
  try {
    let query = supabaseAdmin
      .from('attendance')
      .select(`
        *,
        participants (
          id,
          name,
          email,
          organization,
          id_number
        )
      `)
      .order('check_in_time', { ascending: false });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}
