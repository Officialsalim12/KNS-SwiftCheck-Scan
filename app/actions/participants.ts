'use server';

import { supabaseAdmin } from '@/lib/supabase-server';
import { generateQRCode } from '@/lib/qrcode';
import { revalidatePath } from 'next/cache';
import Papa from 'papaparse';

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

export async function bulkCreateParticipantsFromFile(
  fileContent: string,
  fileName: string,
  eventId: string,
  showTableNumber: boolean = false
) {
  try {
    if (!eventId) {
      return { error: 'Event ID is required' };
    }

    const fileExtension = fileName.toLowerCase().split('.').pop();
    let rows: Array<{
      name?: string;
      email?: string;
      id_number?: string;
      phone?: string;
      organization?: string;
      table_number?: string;
    }> = [];

    // Create a mapping function to normalize header names (shared for CSV and XLSX)
    const normalizeHeader = (header: string): string => {
      if (!header) return '';
      // Remove special characters and normalize spaces/underscores
      const cleaned = header.replace(/[^\w\s]/g, ' ').trim();
      const normalized = cleaned.toLowerCase().replace(/[_\s]+/g, ' ').trim();
      
      // Handle common variations for name (must check first before ID number)
      // Exclude school names, organization names, etc.
      if (normalized.includes('name') 
          && !normalized.includes('id') 
          && !normalized.includes('number') 
          && !normalized.includes('user')
          && !normalized.includes('table')
          && !normalized.includes('school')
          && !normalized.includes('organization')
          && !normalized.includes('company')
          && !normalized.includes('secondary')) {
        return 'name';
      }
      
      // Handle email variations
      if (normalized.includes('email') || normalized === 'e-mail' || normalized === 'e mail' || normalized === 'mail') {
        return 'email';
      }
      
      // Handle ID number variations (check after name to avoid conflicts)
      // Check for "student_id", "student id" first (common in educational contexts)
      if (normalized.includes('student') && normalized.includes('id')) {
        return 'id_number';
      }
      // Check for "id number", "id num", "idnumber", or just "id" (but not "user id" or "participant id" as those might be different)
      if (normalized.includes('id') && (normalized.includes('number') || normalized.includes('num'))) {
        return 'id_number';
      }
      if (normalized === 'id' || normalized === 'idnumber' || normalized === 'id num' || normalized === 'student_id') {
        return 'id_number';
      }
      if (normalized === 'participant id' || normalized === 'employee id' || normalized === 'staff id') {
        return 'id_number';
      }
      
      // Handle phone variations
      if (normalized.includes('phone') || normalized.includes('mobile') || normalized.includes('tel') || normalized.includes('contact')) {
        return 'phone';
      }
      
      // Handle organization variations
      if (normalized.includes('organization') || normalized.includes('org') || normalized.includes('company') || normalized.includes('department')) {
        return 'organization';
      }
      
      // Handle table number
      if ((normalized.includes('table') && normalized.includes('number')) || normalized === 'table' || normalized === 'table num') {
        return 'table_number';
      }
      
      // Return normalized version if no match (replace spaces with underscores)
      return normalized.replace(/\s+/g, '_');
    };

    // Parse based on file type
    if (fileExtension === 'csv') {
      // Parse CSV content with raw headers first
      const parseResult = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => {
          // Normalize header using the same function as XLSX
          return normalizeHeader(header);
        },
      });

      if (parseResult.errors.length > 0) {
        return { error: `CSV parsing error: ${parseResult.errors[0].message}` };
      }

      // Convert to array of objects with normalized headers
      // Filter out completely empty rows and ensure all values are strings
      rows = (parseResult.data as any[]).map((row: any) => {
        const cleanedRow: any = {};
        Object.keys(row).forEach(key => {
          const value = row[key];
          if (value !== undefined && value !== null) {
            cleanedRow[key] = String(value).trim();
          } else {
            cleanedRow[key] = '';
          }
        });
        return cleanedRow;
      }).filter((row: any) => {
        // Filter out completely empty rows
        return Object.values(row).some((val: any) => val && String(val).trim());
      });
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      // Parse XLSX content - convert base64 back to buffer
      const xlsxModule = await import('xlsx');
      const XLSX = xlsxModule.default || xlsxModule;
      
      // Convert base64 string back to buffer
      const binaryString = atob(fileContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const buffer = Buffer.from(bytes);
      
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with header row
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
      }) as any[][];

      if (jsonData.length === 0) {
        return { error: 'Excel file is empty or has no valid data' };
      }

      // Find header row (first non-empty row or row 0)
      let headerRowIndex = 0;
      for (let i = 0; i < Math.min(5, jsonData.length); i++) {
        const row = jsonData[i] as any[];
        const rowText = row.map((cell: any) => String(cell || '').toLowerCase().trim()).join(' ');
        // Check if this row looks like headers (contains common header words)
        if (rowText.includes('name') || rowText.includes('email') || rowText.includes('id')) {
          headerRowIndex = i;
          break;
        }
      }

      // Get headers from the identified header row
      const rawHeaders = (jsonData[headerRowIndex] as any[]).map((h: any) => 
        String(h || '').trim()
      );

      // Use the shared normalizeHeader function defined above

      // Map headers to normalized names
      // Use a Map to track which fields we've already assigned (to avoid overwriting with duplicates)
      const headerMap = new Map<number, string>();
      const assignedFields = new Set<string>(); // Track which normalized fields we've already assigned
      
      rawHeaders.forEach((rawHeader, index) => {
        if (rawHeader) {
          const normalized = normalizeHeader(rawHeader);
          // Only assign if this normalized field hasn't been assigned yet, OR if it's a non-critical field
          // For critical fields (name, email, id_number), use the first occurrence only
          const isCriticalField = normalized === 'name' || normalized === 'email' || normalized === 'id_number';
          if (!isCriticalField || !assignedFields.has(normalized)) {
            headerMap.set(index, normalized);
            if (isCriticalField) {
              assignedFields.add(normalized);
            }
          } else if (isCriticalField && assignedFields.has(normalized)) {
            // Skip this duplicate critical field - we already have the first one
            console.log(`Skipping duplicate critical field "${normalized}" at column ${index + 1} (${rawHeader})`);
          }
        }
      });

      // Convert rows to objects using normalized headers (skip header row)
      rows = jsonData.slice(headerRowIndex + 1).map((row: any[]) => {
        const rowObj: any = {};
        headerMap.forEach((normalizedHeader, index) => {
          const cellValue = row[index];
          if (cellValue !== undefined && cellValue !== null) {
            // Convert to string and trim - include empty strings too
            const value = String(cellValue).trim();
            rowObj[normalizedHeader] = value;
          } else {
            rowObj[normalizedHeader] = '';
          }
        });
        return rowObj;
      }).filter((row: any) => {
        // Filter out completely empty rows (all values are empty)
        return Object.values(row).some((val: any) => val && String(val).trim());
      });

    } else {
      return { error: 'Unsupported file format. Please upload a CSV or XLSX file.' };
    }

    if (rows.length === 0) {
      return { error: 'File is empty or has no valid data' };
    }

    // Debug: Log first row to help diagnose issues
    if (rows.length > 0) {
      console.log('First parsed row sample:', JSON.stringify(rows[0], null, 2));
      console.log('All keys in first row:', Object.keys(rows[0]));
    }

    const results = {
      success: 0,
      updated: 0,
      failed: 0,
      errors: [] as string[],
      participants: [] as any[],
    };

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 because header is row 1, and arrays are 0-indexed

      // Skip completely empty rows
      const hasAnyData = Object.values(row).some((val: any) => val && String(val).trim());
      if (!hasAnyData) {
        continue;
      }

      // Get values using normalized field names (from header mapping)
      // Try multiple possible field names to be more flexible
      let name = (row.name || '').toString().trim();
      let email = (row.email || '').toString().trim();
      // Check for id_number, student_id, idnumber, id (in that order of preference)
      let idNumber = (row.id_number || row.student_id || row.idnumber || row.id || '').toString().trim();
      
      // Fallback: if fields are empty, try to find them by searching all keys (case-insensitive)
      if (!name) {
        const nameKey = Object.keys(row).find(key => {
          const lower = key.toLowerCase();
          return lower.includes('name') && 
                 !lower.includes('id') && 
                 !lower.includes('number') &&
                 !lower.includes('school'); // Exclude "Name of Secondary School Attended"
        });
        if (nameKey) name = String(row[nameKey] || '').trim();
      }
      
      if (!email) {
        const emailKey = Object.keys(row).find(key => 
          key.toLowerCase().includes('email') || key.toLowerCase().includes('mail')
        );
        if (emailKey) email = String(row[emailKey] || '').trim();
      }
      
      if (!idNumber) {
        const idKey = Object.keys(row).find(key => {
          const lower = key.toLowerCase();
          return (lower.includes('student') && lower.includes('id')) ||
                 (lower.includes('id') && (lower.includes('number') || lower.includes('num'))) ||
                 lower === 'id' || lower === 'idnumber' || lower === 'student_id';
        });
        if (idKey) idNumber = String(row[idKey] || '').trim();
      }

      // Validate required fields - check if they're actually empty (not just whitespace)
      const hasName = name && name.length > 0;
      const hasEmail = email && email.length > 0;
      const hasIdNumber = idNumber && idNumber.length > 0;

      if (!hasName || !hasEmail || !hasIdNumber) {
        results.failed++;
        const missingFields = [];
        if (!hasName) missingFields.push('name');
        if (!hasEmail) missingFields.push('email');
        if (!hasIdNumber) missingFields.push('id_number');
        
        // Show what fields were actually found and their values (first 50 chars)
        const foundFields = Object.keys(row).map(key => {
          const val = String(row[key] || '').trim();
          return `${key}: "${val.substring(0, 50)}${val.length > 50 ? '...' : ''}"`;
        }).join(', ');
        
        results.errors.push(
          `Row ${rowNum}: Missing required fields: ${missingFields.join(', ')}. Available fields in row: ${foundFields}`
        );
        continue;
      }

      // Use normalized values - only use fields that were actually found in the file
      const nameValue = name;
      const emailValue = email;
      const idNumberValue = idNumber;
      
      // Only extract optional fields if they exist in the row (were found in headers)
      const phoneValue = row.phone ? String(row.phone).trim() : null;
      const organizationValue = row.organization ? String(row.organization).trim() : null;
      const tableNumber = showTableNumber && row.table_number
        ? (() => {
            const value = String(row.table_number).trim();
            const parsed = parseInt(value, 10);
            return isNaN(parsed) ? null : parsed;
          })()
        : null;

      // Check if participant already exists for this event
      // First check by ID number, then by email (in the same event only)
      // This prevents duplicate email errors within the same event
      let existingParticipant = null;
      
      // First check by ID number (exact match only)
      if (idNumberValue) {
        const { data: byId } = await supabaseAdmin
          .from('participants')
          .select('id, name, email, phone, organization, table_number, qr_code_url, id_number')
          .eq('event_id', eventId)
          .eq('id_number', idNumberValue.trim())
          .maybeSingle();
        if (byId) {
          existingParticipant = byId;
        }
      }
      
      // Don't check by email - allow same email for different participants
      // Participants are identified by their ID number, not email

      try {
        let participant: any;
        let isUpdate = false;

        // Debug: Log if participant is found (log all to help debug)
        if (existingParticipant) {
          console.log(`Row ${rowNum}: ✓ Found EXISTING participant - ID: "${existingParticipant.id_number}", Email: "${existingParticipant.email}" - Will UPDATE`);
        } else {
          console.log(`Row ${rowNum}: ✗ No existing participant found - Will CREATE NEW. ID: "${idNumberValue}", Email: "${emailValue}"`);
        }

        if (existingParticipant) {
          // Update existing participant - only update fields that have new values
          isUpdate = true;
          const updateData: any = {};

          // Always update name and email if provided and different
          if (nameValue && existingParticipant.name !== nameValue) {
            updateData.name = nameValue;
          }
          if (emailValue && existingParticipant.email !== emailValue) {
            updateData.email = emailValue;
          }
          
          // Update ID number if it's missing or different
          if (idNumberValue && (!existingParticipant.id_number || existingParticipant.id_number.trim() !== idNumberValue.trim())) {
            updateData.id_number = idNumberValue;
          }
          
          // Update optional fields only if they have values in the file and are different
          if (phoneValue && existingParticipant.phone !== phoneValue) {
            updateData.phone = phoneValue;
          }
          if (organizationValue && existingParticipant.organization !== organizationValue) {
            updateData.organization = organizationValue;
          }
          if (tableNumber !== null && existingParticipant.table_number !== tableNumber) {
            updateData.table_number = tableNumber;
          }

          // Only update if there are changes
          if (Object.keys(updateData).length > 0) {
            const { data: updatedParticipant, error: updateError } = await supabaseAdmin
              .from('participants')
              .update(updateData)
              .eq('id', existingParticipant.id)
              .select()
              .single();

            if (updateError) {
              results.failed++;
              results.errors.push(`Row ${rowNum}: Failed to update participant - ${updateError.message}`);
              continue;
            }

            participant = updatedParticipant;
          } else {
            // No changes needed, use existing participant
            // But still check if QR code needs to be generated
            participant = existingParticipant;
          }

          // Regenerate QR code if it doesn't exist or if ID number changed
          const needsQRCode = !participant.qr_code_url || 
            (idNumberValue && existingParticipant.id_number && 
             existingParticipant.id_number.trim() !== idNumberValue.trim());
          
          if (needsQRCode) {
            const qrPayload = idNumberValue || participant.id;
            const qrCodeUrl = await generateQRCode(qrPayload, participant.id);

            const { error: qrUpdateError } = await supabaseAdmin
              .from('participants')
              .update({ qr_code_url: qrCodeUrl })
              .eq('id', participant.id);

            if (qrUpdateError) {
              results.failed++;
              results.errors.push(`Row ${rowNum}: Failed to generate QR code for updated participant`);
              continue;
            }

            participant.qr_code_url = qrCodeUrl;
          }
        } else {
          // No existing participant found - CREATE NEW ONE
          console.log(`Row ${rowNum}: Creating NEW participant - ID: "${idNumberValue}", Email: "${emailValue}", Name: "${nameValue}"`);
          
          // Build insert object with only fields that have values (only use found fields)
          // Allow same email for different participants - they're identified by ID number
          const insertData: any = {
            name: nameValue,
            email: emailValue,
            event_id: eventId,
            id_number: idNumberValue,
          };

          // Only add optional fields if they were found in the file and have values
          if (phoneValue) {
            insertData.phone = phoneValue;
          }
          if (organizationValue) {
            insertData.organization = organizationValue;
          }
          if (tableNumber !== null) {
            insertData.table_number = tableNumber;
          }

          // Insert participant
          console.log(`Row ${rowNum}: ========== STARTING INSERT ==========`);
          console.log(`Row ${rowNum}: Insert data:`, JSON.stringify(insertData, null, 2));
          
          let newParticipant: any = null;
          let insertError: any = null;
          
          try {
            const result = await supabaseAdmin
              .from('participants')
              .insert(insertData)
              .select()
              .single();
            
            newParticipant = result.data;
            insertError = result.error;
            
            console.log(`Row ${rowNum}: Insert result - data:`, newParticipant ? `Found participant ID: ${newParticipant.id}` : 'null');
            console.log(`Row ${rowNum}: Insert result - error:`, insertError ? `${insertError.message} (code: ${insertError.code})` : 'null');
          } catch (err: any) {
            console.error(`Row ${rowNum}: ✗ Exception during insert:`, err);
            insertError = err;
          }
          
          // Log the result and handle accordingly
          if (insertError) {
            console.log(`Row ${rowNum}: ✗ Insert FAILED - Error: ${insertError.message}, Code: ${insertError.code}`);
            console.log(`Row ${rowNum}: ✗ Full error object:`, JSON.stringify(insertError, null, 2));
            // If it's a duplicate error, try to find and update the existing participant
            if (insertError.code === '23505' || insertError.message?.includes('duplicate') || insertError.message?.includes('unique')) {
              console.log(`Row ${rowNum}: Duplicate error detected, searching for existing participant...`);
              // Duplicate detected - try to find the existing participant
              // First search in current event, then search across all events
              let duplicateParticipant = null;
              
              // Search in current event first
              if (idNumberValue) {
                const { data: dupById } = await supabaseAdmin
                  .from('participants')
                  .select('id, name, email, phone, organization, table_number, qr_code_url, id_number, event_id')
                  .eq('event_id', eventId)
                  .ilike('id_number', idNumberValue.trim())
                  .maybeSingle();
                if (dupById) duplicateParticipant = dupById;
              }
              
              if (!duplicateParticipant && emailValue) {
                const { data: dupByEmail } = await supabaseAdmin
                  .from('participants')
                  .select('id, name, email, phone, organization, table_number, qr_code_url, id_number, event_id')
                  .eq('event_id', eventId)
                  .ilike('email', emailValue.trim())
                  .maybeSingle();
                if (dupByEmail) duplicateParticipant = dupByEmail;
              }
              
              // If not found in current event, search across all events (might be in different event)
              if (!duplicateParticipant) {
                const { data: allParticipants } = await supabaseAdmin
                  .from('participants')
                  .select('id, name, email, phone, organization, table_number, qr_code_url, id_number, event_id');
                
                if (allParticipants) {
                  const normalizedId = idNumberValue?.trim().toLowerCase();
                  const normalizedEmail = emailValue?.trim().toLowerCase();
                  
                  if (normalizedId) {
                    const found = allParticipants.find(p => 
                      p.id_number && p.id_number.trim().toLowerCase() === normalizedId
                    );
                    if (found) duplicateParticipant = found;
                  }
                  
                  if (!duplicateParticipant && normalizedEmail) {
                    const found = allParticipants.find(p => 
                      p.email && p.email.trim().toLowerCase() === normalizedEmail
                    );
                    if (found) duplicateParticipant = found;
                  }
                }
              }
              
              if (duplicateParticipant) {
                // Found the duplicate - update it if it's in the same event
                if (duplicateParticipant.event_id === eventId) {
                  isUpdate = true;
                  const updateData: any = {};
                  if (nameValue) updateData.name = nameValue;
                  if (emailValue) updateData.email = emailValue;
                  if (idNumberValue && (!duplicateParticipant.id_number || duplicateParticipant.id_number !== idNumberValue)) {
                    updateData.id_number = idNumberValue;
                  }
                  if (phoneValue) updateData.phone = phoneValue;
                  if (organizationValue) updateData.organization = organizationValue;
                  if (tableNumber !== null) updateData.table_number = tableNumber;
                  
                  const { data: updatedParticipant, error: updateError } = await supabaseAdmin
                    .from('participants')
                    .update(updateData)
                    .eq('id', duplicateParticipant.id)
                    .select()
                    .single();
                  
                  if (updateError) {
                    // If update fails, just skip - participant already exists
                    results.updated++;
                    continue;
                  }
                  
                  participant = updatedParticipant;
                  
                  // Regenerate QR code if needed
                  if (!participant.qr_code_url || (duplicateParticipant.id_number !== idNumberValue && idNumberValue)) {
                    const qrPayload = idNumberValue || participant.id;
                    const qrCodeUrl = await generateQRCode(qrPayload, participant.id);
                    
                    const { error: qrUpdateError } = await supabaseAdmin
                      .from('participants')
                      .update({ qr_code_url: qrCodeUrl })
                      .eq('id', participant.id);
                    
                    if (!qrUpdateError) {
                      participant.qr_code_url = qrCodeUrl;
                    }
                  }
                } else {
                  // Duplicate exists in different event - we should still create it for this event
                  // However, the database constraint on email prevents this
                  // The user needs to run the migration to fix the constraint
                  console.log(`Row ${rowNum}: ⚠ Duplicate email found in DIFFERENT event. Attempting to create participant for current event anyway...`);
                  console.log(`Row ${rowNum}: Note: If this fails, you need to run the database migration: database/fix_participants_email_constraint.sql`);
                  
                  // Try to create the participant anyway - it will fail if constraint isn't fixed, but at least we try
                  // The error will be caught and handled below
                  const { data: newParticipantForEvent, error: insertErrorForEvent } = await supabaseAdmin
                    .from('participants')
                    .insert(insertData)
                    .select()
                    .single();
                  
                  if (newParticipantForEvent) {
                    console.log(`Row ${rowNum}: ✓ Successfully created participant in current event despite duplicate in different event`);
                    participant = newParticipantForEvent;
                    isUpdate = false;
                    
                    // Generate QR code
                    const qrPayload = idNumberValue || participant.id;
                    const qrCodeUrl = await generateQRCode(qrPayload, participant.id);
                    const { error: qrUpdateError } = await supabaseAdmin
                      .from('participants')
                      .update({ qr_code_url: qrCodeUrl })
                      .eq('id', participant.id);
                    if (!qrUpdateError) {
                      participant.qr_code_url = qrCodeUrl;
                    }
                  } else if (insertErrorForEvent) {
                    // Still failed due to constraint - provide helpful error
                    console.log(`Row ${rowNum}: ✗ Still cannot create - database constraint prevents same email in different events`);
                    console.log(`Row ${rowNum}: Please run migration: database/fix_participants_email_constraint.sql`);
                    results.failed++;
                    results.errors.push(`Row ${rowNum}: Cannot create participant - email "${emailValue}" exists in another event. Please run database migration to allow same email in different events.`);
                    continue;
                  }
                }
              } else {
                // Duplicate error but we couldn't find the participant in this event
                // This could mean:
                // 1. The duplicate is in a different event (which is allowed - same person can be in multiple events)
                // 2. There's a database constraint issue
                // 3. The participant exists but our search didn't find it
                
                // Try to get more info about the constraint violation
                console.log(`Row ${rowNum}: Duplicate error but participant not found in event ${eventId}. Error: ${insertError.message}`);
                
                // Check if there's a unique constraint on id_number or email globally
                // If so, we need to handle it differently
                // For now, mark as failed with detailed error
                results.failed++;
                results.errors.push(`Row ${rowNum}: Duplicate entry detected. ID: "${idNumberValue}", Email: "${emailValue}". The participant may already exist in another event or there's a database constraint preventing creation.`);
                continue;
              }
            } else {
              // Other insert error
              results.failed++;
              let errorMsg = insertError.message;
              if (insertError.code === '23502') {
                errorMsg = `Missing required field: ${insertError.message}`;
              }
              results.errors.push(`Row ${rowNum}: ${errorMsg}`);
              continue;
            }
          } else if (newParticipant) {
            // Insert was successful - create new participant
            console.log(`Row ${rowNum}: ✓✓✓ Insert SUCCESS - Created participant with ID: ${newParticipant.id}, Name: ${newParticipant.name}`);
            console.log(`Row ${rowNum}: Full participant data:`, JSON.stringify(newParticipant, null, 2));
            participant = newParticipant;
            isUpdate = false; // Ensure this is set to false for new participants
            
            // Generate and upload QR code for newly created participants
            const qrPayload = idNumberValue || participant.id;
            console.log(`Row ${rowNum}: Generating QR code with payload: ${qrPayload}`);
            const qrCodeUrl = await generateQRCode(qrPayload, participant.id);

            // Update participant with QR code URL
            const { error: qrUpdateError } = await supabaseAdmin
              .from('participants')
              .update({ qr_code_url: qrCodeUrl })
              .eq('id', participant.id);

            if (qrUpdateError) {
              console.log(`Row ${rowNum}: ✗ QR code generation failed:`, qrUpdateError.message);
              results.failed++;
              results.errors.push(`Row ${rowNum}: Failed to generate QR code - ${qrUpdateError.message}`);
              continue;
            }

            participant.qr_code_url = qrCodeUrl;
            console.log(`Row ${rowNum}: ✓ QR code generated and saved successfully`);
          } else {
            // Neither error nor participant - this shouldn't happen
            console.error(`Row ${rowNum}: ⚠ Unexpected state - insert returned no error but also no participant data`);
            results.failed++;
            results.errors.push(`Row ${rowNum}: Failed to create participant - insert returned no data`);
            continue;
          }
        }

        // Only count and add if we have a participant
        if (participant) {
          if (isUpdate) {
            results.updated++;
            console.log(`Row ${rowNum}: ✓ Counted as UPDATED`);
          } else {
            results.success++;
            console.log(`Row ${rowNum}: ✓ Counted as CREATED (success count: ${results.success})`);
          }
          results.participants.push(participant);
          console.log(`Row ${rowNum}: ✓ Participant added to results array`);
        } else {
          // This shouldn't happen, but if it does, log it
          console.error(`Row ${rowNum}: ✗✗✗ CRITICAL: No participant created or updated. This should not happen.`);
          console.error(`Row ${rowNum}: State check - isUpdate: ${isUpdate}, participant exists: ${!!participant}`);
          results.failed++;
          results.errors.push(`Row ${rowNum}: Failed to create or update participant - no participant object was created`);
        }
        console.log(`Row ${rowNum}: ========== FINISHED PROCESSING ROW ==========`);
      } catch (error: any) {
        console.error(`Row ${rowNum}: ✗✗✗ EXCEPTION CAUGHT:`, error);
        console.error(`Row ${rowNum}: Exception stack:`, error.stack);
        results.failed++;
        const errorDetails = error.message || error.toString() || 'Unknown error';
        results.errors.push(`Row ${rowNum}: Exception - ${errorDetails}. Data: name="${nameValue}", email="${emailValue}", id_number="${idNumberValue}"`);
      }
    }

    revalidatePath(`/admin/events/${eventId}/dashboard/participants`);

    return {
      success: results.success > 0 || results.updated > 0,
      total: rows.length,
      created: results.success,
      updated: results.updated,
      failed: results.failed,
      errors: results.errors,
      participants: results.participants,
    };
  } catch (error: any) {
    console.error('Error bulk creating participants:', error);
    return { error: error.message || 'Failed to process file' };
  }
}

// Keep the old function name for backward compatibility
export async function bulkCreateParticipantsFromCSV(
  csvContent: string,
  eventId: string,
  showTableNumber: boolean = false
) {
  return bulkCreateParticipantsFromFile(csvContent, 'data.csv', eventId, showTableNumber);
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

