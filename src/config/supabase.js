import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://rultxzglaxnojkoyzhnk.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1bHR4emdsYXhub2prb3l6aG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NjIwMjksImV4cCI6MjEwMTMzODAyOX0.PL8VgRtxC1oq-KR3vPennNEtiiKh0X6Ybii_ffeZ9tI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
