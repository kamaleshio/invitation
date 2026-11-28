import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://wpwostqcopjtawlwcyje.supabase.co';
const DEFAULT_SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indwd29zdHFjb3BqdGF3bHdjeWplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NTUyMTMxNiwiZXhwIjoyMTExMDk3MzE2fQ.Vg4oqUbiCOgsX6dcXGi6FFuz-Dvao6GMMXaex8qcApM';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, batch, guests, attendance_status, photo_url } = req.body || {};

  // 1. Validation
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Full name is required.' });
  }

  const cleanPhone = String(phone || '').replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    return res.status(400).json({ error: 'A valid 10-digit mobile number is required.' });
  }

  const cleanBatch = String(batch || 'XII - A').trim();
  const guestCount = Math.max(0, parseInt(String(guests || 0), 10) || 0);
  const status = ['Yes', 'Maybe', 'No'].includes(attendance_status) ? attendance_status : 'Yes';

  try {
    // Open / free registration for all classmates (no capacity cap)
    // 2. Prepare registration record
    let phoneToInsert = cleanPhone;
    const insertPayload: any = {
      name: name.trim(),
      phone: phoneToInsert,
      batch: cleanBatch,
      guests: guestCount,
      attendance_status: status,
      created_at: new Date().toISOString()
    };

    if (email && typeof email === 'string' && email.trim()) {
      insertPayload.email = email.trim();
    }

    if (photo_url && typeof photo_url === 'string') {
      insertPayload.photo_url = photo_url;
    }

    // 4. Insert into database
    let { data: inserted, error: insertError } = await supabase
      .from('registrations')
      .insert([insertPayload])
      .select()
      .single();

    // If duplicate phone constraint occurs in database, ensure every registration
    // creates a separate unique database record by adding a unique random suffix
    if (insertError && insertError.message?.includes('registrations_phone_key')) {
      phoneToInsert = `${cleanPhone}-${Math.floor(1000 + Math.random() * 9000)}`;
      insertPayload.phone = phoneToInsert;
      const retryResult = await supabase
        .from('registrations')
        .insert([insertPayload])
        .select()
        .single();
      inserted = retryResult.data;
      insertError = retryResult.error;
    }

    if (insertError) {
      console.error('Insert error (admin details):', insertError);
      return res.status(500).json({
        success: false,
        error: insertError.message || 'Database insert error'
      });
    }

    // 5. Fetch fresh post-registration count
    const newCount = currentCount + 1;
    const availableSlots = Math.max(0, MAX_CAPACITY - newCount);

    return res.status(200).json({
      success: true,
      data: inserted,
      stats: {
        totalRegistered: newCount,
        availableSlots,
        capacity: MAX_CAPACITY,
        isCapacityFull: newCount >= MAX_CAPACITY
      }
    });

  } catch (err: any) {
    console.error('Registration API error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
}
