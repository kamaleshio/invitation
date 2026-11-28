import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://wpwostqcopjtawlwcyje.supabase.co';
const DEFAULT_SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indwd29zdHFjb3BqdGF3bHdjeWplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NTUyMTMxNiwiZXhwIjoyMTExMDk3MzE2fQ.Vg4oqUbiCOgsX6dcXGi6FFuz-Dvao6GMMXaex8qcApM';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Always disable caching for real-time live statistics
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Query database count of registered attendees (head: true is high-performance count query)
    const { count, error } = await supabase
      .from('registrations')
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.error('Database count query error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch registration count from database',
        details: error.message 
      });
    }

    const totalRegistered = count ?? 0;

    return res.status(200).json({
      configured: true,
      totalRegistered,
      capacity: null,
      isCapacityFull: false,
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    console.error('Stats endpoint error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
}
