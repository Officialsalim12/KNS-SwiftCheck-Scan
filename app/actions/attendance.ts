'use server';

import { supabaseAdmin } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { sendCheckInEmail, sendCheckOutEmail } from '@/lib/email';

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

// Helper function to get event location(s)
async function getEventLocation(eventId: string): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('events')
      .select('location')
      .eq('id', eventId)
      .single();

    if (error) {
      console.error('Error fetching event location:', error);
      return null;
    }

    return data?.location || null;
  } catch (error) {
    console.error('Error in getEventLocation:', error);
    return null;
  }
}

// Dedicated check-in function
export async function checkIn(identifier: string) {
  try {
    const { participant, error } = await findParticipantByIdentifier(identifier);

    if (error || !participant) {
      return { error: error || 'Participant not found.' };
    }

    // Check if already checked in today
    const alreadyCheckedIn = await hasCheckedInToday(participant.id);
    if (alreadyCheckedIn) {
      return { error: 'You have already checked in today. Please check out first or wait until tomorrow.' };
    }

    // Check if this is first time check-in (no photo)
    const isFirstTime = !participant.photo_url;

    // Get event location for display
    const eventLocation = participant.event_id ? await getEventLocation(participant.event_id) : null;

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
      eventLocation,
    };
  } catch (error: any) {
    console.error('Error checking in:', error);
    return { error: error.message || 'Failed to check in' };
  }
}

// Process check-in with photo (first time)
export async function processCheckInWithPhoto(participantId: string, photoDataUrl: string, location?: string) {
  try {
    const cleanedId = participantId.trim();
    
    // Check if already checked in today
    const alreadyCheckedIn = await hasCheckedInToday(cleanedId);
    if (alreadyCheckedIn) {
      return { error: 'You have already checked in today. Please check out first or wait until tomorrow.' };
    }
    
    // Get participant info for email
    const { data: participant } = await supabaseAdmin
      .from('participants')
      .select('name, email, event_id')
      .eq('id', cleanedId)
      .single();
    
    // Upload photo
    const photoUrl = await uploadPhoto(cleanedId, photoDataUrl);

    // Update participant with photo URL
    const { error: updateError } = await supabaseAdmin
      .from('participants')
      .update({ photo_url: photoUrl })
      .eq('id', cleanedId);

    if (updateError) throw updateError;

    // Get event location if not provided
    let checkInLocation = location?.trim() || null;
    if (!checkInLocation && participant?.event_id) {
      checkInLocation = await getEventLocation(participant.event_id);
    }

    // Create check-in record with location
    const { error: checkinError } = await supabaseAdmin
      .from('attendance')
      .insert({
        participant_id: cleanedId,
        event_id: participant?.event_id || null,
        check_in_time: new Date().toISOString(),
        location: checkInLocation,
      });

    if (checkinError) throw checkinError;

    // Send email notification (don't fail if email fails)
    if (participant?.email && participant?.name) {
      sendCheckInEmail(participant.name, participant.email).catch((err) => {
        console.error('Failed to send check-in email:', err);
      });
    }

    // Revalidate attendance and dashboard pages
    revalidatePath('/admin/attendance');
    if (participant?.event_id) {
      revalidatePath(`/admin/events/${participant.event_id}/dashboard`);
    }
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
export async function processCheckInVerified(participantId: string, location?: string) {
  try {
    const cleanedId = participantId.trim();
    
    // Check if already checked in today
    const alreadyCheckedIn = await hasCheckedInToday(cleanedId);
    if (alreadyCheckedIn) {
      return { error: 'You have already checked in today. Please check out first or wait until tomorrow.' };
    }
    
    // Get participant info for email
    const { data: participant } = await supabaseAdmin
      .from('participants')
      .select('name, email, event_id')
      .eq('id', cleanedId)
      .single();

    // Get event location if not provided
    let checkInLocation = location?.trim() || null;
    if (!checkInLocation && participant?.event_id) {
      checkInLocation = await getEventLocation(participant.event_id);
    }

    // Create check-in record with location
    const { error: checkinError } = await supabaseAdmin
      .from('attendance')
      .insert({
        participant_id: cleanedId,
        event_id: participant?.event_id || null,
        check_in_time: new Date().toISOString(),
        location: checkInLocation,
      });

    if (checkinError) throw checkinError;

    // Send email notification (don't fail if email fails)
    if (participant?.email && participant?.name) {
      sendCheckInEmail(participant.name, participant.email).catch((err) => {
        console.error('Failed to send check-in email:', err);
      });
    }

    // Revalidate attendance and dashboard pages
    revalidatePath('/admin/attendance');
    if (participant?.event_id) {
      revalidatePath(`/admin/events/${participant.event_id}/dashboard`);
    }
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
    const { participant, error } = await findParticipantByIdentifier(identifier);

    if (error || !participant) {
      return { error: error || 'Participant not found.' };
    }

    const cleanedId = participant.id;

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
        .update({ check_out_time: new Date().toISOString() })
        .eq('id', latestCheckIn.id);

      if (checkoutError) throw checkoutError;

      // Send email notification (don't fail if email fails)
      if (participant.email && participant.name) {
        sendCheckOutEmail(participant.name, participant.email).catch((err) => {
          console.error('Failed to send check-out email:', err);
        });
      }

      // Revalidate attendance and dashboard pages
      revalidatePath('/admin/attendance');
      if (latestCheckIn.event_id) {
        revalidatePath(`/admin/events/${latestCheckIn.event_id}/dashboard`);
      }
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
          organization
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
