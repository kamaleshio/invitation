import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://wpwostqcopjtawlwcyje.supabase.co';
const DEFAULT_SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indwd29zdHFjb3BqdGF3bHdjeWplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NTUyMTMxNiwiZXhwIjoyMTExMDk3MzE2fQ.Vg4oqUbiCOgsX6dcXGi6FFuz-Dvao6GMMXaex8qcApM';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Always disable caching for live admin synchronization
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // GET: Fetch all registered users from database without any user-specific filters
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error querying registrations from database:', error);
        return res.status(500).json({ success: false, error: error.message });
      }

      return res.status(200).json({
        success: true,
        count: data?.length || 0,
        data: data || []
      });
    } catch (err: any) {
      console.error('Registrations GET API error:', err);
      return res.status(500).json({ success: false, error: err?.message || 'Server error' });
    }
  }

  // PUT: Update a registration
  if (req.method === 'PUT') {
    const { id, ...updates } = req.body || {};
    if (!id) {
      return res.status(400).json({ success: false, error: 'Registration ID is required' });
    }

    try {
      const { data, error } = await supabase
        .from('registrations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating registration:', error);
        return res.status(500).json({ success: false, error: error.message });
      }

      return res.status(200).json({ success: true, data });
    } catch (err: any) {
      console.error('Registrations PUT API error:', err);
      return res.status(500).json({ success: false, error: err?.message || 'Server error' });
    }
  }

  // DELETE: Delete a registration by ID
  if (req.method === 'DELETE') {
    const id = (req.query?.id as string) || req.body?.id;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Registration ID is required' });
    }

    try {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting registration:', error);
        return res.status(500).json({ success: false, error: error.message });
      }

      return res.status(200).json({ success: true, message: 'Registration deleted successfully' });
    } catch (err: any) {
      console.error('Registrations DELETE API error:', err);
      return res.status(500).json({ success: false, error: err?.message || 'Server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
