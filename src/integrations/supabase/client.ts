// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tcprbwhefuhszypvrtqj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHJid2hlZnVoc3p5cHZydHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNjg1NzMsImV4cCI6MjA1OTc0NDU3M30.YpXNyik_e1E3fekDhCkXGk3S30Gt_05_4eDFbzUGywA";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);