import QRCode from 'qrcode';
import { supabaseAdmin } from './supabase-server';

export async function generateQRCode(
  payload: string,
  storageKey?: string,
): Promise<string> {
  try {
    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(payload, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    // Convert data URL to buffer
    const base64Data = qrDataUrl.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload to Supabase Storage
    const safeFileKey =
      storageKey?.replace(/[^a-zA-Z0-9_-]/g, '_') ||
      payload.replace(/[^a-zA-Z0-9_-]/g, '_') ||
      `participant_${Date.now()}`;
    const fileName = `${safeFileKey}_qr.png`;
    const { data, error } = await supabaseAdmin.storage
      .from('qr-codes')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (error) {
      throw new Error(`Failed to upload QR code: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('qr-codes')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

