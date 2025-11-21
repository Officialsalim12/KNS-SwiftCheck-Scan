'use server';

import { supabaseAdmin } from '@/lib/supabase-server';
import { generateQRCode } from '@/lib/qrcode';
import { revalidatePath } from 'next/cache';

export async function createParticipant(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const organization = formData.get('organization') as string;
  const eventId = formData.get('event_id') as string;
  const idNumber = (formData.get('id_number') as string)?.trim();
  const tableNumber = formData.get('table_number') as string;

  if (!name || !email) {
    return { error: 'Name and email are required' };
  }

  if (!eventId) {
    return { error: 'Event ID is required' };
  }

  if (!idNumber) {
    return { error: 'Participant ID number is required' };
  }

  try {
    const { data: existingIdentifier, error: identifierError } = await supabaseAdmin
      .from('participants')
      .select('id')
      .eq('id_number', idNumber)
      .maybeSingle();

    if (identifierError && identifierError.code !== 'PGRST116') {
      throw identifierError;
    }

    if (existingIdentifier) {
      return { error: 'ID number already in use. Please choose another.' };
    }

    // Insert participant
    const { data: participant, error: insertError } = await supabaseAdmin
      .from('participants')
      .insert({
        name,
        email,
        phone: phone || null,
        organization: organization || null,
        event_id: eventId,
        id_number: idNumber,
        table_number: tableNumber ? parseInt(tableNumber, 10) : null,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Generate and upload QR code (use ID number when available)
    const qrPayload = idNumber || participant.id;
    const qrCodeUrl = await generateQRCode(qrPayload, participant.id);

    // Update participant with QR code URL
    const { error: updateError } = await supabaseAdmin
      .from('participants')
      .update({ qr_code_url: qrCodeUrl })
      .eq('id', participant.id);

    if (updateError) {
      throw updateError;
    }

    revalidatePath(`/admin/events/${eventId}/dashboard/participants`);
    return { success: true, participant: { ...participant, qr_code_url: qrCodeUrl } };
  } catch (error: any) {
    console.error('Error creating participant:', error);
    return { error: error.message || 'Failed to create participant' };
  }
}

export async function getParticipants(eventId?: string) {
  try {
    let query = supabaseAdmin
      .from('participants')
      .select('*')
      .order('created_at', { ascending: false });

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

